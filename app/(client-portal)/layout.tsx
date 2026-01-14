import { PortalSidebar } from '@/components/portal-sidebar';

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <PortalSidebar />
      <main className="flex-1 ml-64 p-8 transition-all duration-300 ease-in-out">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
