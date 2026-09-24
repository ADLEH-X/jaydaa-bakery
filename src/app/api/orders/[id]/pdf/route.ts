import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderInvoiceHtml } from '@/components/invoice-pdf-template';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import fs from 'fs';

export const dynamic = 'force-dynamic';

function getExecutablePath(): string {
  // Check common Windows browser locations
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chromePathX86 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edgePath64 = 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe';

  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(chromePathX86)) return chromePathX86;
  if (fs.existsSync(edgePath)) return edgePath;
  if (fs.existsSync(edgePath64)) return edgePath64;

  return '';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        cafe: true,
        items: {
          include: {
            recipe: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const html = renderInvoiceHtml(order);

    let executablePath = getExecutablePath();
    let isServerless = false;

    if (!executablePath) {
      // Fall back to sparticuz chromium for serverless/linux deployment
      try {
        executablePath = await chromium.executablePath();
        isServerless = true;
      } catch (err) {
        console.error('Failed to get chromium executable path:', err);
      }
    }

    if (!executablePath) {
      return NextResponse.json(
        { error: 'No browser executable found for PDF generation' },
        { status: 500 }
      );
    }

    const browser = await puppeteer.launch({
      args: isServerless
        ? chromium.args
        : [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none',
          ],
      defaultViewport: isServerless ? chromium.defaultViewport : { width: 1200, height: 800 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '14mm',
        right: '12mm',
        bottom: '14mm',
        left: '12mm',
      },
    });

    await browser.close();

    const responseBuffer = Buffer.from(pdfBuffer);

    return new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="invoice-${order.invoiceRef}.pdf"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error generating PDF invoice:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF bill', details: String(error) },
      { status: 500 }
    );
  }
}
