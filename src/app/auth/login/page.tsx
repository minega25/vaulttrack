import Image from 'next/image';
import Login from '@/components/Login';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <section className="flex flex-col items-center space-y-8">
        <Image src="/logo.svg" alt="Logo" width={200} height={200} />
        <h1 className="text-4xl font-bold">Welcome to VaultTrack</h1>
        <p className="text-lg text-center">
          A simple inventory management system for your business.
        </p>
        <Login />
      </section>
    </main>
  );
}
