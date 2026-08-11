import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// The label is visible now, so no tooltip: it would just repeat the text.
function MenuItem({
  href,
  name,
  children,
  isActive,
}: {
  href: string;
  name: string;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-accent font-medium text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
      )}
    >
      {children}
      {name}
    </Link>
  );
}

export default MenuItem;
