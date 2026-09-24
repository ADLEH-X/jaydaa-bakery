'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  BookOpen,
  Coffee,
  Receipt,
  PlusCircle,
  Wheat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/cost-library', label: 'Cost Library', icon: Package },
    { href: '/recipes', label: 'Recipe Master', icon: BookOpen },
    { href: '/cafes', label: 'Cafe CRM', icon: Coffee },
    { href: '/orders', label: 'Orders & Bills', icon: Receipt },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-bakery-border bg-[#ffffff]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bakery-espresso text-bakery-gold shadow-sm group-hover:scale-105 transition-transform">
              <Wheat className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-wider text-bakery-espresso text-base uppercase">
                  Jaydaa
                </span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-bakery-goldLight text-bakery-espresso">
                  Ops Engine
                </span>
              </div>
              <p className="text-[10px] text-bakery-muted -mt-0.5 font-medium">
                B2B Bakery Operations
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-bakery-espresso text-[#f7e8d0] shadow-sm'
                      : 'text-bakery-muted hover:text-bakery-espresso hover:bg-bakery-cream'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/orders/new">
            <Button variant="gold" size="sm" className="gap-1.5 font-semibold shadow">
              <PlusCircle className="h-4 w-4" />
              <span>New Order</span>
            </Button>
          </Link>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="flex md:hidden border-t border-bakery-border/50 bg-bakery-cream/50 px-2 py-1.5 overflow-x-auto gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors',
                isActive
                  ? 'bg-bakery-espresso text-[#f7e8d0]'
                  : 'text-bakery-muted hover:text-bakery-espresso hover:bg-white'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
