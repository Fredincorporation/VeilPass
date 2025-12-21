"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[2]) : null;
}

export default function RoleGuard({ requiredRole, children }: { requiredRole: 'admin' | 'seller' | 'customer'; children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const role = readCookie('veilpass_role');
    if (!role || role !== requiredRole) {
      const from = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.replace(`/restricted?required=${requiredRole}&from=${encodeURIComponent(from)}`);
    }
  }, [requiredRole, router]);

  return <>{children}</>;
}
