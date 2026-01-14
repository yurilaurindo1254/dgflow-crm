import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ModalProvider } from '@/contexts/modal-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DGFlow - CRM para Criativos',
  description: 'Gerencie seu negócio criativo em um só lugar.',
};

import { SettingsProvider } from '@/contexts/settings-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-black text-white`}>
        <SettingsProvider>
            <ModalProvider>
                {children}
            </ModalProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
