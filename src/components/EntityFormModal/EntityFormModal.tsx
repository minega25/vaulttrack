'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Radix Select forbids an empty-string item value, so optional relations use
// this sentinel in the form and get mapped back to '' before submitting.
export const NONE = '__none__';

/** `hint` is shown muted beside the label and is searchable too, so a
 *  product can be found by SKU as well as by name. */
export type Option = { value: string; label: string; hint?: string };

export type FieldSpec = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'combobox';
  placeholder?: string;
  description?: string;
  options?: Option[];
  /** Combobox only: replaces the default 'No match.' empty state. */
  emptyText?: string;
  /** Span both columns. For free text that needs the room. */
  full?: boolean;
};

type Props = {
  title: string;
  description?: string;
  trigger: ReactNode;
  schema: z.ZodTypeAny;
  fields: FieldSpec[];
  defaultValues: Record<string, unknown>;
  submitTo: string;
  method?: 'POST' | 'PUT';
  submitLabel: string;
  successMessage: string;
  /** Runs after a successful save, with the created/updated record. */
  onSuccess?: (data: any) => void;
};

// A select with a filter box, for relation pickers that grow unbounded
// (products, customers). Its own component because each one needs its own
// open state, and the fields are rendered from a map.
function ComboboxField({
  spec,
  value,
  onChange,
}: {
  spec: FieldSpec;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = spec.options ?? [];
  const selected = options.find((option) => option.value === value);

  return (
    // modal, because a Popover inside a Dialog is otherwise click-through.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between font-normal',
              !selected && 'text-muted-foreground'
            )}
          >
            <span className="truncate">
              {selected?.label ?? spec.placeholder ?? 'Select'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={`Search ${spec.label.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>{spec.emptyText ?? 'No match.'}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // cmdk searches this string, not the child markup, so the
                  // hint is matchable. The id keeps same-named rows distinct.
                  value={`${option.label} ${option.hint ?? ''} ${option.value}`}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className="cursor-pointer gap-2"
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      option.value === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="truncate">{option.label}</span>
                  {option.hint && (
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function EntityFormModal({
  title,
  description,
  trigger,
  schema,
  fields,
  defaultValues,
  submitTo,
  method = 'POST',
  submitLabel,
  successMessage,
  onSuccess,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  });

  // Reopening after a cancelled edit should show the stored values again,
  // not whatever was half-typed last time.
  useEffect(() => {
    if (open) form.reset(defaultValues as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (values: Record<string, unknown>) => {
    setPending(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [k, v === NONE ? '' : v])
      );

      const res = await fetch(submitTo, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast({
          title: 'Something went wrong',
          description: data.error || 'The request was rejected.',
          variant: 'destructive',
        });
        return;
      }

      toast({ title: successMessage });
      setOpen(false);
      // Server components hold the table data, so refresh to show the change.
      router.refresh();
      onSuccess?.(data);
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'Could not reach the server.',
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Two columns from sm up; a single column on narrow screens.
                items-start keeps a field with helper text from stretching
                its neighbour in the same row. */}
            <div className="grid grid-cols-1 items-start gap-x-4 gap-y-5 sm:grid-cols-2">
              {fields.map((spec) => (
                <FormField
                  key={spec.name}
                  control={form.control}
                  name={spec.name as never}
                  render={({ field }) => (
                    <FormItem className={cn(spec.full && 'sm:col-span-2')}>
                      <FormLabel>{spec.label}</FormLabel>
                      {spec.type === 'combobox' ? (
                        <ComboboxField
                          spec={spec}
                          value={(field.value as string) || NONE}
                          onChange={field.onChange}
                        />
                      ) : spec.type === 'select' ? (
                        <Select
                          onValueChange={field.onChange}
                          value={(field.value as string) || NONE}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={spec.placeholder} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {spec.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input
                            type={spec.type === 'number' ? 'number' : spec.type}
                            placeholder={spec.placeholder}
                            {...field}
                            value={(field.value as string | number) ?? ''}
                          />
                        </FormControl>
                      )}
                      {spec.description && (
                        <FormDescription>{spec.description}</FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {pending ? 'Saving...' : submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
