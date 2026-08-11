'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);
  const { toast } = useToast();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast({
          title: 'Authentication failed',
          description: data.error || 'Please check your email and password.',
          variant: 'destructive',
        });
        return;
      }

      // The session lives in an httpOnly cookie, so refresh() is what makes
      // the server components pick it up before we land on the dashboard.
      const next = searchParams.get('next') || '/dashboard';
      router.push(next);
      router.refresh();
    } catch {
      toast({
        title: 'Authentication failed',
        description: 'Could not reach the server. Is PocketBase running?',
        variant: 'destructive',
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in...' : 'Sign in'}
          </Button>
        </CardFooter>
      </form>
      <div className="text-sm p-6 text-center">
        Don&apos;t have an account yet!{' '}
        <Link href="/auth/register" className="underline">
          Register Business
        </Link>
      </div>
    </Card>
  );
}
