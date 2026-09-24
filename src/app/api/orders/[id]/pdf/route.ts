import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderInvoiceHtml } from '@/components/invoice-pdf-template';
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

    const format = request.nextUrl.searchParams.get('format');

    // On Vercel serverless (where headless Linux Chrome requires missing system libs like libnss3.so)
    // or when format=html is requested, return the pixel-perfect interactive printable invoice view.
    // The browser natively handles high-DPI rendering and "Save as PDF" instantly.
    if (process.env.VERCEL || format === 'html') {
      const html = renderInvoiceHtml(order, true);
      return new NextResponse(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // On local machine with Chrome/Edge available, attempt Puppeteer PDF generation
    const executablePath = getExecutablePath();
    if (executablePath) {
      try {
        const puppeteer = (await import('puppeteer-core')).default;
        const browser = await puppeteer.launch({
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--font-render-hinting=none',
          ],
          defaultViewport: { width: 1200, height: 800 },
          executablePath,
          headless: true,
        });

        const html = renderInvoiceHtml(order, false);
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '12mm',
            right: '12mm',
            bottom: '12mm',
            left: '12mm',
          },
        });

        await browser.close();

        return new NextResponse(Buffer.from(pdfBuffer), {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `inline; filename="invoice-${order.invoiceRef}.pdf"`,
            'Cache-Control': 'no-cache',
          },
        });
      } catch (puppeteerErr) {
        console.warn('Puppeteer generation failed, falling back to direct printable invoice:', puppeteerErr);
      }
    }

    // Fallback: Return clean interactive printable HTML invoice
    const html = renderInvoiceHtml(order, true);
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error serving invoice:', error);
    return NextResponse.json(
      { error: 'Failed to display invoice', details: String(error) },
      { status: 500 }
    );
  }
}
