import { useEffect, useState } from 'react';
import { supabase, type Task, type Employee } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function TaskAssignment() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Pending' | 'Completed'>('ALL');

  // Add Task Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTechId, setFormTechId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Confirm Dialog State
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, employeesRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').eq('role', 'Technician').eq('status', 'Active'),
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (employeesRes.error) throw employeesRes.error;

      setTasks(tasksRes.data || []);
      setTechnicians(employeesRes.data || []);
    } catch (err) {
      console.error('Error loading tasks administration:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormDesc('');
    setFormTechId('');
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split('T')[0]);
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleSaveTask = async () => {
    if (!formTitle.trim() || !formDesc.trim() || !formTechId || !formDueDate) {
      setErrorMsg('Please fill in all task fields.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      const { error } = await supabase.from('tasks').insert({
        title: formTitle.trim(),
        description: formDesc.trim(),
        assigned_technician: formTechId,
        due_date: formDueDate,
        status: 'Pending',
      });

      if (error) throw error;
      
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Error saving task:', err);
      setErrorMsg(err.message || 'Failed to create task assignment.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskToDelete.id);
      if (error) throw error;
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTechName = (techId: string) => {
    const tech = technicians.find((t) => t.id === techId);
    return tech ? tech.employee_name : 'Unassigned';
  };

  // Filtered list
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTechName(task.assigned_technician).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
          <div className="h-10 w-32 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-20 bg-muted/40"></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Technician Task Assignments
          </h1>
          <p className="text-sm text-muted-foreground">
            Schedule general workflows, delegate tasks to field workers, and track execution status.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Assign Task
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or technician name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center bg-card">
          <CheckSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-foreground text-md">No tasks found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Create a task using the "Assign Task" button to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:border-primary/30 transition-all shadow-xs">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  {/* Task details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {task.title}
                      </h3>
                      {task.status === 'Completed' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-500 border border-blue-500/20">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {task.description}
                    </p>

                    {/* Metadata indicators */}
                    <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>Technician: <strong className="text-foreground">{getTechName(task.assigned_technician)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:self-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDeleteClick(task)}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assign Task Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              Assign New Task
            </DialogTitle>
            <DialogDescription>
              Deploy a general operational task assignment to a field technician's profile.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-2">
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Inspect router wiring at City Hall"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-desc">Task Description</Label>
              <Textarea
                id="task-desc"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Details about what needs to be inspected or done..."
                className="min-h-[100px]"
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="task-tech">Assign Technician</Label>
                <select
                  id="task-tech"
                  value={formTechId}
                  onChange={(e) => setFormTechId(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground bg-card"
                  disabled={isSaving}
                >
                  <option value="">Select Technician</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.employee_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-due">Due Date</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={isSaving}>
              {isSaving ? 'Assigning...' : 'Assign & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Delete Task Assignment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This task assignment will be permanently removed from the technician's list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
