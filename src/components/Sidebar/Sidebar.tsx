'use client';
import Link from 'next/link';
import Img from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  Boxes,
  Home,
  Package,
  ReceiptText,
  Tags,
  Truck,
  UsersRound,
  Warehouse,
} from 'lucide-react';

import MenuItem from '../MenuItem';
import LogoutButton from '../LogoutButton';

const LINKS = [
  { href: '/dashboard', name: 'Dashboard', Icon: Home },
  { href: '/dashboard/products', name: 'Products', Icon: Package },
  { href: '/dashboard/categories', name: 'Categories', Icon: Tags },
  { href: '/dashboard/inventory', name: 'Inventory', Icon: Boxes },
  { href: '/dashboard/movements', name: 'Movements', Icon: ArrowLeftRight },
  { href: '/dashboard/sales', name: 'Sales', Icon: ReceiptText },
  { href: '/dashboard/customers', name: 'Customers', Icon: UsersRound },
  { href: '/dashboard/warehouses', name: 'Warehouses', Icon: Warehouse },
  { href: '/dashboard/suppliers', name: 'Suppliers', Icon: Truck },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Img src="/logo.svg" width={22} height={22} alt="" />
          <span className="font-semibold">VaultTrack</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {LINKS.map(({ href, name, Icon }) => (
          <MenuItem
            key={href}
            href={href}
            name={name}
            // Only /dashboard is an exact match; the rest own their subpages
            // so /dashboard/sales/<id> still highlights Sales.
            isActive={
              href === '/dashboard'
                ? pathname === href
                : pathname.startsWith(href)
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
          </MenuItem>
        ))}
      </nav>

      <div className="shrink-0 border-t p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}

export default Sidebar;
