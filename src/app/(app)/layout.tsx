import { AppSidebar } from '@/components/layout/app-sidebar';
import { CommandBarProvider } from '@/components/command-bar/command-bar-provider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CommandBarProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </CommandBarProvider>
  );
}
