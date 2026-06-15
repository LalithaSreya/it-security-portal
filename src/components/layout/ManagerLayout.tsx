import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import ManagerSidebar from './ManagerSidebar';

export default function ManagerLayout() {
  const { user, employee, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-muted-foreground">Verifying access credentials...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/portal/login" replace />;
  }

  // Route Guard: Block access if employee is not a Manager
  if (employee && employee.role !== 'Manager') {
    console.warn('Unauthorized access blocked. Redirecting to technician workspace...');
    return <Navigate to="/portal/technician/dashboard" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 dark:border-slate-800 md:block shrink-0 h-full">
        <ManagerSidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-850 bg-card px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Nav Trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <ManagerSidebar onCloseMobile={() => setMobileOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Title / Brand */}
            <h2 className="text-base font-bold text-foreground tracking-tight flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Secure IT Workspace
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {employee && (
              <div className="hidden items-center gap-2 rounded-full border border-border bg-muted/40 px-3.5 py-1 text-xs font-semibold sm:flex text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{employee.employee_name} ({employee.role})</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950/40">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
