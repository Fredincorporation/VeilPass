import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import { Header } from '@/components/Header';
import { WalletGuard } from '@/components/WalletGuard';
import { ToastContainer } from '@/components/ToastContainer';
import './globals.css';

export const metadata: Metadata = {
  title: 'VeilPass - The Private Way to Public Events',
  description: 'Encrypted ticketing dApp with blind auctions and privacy-preserving pricing on Base Sepolia.',
  keywords: ['tickets', 'privacy', 'encrypted', 'blockchain', 'events', 'Zama', 'fhEVM'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white dark:bg-black text-black dark:text-white transition-colors">
        <Providers>
          <ToastContainer>
            <Header />
            <WalletGuard>
              <main className="pt-20">
                {children}
              </main>
            </WalletGuard>
          </ToastContainer>
        </Providers>
      </body>
    </html>
  );
}
