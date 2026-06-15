import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Contact2, 
  ShieldCheck, 
  LogOut, 
  Menu,
  ChevronRight,
  User,
  Globe
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function PortalLayout() {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/portal/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'Manager', 'Technician'],
    },
    {
      name: 'Leads',
      path: '/portal/leads',
      icon: Contact2,
      roles: ['Admin', 'Manager', 'Technician'],
    },
    {
      name: 'Customers',
      path: '/portal/customers',
      icon: Users,
      roles: ['Admin', 'Manager', 'Technician'],
    },
    {
      name: 'Employees',
      path: '/portal/employees',
      icon: UserCheck,
      roles: ['Manager'], // Hidden for Technician
    },
    {
      name: 'Company Info',
      path: '/about-us',
      icon: Globe,
      roles: ['Manager', 'Technician'],
    },
  ];

  // Filter items based on user role
  const visibleItems = menuItems.filter(
    (item) => employee && item.roles.includes(employee.role)
  );

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-100 dark:bg-slate-950">
      <div className="px-4 py-6">
        {/* Brand */}
        <Link to="/portal/dashboard" className="flex items-center gap-3 px-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white leading-none">SECURE IT</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Portal</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-0 transition-opacity hover:opacity-100" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer */}
      <div className="border-t border-slate-800 p-4">
        {employee && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-200">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-200">{employee.employee_name}</p>
              <p className="truncate text-xs text-slate-400 font-medium">{employee.role}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-400 hover:bg-slate-850 hover:text-slate-100"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-slate-200 dark:border-slate-800 md:block shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-850 bg-card px-6">
          <div className="flex items-center gap-4">
            {/* Mobile Nav Button */}
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
                {sidebarContent}
              </SheetContent>
            </Sheet>

            {/* Current Context Title */}
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Secure IT Portal
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

        {/* Dashboard Body Page */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950/40">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
