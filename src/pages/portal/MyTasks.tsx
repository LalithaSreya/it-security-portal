import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Task } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckSquare, 
  Calendar, 
  Clock,
  Loader2,
  ListTodo,
  MapPin,
  Phone,
  ArrowRight,
  Filter
} from 'lucide-react';

export default function MyTasks() {
  const { employee } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Read initial filter from URL or default to 'all'
  const statusParam = searchParams.get('status');
  const dueParam = searchParams.get('due');
  
  const [statusFilter, setStatusFilter] = useState<string>(
    statusParam ? statusParam.replace('_', ' ') : 'all'
  );
  const [dueFilter, setDueFilter] = useState<boolean>(dueParam === 'today');

  const fetchTasks = async () => {
    if (!employee?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_technician', employee.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error loading technician tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [employee]);

  // Sync state filters with URL query parameters
  useEffect(() => {
    const params: Record<string, string> = {};
    if (statusFilter !== 'all') {
      params.status = statusFilter.replace(' ', '_');
    }
    if (dueFilter) {
      params.due = 'today';
    }
    setSearchParams(params);
  }, [statusFilter, dueFilter, setSearchParams]);

  // Apply filters in memory
  const filteredTasks = tasks.filter((task) => {
    // Status Filter
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    // Due Date Filter (Today)
    if (dueFilter) {
      const todayStr = new Date().toISOString().split('T')[0];
      if (task.due_date !== todayStr || task.status === 'Completed') {
        return false;
      }
    }
    return true;
  });

  const getPriorityBadgeColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-red-500 hover:bg-red-600 text-white animate-pulse';
      case 'High':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'Medium':
        return 'bg-blue-500 hover:bg-blue-600 text-white';
      case 'Low':
      default:
        return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };

  const getStatusBadgeColor = (status: Task['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Pending Verification':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Assigned':
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto px-4 pb-10">
      {/* Title */}
      <div className="flex flex-col gap-1.5 py-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          My Assigned Tasks
        </h1>
        <p className="text-xs text-muted-foreground">
          View field work jobs assigned to you, upload evidence and submit for verification.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-muted-foreground px-1">
          <span className="flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filter Tasks
          </span>
          {(statusFilter !== 'all' || dueFilter) && (
            <button 
              onClick={() => {
                setStatusFilter('all');
                setDueFilter(false);
              }}
              className="text-primary hover:underline text-xs"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1 rounded-lg bg-muted p-1 text-[11px] font-bold">
          <button
            onClick={() => { setStatusFilter('all'); setDueFilter(false); }}
            className={`rounded-md py-1.5 transition-all cursor-pointer ${
              statusFilter === 'all' && !dueFilter
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setStatusFilter('Assigned'); setDueFilter(false); }}
            className={`rounded-md py-1.5 transition-all cursor-pointer ${
              statusFilter === 'Assigned'
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Assigned
          </button>
          <button
            onClick={() => { setStatusFilter('In Progress'); setDueFilter(false); }}
            className={`rounded-md py-1.5 transition-all cursor-pointer ${
              statusFilter === 'In Progress'
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setStatusFilter('Pending Verification'); setDueFilter(false); }}
            className={`rounded-md py-1.5 transition-all cursor-pointer ${
              statusFilter === 'Pending Verification'
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Review
          </button>
          <button
            onClick={() => { setStatusFilter('Completed'); setDueFilter(false); }}
            className={`rounded-md py-1.5 transition-all cursor-pointer ${
              statusFilter === 'Completed'
                ? 'bg-background text-foreground shadow-xs font-extrabold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Done
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDueFilter(!dueFilter)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              dueFilter 
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' 
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Due Today Only
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-10 text-center bg-card">
          <ListTodo className="h-10 w-10 text-muted-foreground/40 mb-3 animate-pulse" />
          <h3 className="font-bold text-foreground text-sm">No tasks found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
            Try resetting your filters or check back later for new assignments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className="relative overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all border border-border/80 cursor-pointer"
              onClick={() => navigate(`/portal/technician/tasks/${task.id}`)}
            >
              {/* Left boundary accent colored by priority */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                task.priority === 'Emergency' ? 'bg-red-500' :
                task.priority === 'High' ? 'bg-amber-500' :
                task.priority === 'Medium' ? 'bg-blue-500' : 'bg-slate-400'
              }`} />

              <CardContent className="p-4 pl-5 space-y-3">
                {/* Badges row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {task.task_type}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Badge className={`text-[9px] font-extrabold px-1.5 py-0 ${getPriorityBadgeColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className={`text-[9px] font-extrabold px-1.5 py-0 uppercase ${getStatusBadgeColor(task.status)}`}>
                      {task.status}
                    </Badge>
                  </div>
                </div>

                {/* Title and description */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                    {task.task_title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Customer Details info block */}
                <div className="text-[11px] space-y-1.5 pt-2 border-t border-border/50 text-muted-foreground font-semibold">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{task.customer_name} — {task.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{task.customer_phone}</span>
                  </div>
                </div>

                {/* Action footer */}
                <div className="flex justify-between items-center gap-4 text-[10px] font-bold pt-2 border-t border-border/30">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>

                  <span className="flex items-center gap-1 text-primary hover:translate-x-0.5 transition-transform">
                    Open Task Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
