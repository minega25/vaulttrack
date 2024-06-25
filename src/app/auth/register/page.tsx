import Image from 'next/image';
import Signup from '@/components/Signup';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <section className="flex flex-col items-center space-y-8">
        <Image src="/logo.svg" alt="Logo" width={50} height={50} />
        <h1 className="text-4xl font-bold">Welcome to VaultTrack</h1>
        <p className="text-lg text-center">
          A simple inventory management system for your business.
        </p>
        <Signup />
      </section>
    </main>
  );
}
