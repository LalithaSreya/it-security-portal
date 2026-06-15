import { useEffect, useState } from 'react';
import { 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileClock,
  ArrowRight,
  TrendingUp,
  UserCheck,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Task, type Employee, type Lead } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TechPerformance {
  id: string;
  name: string;
  assigned: number;
  completed: number;
  pending: number;
  rate: number;
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    assignedTasks: 0,
    inProgressTasks: 0,
    pendingVerification: 0,
    completedTasks: 0,
    activeTechnicians: 0,
    emergencyTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [techPerformances, setTechPerformances] = useState<TechPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        // Fetch tasks, employees, and leads
        const [tasksRes, employeesRes, leadsRes] = await Promise.all([
          supabase.from('tasks').select('*'),
          supabase.from('employees').select('*'),
          supabase.from('leads').select('*'),
        ]);

        const tasks: Task[] = tasksRes.data || [];
        const employees: Employee[] = employeesRes.data || [];
        const leads: Lead[] = leadsRes.data || [];

        // 1. Calculate stats
        const totalRequests = leads.length;
        const assignedTasks = tasks.filter(t => t.status === 'Assigned').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const pendingVerification = tasks.filter(t => t.status === 'Pending Verification').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        const activeTechnicians = employees.filter(e => e.role === 'Technician' && e.status === 'Active').length;
        
        // Emergency tasks that are not completed
        const emergencyTasks = tasks.filter(
          t => t.priority === 'Emergency' && t.status !== 'Completed'
        ).length;

        setStats({
          totalRequests,
          assignedTasks,
          inProgressTasks,
          pendingVerification,
          completedTasks,
          activeTechnicians,
          emergencyTasks,
        });

        // 2. Calculate Technician Performance Metrics
        const technicians = employees.filter(e => e.role === 'Technician' && e.status === 'Active');
        const performanceData: TechPerformance[] = technicians.map(tech => {
          const techTasks = tasks.filter(t => t.assigned_technician === tech.id);
          const assigned = techTasks.filter(t => t.status === 'Assigned').length;
          const completed = techTasks.filter(t => t.status === 'Completed').length;
          const pending = techTasks.filter(t => t.status === 'In Progress' || t.status === 'Pending Verification').length;
          const total = techTasks.length;
          const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            id: tech.id,
            name: tech.employee_name,
            assigned,
            completed,
            pending,
            rate
          };
        });

        setTechPerformances(performanceData);

        // 3. Sort tasks to get latest 5, putting emergency first if active
        const sortedTasks = [...tasks].sort((a, b) => {
          // Put active emergency tasks first
          if (a.priority === 'Emergency' && a.status !== 'Completed' && b.priority !== 'Emergency') return -1;
          if (b.priority === 'Emergency' && b.status !== 'Completed' && a.priority !== 'Emergency') return 1;
          // Then sort by creation time
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setRecentTasks(sortedTasks.slice(0, 5));
      } catch (err) {
        console.error('Error fetching manager dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'Medium': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'High': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Emergency': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'In Progress': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Pending Verification': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-72 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-2 animate-pulse h-96"></Card>
          <Card className="animate-pulse h-96"></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time visibility into task lifecycle, field workforce completion, and emergency dispatches.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {/* Total Requests */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Requests
            </CardTitle>
            <FileText className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalRequests}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Customer dispatches</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-400"></div>
        </Card>

        {/* Assigned Tasks */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Open Tasks
            </CardTitle>
            <UserCheck className="h-4.5 w-4.5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-blue-500">{stats.assignedTasks}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Awaiting dispatch</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </Card>

        {/* In Progress Tasks */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              In Progress
            </CardTitle>
            <Clock className="h-4.5 w-4.5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-500">{stats.inProgressTasks}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active field work</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </Card>

        {/* Pending Verification */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Review
            </CardTitle>
            <FileClock className="h-4.5 w-4.5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-purple-500">{stats.pendingVerification}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </Card>

        {/* Completed Tasks */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-500">{stats.completedTasks}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Closed successfully</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </Card>

        {/* Active Technicians */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Techs
            </CardTitle>
            <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-indigo-500">{stats.activeTechnicians}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active field workforce</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </Card>

        {/* Emergency Tasks */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md border-rose-500/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              Emergency
            </CardTitle>
            <AlertTriangle className="h-4.5 w-4.5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-rose-500">{stats.emergencyTasks}</div>
            <p className="text-[10px] text-rose-500/70 mt-1">Critical alerts</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>
        </Card>
      </div>

      {/* Main Dashboard Rows */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Active Tasks Queue</CardTitle>
              <CardDescription>Latest operational tasks matching current dispatches</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/portal/manager/tasks">
                View All Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Task Title</th>
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Priority</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-foreground truncate max-w-[200px]" title={task.task_title}>
                          {task.task_title}
                        </td>
                        <td className="px-6 py-3.5 text-muted-foreground">{task.customer_name}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-muted-foreground font-semibold">
                          {new Date(task.due_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No tasks found in database. Create one to get started!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Technician Performance Metrics */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-1.5">
              <TrendingUp className="h-5 w-5 text-primary" />
              Technician Metrics
            </CardTitle>
            <CardDescription>Simple operational metrics for active technicians</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-3">Technician</th>
                    <th className="px-4 py-3 text-center">Assigned</th>
                    <th className="px-4 py-3 text-center">Done</th>
                    <th className="px-4 py-3 text-center">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {techPerformances.length > 0 ? (
                    techPerformances.map((tech) => (
                      <tr key={tech.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{tech.name}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground font-medium">{tech.assigned + tech.pending}</td>
                        <td className="px-4 py-3 text-center text-emerald-500 font-bold">{tech.completed}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold ${
                            tech.rate >= 80 
                              ? 'bg-emerald-500/10 text-emerald-500' 
                              : tech.rate >= 50 
                                ? 'bg-amber-500/10 text-amber-500' 
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {tech.rate}%
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                        No active technicians found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
