'use client';
import { PlusCircle } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { RecordModel } from 'pocketbase';
import { useToast } from '../ui/use-toast';
import { DropdownMenuItem } from '../ui/dropdown-menu';

const productSchema = z.object({
  lead_time: z.coerce.number().int().positive(),
  name: z.string().min(1),
  unit_price: z.coerce.number().int().positive(),
  reorder_level: z.coerce.number().int().positive(),
  description: z.string().min(1),
  category_id: z.string(),
});

export default function Product({ id }: { id?: string }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<RecordModel[]>([]);
  const [open, setOpen] = useState<boolean>(false);
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      lead_time: 0,
      name: '',
      unit_price: 0,
      reorder_level: 0,
      description: '',
      category_id: '',
    },
  });

  useEffect(() => {
    fetchCategories();
    async function fetchCategories() {
      try {
        fetch('/api/categories')
          .then((res) => res.json())
          .then((data) => {
            setCategories(data);
          });
      } catch (err: any) {
        console.error(err);
      }
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          form.reset(data);
        });
    }
  }, [id, form]);

  const addProduct = async (values: z.infer<typeof productSchema>) => {
    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      toast({
        title: 'Product added successfully',
        description: 'The product has been added to your store.',
      });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to add product',
        description: 'An error occurred while adding the product.',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  const editProduct = async (values: z.infer<typeof productSchema>) => {
    try {
      const res = await fetch(`/api/products/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      toast({
        title: 'Product updated successfully',
        description: 'The product has been updated.',
      });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: 'Failed to update product',
        description: 'An error occurred while updating the product.',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  function onSubmit(values: z.infer<typeof productSchema>) {
    if (id) {
      editProduct(values);
    } else {
      addProduct(values);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {id ? (
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit
          </DropdownMenuItem>
        ) : (
          <Button size="sm" className="h-8 gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add Product
            </span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{id ? 'Edit' : 'Add'} Product</DialogTitle>
          {!id && (
            <DialogDescription>
              Add a new product to your store.
            </DialogDescription>
          )}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Macbook Pro 13" {...field} />
                  </FormControl>
                  <FormDescription>The name of the product.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="A laptop computer" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description of the product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit Price</FormLabel>
                  <FormControl>
                    <Input placeholder="1000" type="number" {...field} />
                  </FormControl>
                  <FormDescription>The price of the product.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reorder_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Level</FormLabel>
                  <FormControl>
                    <Input placeholder="10" type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The minimum quantity of the product that should be in stock.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Time</FormLabel>
                  <FormControl>
                    <Input placeholder="3" type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    The number of days it takes to restock the product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The category of the product.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{id ? 'Edit' : 'Add'} Product</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
