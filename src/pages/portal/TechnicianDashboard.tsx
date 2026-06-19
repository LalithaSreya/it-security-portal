import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Task } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle2, 
  CheckSquare, 
  Wrench,
  ArrowRight,
  Loader2,
  FileClock
} from 'lucide-react';

export default function TechnicianDashboard() {
  const { employee } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    assignedTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    todaysTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTechData() {
      if (!employee?.id) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_technician', employee.id);

        if (error) throw error;

        const tasks: Task[] = data || [];
        const todayStr = new Date().toISOString().split('T')[0];

        const assignedTasks = tasks.filter(t => t.status === 'Assigned').length;
        const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
        const completedTasks = tasks.filter(t => t.status === 'Completed').length;
        
        // Today's tasks are pending/in progress tasks due today
        const todaysTasks = tasks.filter(
          t => t.due_date === todayStr && t.status !== 'Completed'
        ).length;

        setStats({
          assignedTasks,
          inProgressTasks,
          completedTasks,
          todaysTasks,
        });
      } catch (err) {
        console.error('Error fetching technician dashboard metrics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTechData();
  }, [employee]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Welcome Header */}
      <div className="flex flex-col gap-1 py-2">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold text-primary tracking-wider uppercase">Field Work Center</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Hello, {employee?.employee_name || 'Technician'}
        </h1>
        <p className="text-xs text-muted-foreground">
          Here is your task overview for today. Tap any card to open your tasks list.
        </p>
      </div>

      {/* Grid of Large Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assigned Tasks */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-1"
          onClick={() => navigate('/portal/technician/tasks?status=Assigned')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Assigned Tasks</h3>
                <p className="text-xs text-muted-foreground mt-0.5">New jobs waiting to start</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-blue-500 tracking-tight">{stats.assignedTasks}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
        </Card>

        {/* In Progress Tasks */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-1"
          onClick={() => navigate('/portal/technician/tasks?status=In_Progress')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">In Progress</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Active field installations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-500 tracking-tight">{stats.inProgressTasks}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        </Card>

        {/* Completed Tasks */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-1"
          onClick={() => navigate('/portal/technician/tasks?status=Completed')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Completed</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Resolved and verified tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-500 tracking-tight">{stats.completedTasks}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
        </Card>

        {/* Today's Tasks */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-1"
          onClick={() => navigate('/portal/technician/tasks?due=today')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                <FileClock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Today's Tasks</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Jobs due for completion today</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-500 tracking-tight">{stats.todaysTasks}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <div className="pt-2">
        <Button 
          className="w-full text-sm font-bold py-6 cursor-pointer"
          onClick={() => navigate('/portal/technician/submit-report')}
        >
          Submit General Report
        </Button>
      </div>
    </div>
  );
}
