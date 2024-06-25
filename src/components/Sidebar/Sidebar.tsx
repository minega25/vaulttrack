'use client';
import Link from 'next/link';
import Img from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Home,
  LineChart,
  Package,
  Settings,
  ShoppingCart,
  Users2,
} from 'lucide-react';

import MenuItem from '../MenuItem';

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 	text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Img src="/logo.svg" width={20} height={20} alt="logo" />
          <span className="sr-only">VaultTrack</span>
        </Link>
        <MenuItem
          href="/dashboard"
          name="Dashboard"
          isActive={pathname === '/dashboard'}
        >
          <Home className="h-5 w-5" />
        </MenuItem>
        <MenuItem
          href="/dashboard/products"
          name="Products"
          isActive={pathname === '/dashboard/products'}
        >
          <Package className="h-5 w-5" />
        </MenuItem>
        <MenuItem
          href="/dashboard/orders"
          name="Orders"
          isActive={pathname === '/dashboard/orders'}
        >
          <ShoppingCart className="h-5 w-5" />
        </MenuItem>
        <MenuItem
          href="/dashboard/customers"
          name="Customers"
          isActive={pathname === '/dashboard/customers'}
        >
          <Users2 className="h-5 w-5" />
        </MenuItem>
        <MenuItem
          href="/dashboard/analytics"
          name="Analytics"
          isActive={pathname === '/dashboard/analytics'}
        >
          <LineChart className="h-5 w-5" />
        </MenuItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <MenuItem href="/settings" name="Settings">
          <Settings className="h-5 w-5" />
        </MenuItem>
      </nav>
    </aside>
  );
}

export default Sidebar;
