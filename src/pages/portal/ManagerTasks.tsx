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
  Edit,
  User, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Search,
  Sparkles,
  MapPin,
  Phone,
  RefreshCw,
  Eye,
  FileClock,
  Ban
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';

const TASK_TYPES = [
  'CCTV Installation', 'CCTV Maintenance', 'AMC Visit', 
  'Site Survey', 'Device Repair', 'Fire Alarm Service', 
  'Access Control Service', 'Network Support', 'Other'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];

export default function ManagerTasks() {
  const { employee: currentEmp } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState('');

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<Task['task_type']>('CCTV Installation');
  const [formCustomer, setFormCustomer] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<Task['priority']>('Medium');
  const [formTechId, setFormTechId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formMgrNotes, setFormMgrNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      console.error('Error loading tasks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormTitle('');
    setFormType('CCTV Installation');
    setFormCustomer('');
    setFormPhone('');
    setFormLocation('');
    setFormDesc('');
    setFormPriority('Medium');
    setFormTechId('');
    setFormMgrNotes('');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFormDueDate(tomorrow.toISOString().split('T')[0]);
    setErrorMsg('');
    setIsAddOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setSelectedTask(task);
    setFormTitle(task.task_title);
    setFormType(task.task_type);
    setFormCustomer(task.customer_name);
    setFormPhone(task.customer_phone);
    setFormLocation(task.location);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormTechId(task.assigned_technician || '');
    setFormDueDate(task.due_date);
    setFormMgrNotes(task.manager_notes || '');
    setErrorMsg('');
    setIsEditOpen(true);
  };

  const handleSaveTask = async () => {
    if (!formTitle.trim() || !formCustomer.trim() || !formPhone.trim() || !formLocation.trim() || !formDesc.trim() || !formTechId || !formDueDate) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const selectedTech = technicians.find(t => t.id === formTechId);
      const newLogEvent = {
        type: 'status_change',
        time: new Date().toISOString(),
        desc: `Task created and assigned to ${selectedTech?.employee_name || 'Technician'}`,
        user: currentEmp?.employee_name || 'Manager'
      };

      const taskData = {
        task_title: formTitle.trim(),
        task_type: formType,
        customer_name: formCustomer.trim(),
        customer_phone: formPhone.trim(),
        location: formLocation.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        assigned_technician: formTechId,
        assigned_by: currentEmp?.id || null,
        due_date: formDueDate,
        manager_notes: formMgrNotes.trim(),
        status: 'Assigned' as const,
        activity_log: [newLogEvent]
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();

      if (error) throw error;

      // Send in-app notification to technician
      if (data && data[0]) {
        await supabase.from('notifications').insert({
          user_id: formTechId,
          title: 'New Task Assigned',
          message: `You have been assigned task '${formTitle}' by the manager. Due on ${formDueDate}.`,
          read: false
        });
      }

      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Error saving task:', err);
      setErrorMsg(err.message || 'Failed to create task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    if (!formTitle.trim() || !formCustomer.trim() || !formPhone.trim() || !formLocation.trim() || !formDesc.trim() || !formTechId || !formDueDate) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      const techChanged = selectedTask.assigned_technician !== formTechId;
      const log = [...(selectedTask.activity_log || [])];

      if (techChanged) {
        const selectedTech = technicians.find(t => t.id === formTechId);
        log.push({
          type: 'reassign',
          time: new Date().toISOString(),
          desc: `Task reassigned to ${selectedTech?.employee_name || 'Technician'}`,
          user: currentEmp?.employee_name || 'Manager'
        });
      } else {
        log.push({
          type: 'edit',
          time: new Date().toISOString(),
          desc: 'Task details updated by manager',
          user: currentEmp?.employee_name || 'Manager'
        });
      }

      const { error } = await supabase
        .from('tasks')
        .update({
          task_title: formTitle.trim(),
          task_type: formType,
          customer_name: formCustomer.trim(),
          customer_phone: formPhone.trim(),
          location: formLocation.trim(),
          description: formDesc.trim(),
          priority: formPriority,
          assigned_technician: formTechId,
          due_date: formDueDate,
          manager_notes: formMgrNotes.trim(),
          activity_log: log
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      if (techChanged) {
        // Notify new technician
        await supabase.from('notifications').insert({
          user_id: formTechId,
          title: 'Task Reassigned to You',
          message: `Task '${formTitle}' has been reassigned to you. Due on ${formDueDate}.`,
          read: false
        });
      }

      setIsEditOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Error updating task:', err);
      setErrorMsg(err.message || 'Failed to update task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', selectedTask.id);
      if (error) throw error;
      setIsDeleteOpen(false);
      loadData();
    } catch (err) {
      console.error('Error deleting task:', err);
      alert('Failed to delete task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedTask) return;
    setIsSaving(true);
    try {
      const log = [...(selectedTask.activity_log || [])];
      log.push({
        type: 'status_change',
        time: new Date().toISOString(),
        desc: 'Task completed successfully (Approved by Manager)',
        user: currentEmp?.employee_name || 'Manager'
      });

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'Completed' as const,
          activity_log: log,
          rejection_reason: null
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      // Notify technician
      if (selectedTask.assigned_technician) {
        await supabase.from('notifications').insert({
          user_id: selectedTask.assigned_technician,
          title: 'Task Approved',
          message: `Great job! Your work on task '${selectedTask.task_title}' was approved by the manager.`,
          read: false
        });
      }

      setIsReviewOpen(false);
      loadData();
      alert('Task approved and marked completed!');
    } catch (err: any) {
      console.error('Error approving task:', err);
      alert(err.message || 'Failed to approve task.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedTask || !rejectionNotes.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setIsSaving(true);
    try {
      const log = [...(selectedTask.activity_log || [])];
      log.push({
        type: 'status_change',
        time: new Date().toISOString(),
        desc: `Task completion rejected: ${rejectionNotes.trim()}`,
        user: currentEmp?.employee_name || 'Manager'
      });

      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'In Progress' as const,
          activity_log: log,
          rejection_reason: rejectionNotes.trim()
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      // Notify technician
      if (selectedTask.assigned_technician) {
        await supabase.from('notifications').insert({
          user_id: selectedTask.assigned_technician,
          title: 'Task Completion Rejected',
          message: `The manager requested changes on '${selectedTask.task_title}': "${rejectionNotes.trim()}"`,
          read: false
        });
      }

      setIsReviewOpen(false);
      setRejectMode(false);
      setRejectionNotes('');
      loadData();
      alert('Task returned to technician (In Progress)');
    } catch (err: any) {
      console.error('Error rejecting task:', err);
      alert(err.message || 'Failed to reject task.');
    } finally {
      setIsSaving(false);
    }
  };

  const getTechName = (techId: string | null) => {
    if (!techId) return 'Unassigned';
    const tech = technicians.find((t) => t.id === techId);
    return tech ? tech.employee_name : 'Unknown';
  };

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

  // Sort and filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = 
      t.task_title.toLowerCase().includes(search.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      getTechName(t.assigned_technician).toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  }).sort((a, b) => {
    // Sort Emergency tasks that are not completed first
    const aEmergency = a.priority === 'Emergency' && a.status !== 'Completed';
    const bEmergency = b.priority === 'Emergency' && b.status !== 'Completed';
    if (aEmergency && !bEmergency) return -1;
    if (!aEmergency && bEmergency) return 1;
    // Otherwise sort by creation date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            Field Operations Task Manager
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor, edit, assign, and verify technician safety/installation workloads.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, customer, location, technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Priorities</option>
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>
      </div>

      {/* Tasks Queue */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:border-primary/20 transition-all shadow-xs relative overflow-hidden">
              {task.priority === 'Emergency' && task.status !== 'Completed' && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500 animate-pulse"></div>
              )}
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {task.task_type}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    <h3 className="text-md font-bold text-foreground leading-snug">{task.task_title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 max-w-2xl">{task.description}</p>

                    {/* Metadata details */}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-[11px] text-muted-foreground font-semibold">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Tech: {getTechName(task.assigned_technician)}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Loc: {task.location}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> Phone: {task.customer_phone}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Due: {task.due_date}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 sm:self-center">
                    {task.status === 'Pending Verification' && (
                      <Button
                        size="sm"
                        onClick={() => { setSelectedTask(task); setIsReviewOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold cursor-pointer flex items-center gap-1"
                      >
                        <FileClock className="h-4 w-4" />
                        Verify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      title="View Timeline History"
                      onClick={() => { setSelectedTask(task); setIsTimelineOpen(true); }}
                      className="cursor-pointer"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                    {task.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenEdit(task)}
                        className="cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10 cursor-pointer"
                      onClick={() => handleDeleteClick(task)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl py-12 bg-card">
          <CheckSquare className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm font-bold text-foreground">No tasks found</p>
          <p className="text-xs text-muted-foreground mt-0.5">Try altering your search filters or create a new task.</p>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-primary" />
              Create Field Operation Task
            </DialogTitle>
            <DialogDescription>
              Assign new tasks, define specifications, and schedule completion timelines.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-md p-3 font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3.5 text-xs py-2">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-foreground font-semibold">Task Title</Label>
              <Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="e.g. Lobby Camera Deployment" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="type" className="text-foreground font-semibold">Task Type</Label>
                <select
                  id="type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="priority" className="text-foreground font-semibold">Priority Level</Label>
                <select
                  id="priority"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="cust" className="text-foreground font-semibold">Customer Name</Label>
                <Input id="cust" value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} placeholder="MegaCorp Inc." />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-foreground font-semibold">Customer Phone</Label>
                <Input id="phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="loc" className="text-foreground font-semibold">Site Location Address</Label>
              <Input id="loc" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} placeholder="100 District Blvd, Boston" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc" className="text-foreground font-semibold">Task Description Instructions</Label>
              <Textarea id="desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} placeholder="Provide specific walkthrough details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="tech" className="text-foreground font-semibold">Assign Technician</Label>
                <select
                  id="tech"
                  value={formTechId}
                  onChange={(e) => setFormTechId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select Technician</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.employee_name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="due" className="text-foreground font-semibold">Due Date</Label>
                <Input id="due" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="mgr-notes" className="text-foreground font-semibold">Manager Additional Notes (Optional)</Label>
              <Input id="mgr-notes" value={formMgrNotes} onChange={(e) => setFormMgrNotes(e.target.value)} placeholder="e.g. Call client before entry" />
            </div>
          </div>

          <DialogFooter className="mt-2.5">
            <Button variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveTask} disabled={isSaving}>
              {isSaving ? 'Assigning...' : 'Assign & Notify'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT TASK MODAL */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-1.5">
              <Edit className="h-5 w-5 text-primary" />
              Edit Operational Task
            </DialogTitle>
            <DialogDescription>
              Modify task criteria, scheduled due dates, or re-delegate technician assignments.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-xs rounded-md p-3 font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3.5 text-xs py-2">
            <div className="space-y-1">
              <Label htmlFor="edit-title" className="text-foreground font-semibold">Task Title</Label>
              <Input id="edit-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-type" className="text-foreground font-semibold">Task Type</Label>
                <select
                  id="edit-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-priority" className="text-foreground font-semibold">Priority Level</Label>
                <select
                  id="edit-priority"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-cust" className="text-foreground font-semibold">Customer Name</Label>
                <Input id="edit-cust" value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-phone" className="text-foreground font-semibold">Customer Phone</Label>
                <Input id="edit-phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-loc" className="text-foreground font-semibold">Site Location Address</Label>
              <Input id="edit-loc" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-desc" className="text-foreground font-semibold">Task Description Instructions</Label>
              <Textarea id="edit-desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-tech" className="text-foreground font-semibold">Reassign Technician</Label>
                <select
                  id="edit-tech"
                  value={formTechId}
                  onChange={(e) => setFormTechId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select Technician</option>
                  {technicians.map(t => <option key={t.id} value={t.id}>{t.employee_name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-due" className="text-foreground font-semibold">Due Date</Label>
                <Input id="edit-due" type="date" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-mgr-notes" className="text-foreground font-semibold">Manager Additional Notes (Optional)</Label>
              <Input id="edit-mgr-notes" value={formMgrNotes} onChange={(e) => setFormMgrNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter className="mt-2.5">
            <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleUpdateTask} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-md font-bold text-destructive flex items-center gap-1">
              <AlertTriangle className="h-5 w-5" />
              Delete Operational Task?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete task '{selectedTask?.task_title}'? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2.5">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={handleConfirmDelete} disabled={isSaving}>
              {isSaving ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VERIFY COMPLETION MODAL */}
      <Dialog open={isReviewOpen} onOpenChange={(val) => { setIsReviewOpen(val); if(!val) setRejectMode(false); }}>
        <DialogContent className="sm:max-w-[550px] border-border bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-1.5 border-b pb-2">
              <FileClock className="h-5 w-5 text-purple-600 animate-pulse" />
              Verify Completion Submission
            </DialogTitle>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 text-xs py-2.5">
              {/* Task info summary */}
              <div className="bg-muted/40 rounded-lg p-3 space-y-1 border">
                <p className="font-bold text-foreground">{selectedTask.task_title}</p>
                <p className="text-muted-foreground">{selectedTask.location}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  <strong>Completed At:</strong> {selectedTask.completion_time ? new Date(selectedTask.completion_time).toLocaleString() : 'N/A'}
                </p>
              </div>

              {/* Technician notes */}
              <div className="space-y-1">
                <h4 className="font-bold text-foreground text-xs">Technician Notes:</h4>
                <div className="rounded-md border p-3 bg-muted/20 italic text-muted-foreground leading-relaxed">
                  {selectedTask.technician_notes || 'No notes submitted by technician.'}
                </div>
              </div>

              {/* Uploaded Evidence Photos */}
              <div className="space-y-2">
                <h4 className="font-bold text-foreground text-xs">Uploaded Evidence Photos:</h4>
                
                {/* Before Photos */}
                {selectedTask.before_photos && selectedTask.before_photos.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase">Before Work:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedTask.before_photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-full rounded border overflow-hidden bg-muted group">
                          <img src={url} alt="Before work" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* After Photos */}
                {selectedTask.after_photos && selectedTask.after_photos.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase">After Work:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedTask.after_photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-full rounded border overflow-hidden bg-muted group">
                          <img src={url} alt="After work" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Photos */}
                {selectedTask.completion_photos && selectedTask.completion_photos.length > 0 && (
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground text-[10px] uppercase">Completion Proof:</span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedTask.completion_photos.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noreferrer" className="relative h-20 w-full rounded border overflow-hidden bg-muted group">
                          <img src={url} alt="Completion proof" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Eye className="h-4 w-4 text-white" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(!selectedTask.before_photos?.length && !selectedTask.after_photos?.length && !selectedTask.completion_photos?.length) && (
                  <div className="text-muted-foreground italic bg-muted/10 p-4 border border-dashed rounded text-center">
                    No evidence photos were uploaded by the technician.
                  </div>
                )}
              </div>

              {/* Rejection input */}
              {rejectMode && (
                <div className="space-y-1.5 border-t pt-3.5 animate-fadeIn">
                  <Label htmlFor="reject-notes" className="text-destructive font-bold">Reason for Rejection / Changes Requested</Label>
                  <Textarea
                    id="reject-notes"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Enter explicit instructions on what needs to be fixed..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="border-t pt-2.5 mt-2.5">
            {!rejectMode ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => setIsReviewOpen(false)}>Close</Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setRejectMode(true)}
                  className="font-semibold cursor-pointer"
                >
                  <Ban className="h-4 w-4 mr-1" />
                  Reject & Request Changes
                </Button>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  disabled={isSaving}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Task Completed
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setRejectMode(false)}>Back</Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isSaving || !rejectionNotes.trim()}
                  className="font-bold cursor-pointer"
                >
                  Confirm Rejection & Send back
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TASK TIMELINE MODAL */}
      <Dialog open={isTimelineOpen} onOpenChange={setIsTimelineOpen}>
        <DialogContent className="sm:max-w-[450px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-md font-bold text-foreground flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-primary" />
              Task Activity Timeline
            </DialogTitle>
            <DialogDescription>
              Chronological log of dispatches, actions, notes, and approval status.
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="py-4 max-h-[50vh] overflow-y-auto pr-1">
              <div className="relative border-l border-muted pl-4 ml-2.5 space-y-5 text-xs text-left">
                {selectedTask.activity_log && selectedTask.activity_log.length > 0 ? (
                  selectedTask.activity_log.map((log, index) => (
                    <div key={index} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[22.5px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-primary ring-4 ring-background"></span>
                      <div>
                        <span className="font-bold text-foreground">{log.desc}</span>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                          <span>By: {log.user}</span>
                          <span>{new Date(log.time).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic text-center py-4">No logged events found.</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button size="sm" onClick={() => setIsTimelineOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
