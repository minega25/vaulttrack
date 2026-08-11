import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// The dashboard layout already supplies the page background and sidebar
// offset, so this only handles the inner column.
export default function PageShell({
  crumb,
  title,
  description,
  action,
  children,
}: {
  crumb: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-col sm:gap-4 sm:py-4 sm:pl-60">
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Breadcrumb className="hidden md:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{crumb}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="grid gap-1">
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            {action}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}
