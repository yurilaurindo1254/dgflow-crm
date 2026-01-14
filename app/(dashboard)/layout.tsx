import { Sidebar } from '@/components/sidebar';
import { MobileBottomBar } from '@/components/mobile-bottom-bar';
import { Toaster } from 'sonner';
import { DarkVeil } from '@/components/ui/dark-veil';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-transparent text-white relative">
      <DarkVeil />
      <div className="hidden md:block">
          <Sidebar />
      </div>
      <MobileBottomBar />
      <main className="flex-1 md:ml-20 p-4 md:p-8 transition-all duration-300 ease-in-out relative z-10 pb-24 md:pb-8">
        {children}
      </main>
      <Toaster position="bottom-right" theme="dark" closeButton richColors />
    </div>
  );
}
