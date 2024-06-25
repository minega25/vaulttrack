import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 ${
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground'
          }`}
        >
          {children}
          <span className="sr-only">{name}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right">{name}</TooltipContent>
    </Tooltip>
  );
}

export default MenuItem;
