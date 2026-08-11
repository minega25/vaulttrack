'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [pending, setPending] = useState<boolean>(false);
  const { toast } = useToast();

  const fail = (description: string) =>
    toast({ title: 'Signup failed', description, variant: 'destructive' });

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      fail('Passwords do not match');
      return;
    }
    // PocketBase rejects shorter passwords server-side; catch it here so the
    // company record isn't created and rolled back for nothing.
    if (password.length < 8) {
      fail('Password must be at least 8 characters');
      return;
    }

    setPending(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          name,
          phone,
          confirmPassword,
          firstName,
          lastName,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        fail(data.error || 'Failed to create company account');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      fail('Could not reach the server. Is PocketBase running?');
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Signup</CardTitle>
        <CardDescription>
          Enter your company details below to signup for an account.
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="John"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Doe"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Fancy Company"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
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
            <Label htmlFor="phone">Contact Phone</Label>
            <Input
              id="phone"
              type="text"
              placeholder="+250 788 888 888"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              required
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating account...' : 'Register'}
          </Button>
        </CardFooter>
      </form>
      <div className="text-sm p-6 text-center">
        Already have an account!{' '}
        <Link href="/auth/login" className="underline">
          Login
        </Link>
      </div>
    </Card>
  );
}
