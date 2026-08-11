import { redirect } from 'next/navigation';

// Middleware already gates this route; anyone who reaches it has a session.
export default function Home() {
  redirect('/dashboard');
}
