import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Task } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  Calendar, 
  CheckCircle, 
  Clock,
  Loader2,
  ListTodo
} from 'lucide-react';

export default function MyTasks() {
  const { employee } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<'Pending' | 'Completed'>('Pending');

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

  const handleToggleComplete = async (task: Task) => {
    setIsUpdating(task.id);
    const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      
      // Update local state
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    } catch (err) {
      console.error('Error toggling task completion status:', err);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredTasks = tasks.filter((t) => t.status === filter);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          My Assigned Tasks
        </h1>
        <p className="text-xs text-muted-foreground">
          View general jobs assigned to you and update their status.
        </p>
      </div>

      {/* Tabs / Filter Controls */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => setFilter('Pending')}
          className={`rounded-md py-2.5 text-sm font-bold transition-all cursor-pointer ${
            filter === 'Pending'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Tasks
        </button>
        <button
          onClick={() => setFilter('Completed')}
          className={`rounded-md py-2.5 text-sm font-bold transition-all cursor-pointer ${
            filter === 'Completed'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Completed
        </button>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center bg-card">
          <ListTodo className="h-10 w-10 text-muted-foreground/60 mb-3" />
          <h3 className="font-semibold text-foreground text-sm">No tasks in this category</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === 'Pending'
              ? 'You have completed all assigned tasks!'
              : 'You have no completed tasks recorded.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="relative overflow-hidden shadow-xs hover:border-primary/20 transition-all">
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground leading-snug">{task.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
                </div>

                <div className="flex justify-between items-center gap-4 text-xs font-semibold pt-1 border-t border-border/40">
                  {/* Due date */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  </div>

                  {/* Status update checkbox button */}
                  <div>
                    <Button
                      size="sm"
                      onClick={() => handleToggleComplete(task)}
                      disabled={isUpdating === task.id}
                      variant={task.status === 'Completed' ? 'secondary' : 'default'}
                      className="text-xs font-bold px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                    >
                      {isUpdating === task.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      ) : task.status === 'Pending' ? (
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 mr-1" />
                      )}
                      {task.status === 'Pending' ? 'Mark Completed' : 'Mark Pending'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
