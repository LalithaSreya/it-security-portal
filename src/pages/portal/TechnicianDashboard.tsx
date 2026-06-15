import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Survey, type Task } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  CheckSquare, 
  Wrench,
  ArrowRight,
  Loader2
} from 'lucide-react';

export default function TechnicianDashboard() {
  const { employee } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    assignedSurveys: 0,
    inProgressSurveys: 0,
    completedSurveys: 0,
    pendingTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTechData() {
      if (!employee?.id) return;
      setIsLoading(true);
      try {
        const [surveysRes, tasksRes] = await Promise.all([
          supabase.from('surveys').select('*').eq('assigned_technician', employee.id),
          supabase.from('tasks').select('*').eq('assigned_technician', employee.id),
        ]);

        const surveys: Survey[] = surveysRes.data || [];
        const tasks: Task[] = tasksRes.data || [];

        const assignedSurveys = surveys.filter(s => s.status === 'Assigned').length;
        const inProgressSurveys = surveys.filter(s => s.status === 'In Progress').length;
        
        // Completed/Approved count
        const completedSurveys = surveys.filter(
          s => s.status === 'Completed' || s.status === 'Approved'
        ).length;

        const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

        setStats({
          assignedSurveys,
          inProgressSurveys,
          completedSurveys,
          pendingTasks,
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
    <div className="space-y-6 max-w-md mx-auto">
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
          Here is your operational overview for today. Tap any card to open.
        </p>
      </div>

      {/* Grid of Large Cards */}
      <div className="grid grid-cols-1 gap-4">
        {/* Assigned Surveys */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-2"
          onClick={() => navigate('/portal/technician/surveys?tab=Assigned')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Assigned Surveys</h3>
                <p className="text-xs text-muted-foreground mt-0.5">New client sites to visit</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-blue-500 tracking-tight">{stats.assignedSurveys}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
        </Card>

        {/* Pending Surveys */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-2"
          onClick={() => navigate('/portal/technician/surveys?tab=In Progress')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">In Progress</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Active inspection drafts</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-500 tracking-tight">{stats.inProgressSurveys}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        </Card>

        {/* Completed Surveys */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-2"
          onClick={() => navigate('/portal/technician/surveys?tab=Completed')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Completed Surveys</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Finalized site observations</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-500 tracking-tight">{stats.completedSurveys}</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
        </Card>

        {/* Today's Tasks */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:border-primary/50 transition-all shadow-md group py-2"
          onClick={() => navigate('/portal/technician/tasks')}
        >
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Today's Tasks</h3>
                <p className="text-xs text-muted-foreground mt-0.5">General work assignments due</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-indigo-500 tracking-tight">{stats.pendingTasks}</span>
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
