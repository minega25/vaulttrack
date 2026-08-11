'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

type Props = {
  endpoint: string;
  label: string;
  /** Name shown in the confirmation copy, e.g. the product's name. */
  subject: string;
  /** Extra consequence to spell out before confirming, if there is one. */
  warning?: string;
};

// Rendered inside a DropdownMenu, so the dialog is controlled separately and
// the menu item only flips the open state.
export default function DeleteAction({
  endpoint,
  label,
  subject,
  warning,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const confirm = async () => {
    setPending(true);
    try {
      const res = await fetch(endpoint, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: `Failed to delete ${label}`,
          description: data.error || 'The request was rejected.',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: `${subject} deleted` });
      setOpen(false);
      router.refresh();
    } catch {
      toast({
        title: `Failed to delete ${label}`,
        description: 'Could not reach the server.',
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <DropdownMenuItem
        onSelect={(event) => {
          event.preventDefault();
          setOpen(true);
        }}
      >
        Delete
      </DropdownMenuItem>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete {label}?</DialogTitle>
            <DialogDescription>
              {subject} will be permanently removed. This cannot be undone.
              {warning ? ` ${warning}` : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirm}
              disabled={pending}
            >
              {pending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
