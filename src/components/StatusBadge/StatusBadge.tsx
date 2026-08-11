import { Badge } from '@/components/ui/badge';

// draft/confirmed are in progress, delivered is the happy ending, cancelled
// is not; shipped sits in between and reads as active.
const VARIANTS: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  draft: 'secondary',
  confirmed: 'outline',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={VARIANTS[status] ?? 'outline'} className="capitalize">
      {status}
    </Badge>
  );
}
