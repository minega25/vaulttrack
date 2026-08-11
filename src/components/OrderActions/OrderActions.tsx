'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

const LABELS: Record<string, string> = {
  draft: 'Move back to draft',
  confirmed: 'Confirm order',
  delivered: 'Mark delivered',
  cancelled: 'Cancel order',
};

export default function OrderActions({
  orderId,
  status,
  transitions,
  canShip,
}: {
  orderId: string;
  status: string;
  transitions: string[];
  canShip: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState<string | null>(null);
  const [shipOpen, setShipOpen] = useState(false);

  const call = async (url: string, init: RequestInit, key: string) => {
    setPending(key);
    try {
      const res = await fetch(url, init);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: 'That did not work',
          description: data.error || 'The request was rejected.',
          variant: 'destructive',
        });
        return false;
      }
      router.refresh();
      return true;
    } catch {
      toast({
        title: 'That did not work',
        description: 'Could not reach the server.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setPending(null);
    }
  };

  const changeStatus = (next: string) =>
    call(
      `/api/sales/${orderId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      },
      next
    ).then((ok) => {
      if (ok) toast({ title: `Order ${next}` });
    });

  const ship = async () => {
    const ok = await call(
      `/api/sales/${orderId}/ship`,
      { method: 'POST' },
      'ship'
    );
    if (ok) {
      setShipOpen(false);
      toast({ title: 'Order shipped', description: 'Stock has been deducted.' });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {transitions.map((next) => (
        <Button
          key={next}
          size="sm"
          variant={next === 'cancelled' ? 'outline' : 'secondary'}
          disabled={pending !== null}
          onClick={() => changeStatus(next)}
        >
          {pending === next ? 'Working...' : LABELS[next] ?? next}
        </Button>
      ))}

      {canShip && (
        <Button size="sm" className="gap-1" onClick={() => setShipOpen(true)}>
          <Truck className="h-3.5 w-3.5" />
          Ship order
        </Button>
      )}

      <Dialog open={shipOpen} onOpenChange={setShipOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ship this order?</DialogTitle>
            <DialogDescription>
              A stock-out movement is recorded for every line and stock is
              deducted from the order&apos;s warehouse. The lines can no longer
              be edited afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShipOpen(false)}>
              Cancel
            </Button>
            <Button onClick={ship} disabled={pending === 'ship'}>
              {pending === 'ship' ? 'Shipping...' : 'Ship order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
