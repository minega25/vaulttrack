'use client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <button
      onClick={logout}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
    >
      <LogOut className="h-5 w-5 shrink-0" />
      Log out
    </button>
  );
}

export default LogoutButton;
