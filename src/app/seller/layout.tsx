import React from 'react';
import RoleGuard from '@/components/RoleGuard';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard requiredRole="seller">
      {children}
    </RoleGuard>
  );
}
