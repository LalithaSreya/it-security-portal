import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  LogOut, 
  ChevronRight,
  User,
  ClipboardList,
  CheckSquare,
  FileText
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface TechnicianSidebarProps {
  onCloseMobile?: () => void;
}

export default function TechnicianSidebar({ onCloseMobile }: TechnicianSidebarProps) {
  const { employee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/portal/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/portal/technician/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'My Surveys',
      path: '/portal/technician/surveys',
      icon: ClipboardList,
    },
    {
      name: 'My Tasks',
      path: '/portal/technician/tasks',
      icon: CheckSquare,
    },
    {
      name: 'Submit Report',
      path: '/portal/technician/submit-report',
      icon: FileText,
    },
    {
      name: 'Profile',
      path: '/portal/technician/profile',
      icon: User,
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between bg-slate-900 text-slate-100 dark:bg-slate-950">
      <div className="px-4 py-6">
        {/* Brand */}
        <Link to="/portal/technician/dashboard" className="flex items-center gap-3 px-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white leading-none">SECURE IT</h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Field Workspace</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
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
          className="w-full justify-start gap-3 text-slate-400 hover:bg-slate-850 hover:text-slate-100 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
