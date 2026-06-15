import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase, type Task, isUsingMock } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Camera, 
  CheckCircle2, 
  Trash2, 
  Loader2, 
  Play, 
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';

export default function TaskDetails() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { employee } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [techNotes, setTechNotes] = useState('');
  
  // Photo Evidence states
  const [isUploading, setIsUploading] = useState<'before' | 'after' | 'completion' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const loadTaskData = async () => {
    if (!taskId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) throw error;
      setTask(data);
      setTechNotes(data.technician_notes || '');
    } catch (err) {
      console.error('Error fetching task details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-md mx-auto p-4 text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Task not found</h3>
        <p className="text-xs text-muted-foreground">The task you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => navigate('/portal/technician/tasks')} className="w-full">
          Back to My Tasks
        </Button>
      </div>
    );
  }

  // Activity log helper to insert timeline event
  const logActivity = (currentLog: Task['activity_log'] = [], type: string, desc: string) => {
    const newEvent = {
      type,
      time: new Date().toISOString(),
      desc,
      user: employee?.employee_name || 'Technician'
    };
    return [newEvent, ...currentLog];
  };

  // Helper to notify manager
  const notifyManagers = async (title: string, message: string) => {
    try {
      let managerId = task.assigned_by;
      
      // Fallback: If assigned_by is not set, find first Manager in system
      if (!managerId) {
        const { data } = await supabase
          .from('employees')
          .select('id')
          .eq('role', 'Manager')
          .limit(1);
        if (data && data[0]) {
          managerId = data[0].id;
        }
      }

      if (managerId) {
        await supabase.from('notifications').insert({
          user_id: managerId,
          title,
          message,
          read: false
        });
      }
    } catch (err) {
      console.error('Failed to dispatch notification:', err);
    }
  };

  const handleStartTask = async () => {
    setIsActionLoading(true);
    try {
      const updatedLog = logActivity(task.activity_log, 'status_change', 'Task status updated to In Progress');
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status: 'In Progress',
          activity_log: updatedLog,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      setTask(data);
      
      // Notify managers
      await notifyManagers(
        'Task Started',
        `${employee?.employee_name || 'A technician'} has marked task '${task.task_title}' as In Progress.`
      );
    } catch (err) {
      console.error('Error starting task:', err);
      alert('Failed to start task.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePhotoUpload = async (category: 'before' | 'after' | 'completion', file: File) => {
    setIsUploading(category);
    setErrorMsg('');
    try {
      let fileUrl = '';

      if (!isUsingMock) {
        // Real Storage Upload
        const fileExt = file.name.split('.').pop();
        const fileName = `${task.id}-${category}-${Date.now()}.${fileExt}`;
        const filePath = `${task.id}/${category}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('task-evidence')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('task-evidence')
          .getPublicUrl(filePath);

        fileUrl = data.publicUrl;
      } else {
        // Mock Mode URL simulation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const securityUnsplash = [
          'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop',
        ];
        const hash = file.name.length + category.length;
        fileUrl = securityUnsplash[hash % securityUnsplash.length];
      }

      // Update local task state and database
      const photoField = `${category}_photos` as 'before_photos' | 'after_photos' | 'completion_photos';
      const updatedPhotos = [...(task[photoField] || []), fileUrl];

      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({ 
          [photoField]: updatedPhotos,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      setTask(updatedTask);
    } catch (err: any) {
      console.error('Error uploading photo evidence:', err);
      setErrorMsg(err.message || 'Photo upload failed.');
    } finally {
      setIsUploading(null);
    }
  };

  const handlePhotoDelete = async (category: 'before' | 'after' | 'completion', index: number) => {
    const photoField = `${category}_photos` as 'before_photos' | 'after_photos' | 'completion_photos';
    const photosList = [...(task[photoField] || [])];
    const removedPhotoUrl = photosList[index];
    photosList.splice(index, 1);

    try {
      const { data: updatedTask, error } = await supabase
        .from('tasks')
        .update({ 
          [photoField]: photosList,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      setTask(updatedTask);

      // Delete from storage if real mode and uploaded there
      if (!isUsingMock && removedPhotoUrl.includes('task-evidence')) {
        const parts = removedPhotoUrl.split('task-evidence/');
        if (parts[1]) {
          await supabase.storage
            .from('task-evidence')
            .remove([parts[1]]);
        }
      }
    } catch (err) {
      console.error('Error deleting photo evidence:', err);
      alert('Failed to delete photo.');
    }
  };

  const handleSubmitVerification = async () => {
    if (!techNotes.trim()) {
      setErrorMsg('Please write some completion notes explaining the work performed.');
      return;
    }

    // Require at least one photo upload before verification as evidence
    const totalPhotos = (task.before_photos?.length || 0) + 
                        (task.after_photos?.length || 0) + 
                        (task.completion_photos?.length || 0);
    if (totalPhotos === 0) {
      setErrorMsg('You must upload at least one photo (Before/After/Completion) as work evidence.');
      return;
    }

    setIsActionLoading(true);
    setErrorMsg('');
    try {
      const updatedLog = logActivity(
        task.activity_log, 
        'status_change', 
        `Submitted for verification. Notes: "${techNotes.substring(0, 40)}${techNotes.length > 40 ? '...' : ''}"`
      );
      
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'Pending Verification',
          technician_notes: techNotes.trim(),
          completion_time: new Date().toISOString(),
          activity_log: updatedLog,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      setTask(data);

      // Notify managers
      await notifyManagers(
        'Task Submitted for Verification',
        `${employee?.employee_name || 'A technician'} completed task '${task.task_title}' and submitted for verification.`
      );
    } catch (err) {
      console.error('Error submitting task verification:', err);
      alert('Failed to submit task verification.');
    } finally {
      setIsActionLoading(false);
    }
  };

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

  const renderPhotoEvidenceGrid = (category: 'before' | 'after' | 'completion', title: string) => {
    const photoField = `${category}_photos` as 'before_photos' | 'after_photos' | 'completion_photos';
    const photosList = task[photoField] || [];
    const isEditable = task.status === 'In Progress';

    return (
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground flex items-center justify-between">
          <span>{title} ({photosList.length})</span>
          {isEditable && (
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                capture="environment" // open camera on mobile device
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id={`upload-file-${category}`}
                disabled={isUploading !== null}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handlePhotoUpload(category, e.target.files[0]);
                  }
                }}
              />
              <button
                className="text-[10px] text-primary hover:underline flex items-center gap-1 cursor-pointer"
                disabled={isUploading !== null}
              >
                {isUploading === category ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Camera className="h-3 w-3" />
                    Snap / Add
                  </>
                )}
              </button>
            </div>
          )}
        </span>

        {photosList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-5 border border-dashed rounded-lg bg-muted/40">
            <Camera className="h-5 w-5 text-muted-foreground/30 mb-1" />
            <span className="text-[10px] text-muted-foreground/60 font-semibold">No {title.toLowerCase()} uploaded</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photosList.map((url, index) => (
              <div key={index} className="relative h-20 rounded-lg overflow-hidden border border-border bg-slate-100 group">
                <img src={url} alt={`${category} evidence`} className="h-full w-full object-cover" />
                {isEditable && (
                  <button
                    onClick={() => handlePhotoDelete(category, index)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-md mx-auto px-4 pb-16">
      {/* Back Header Nav */}
      <div className="flex items-center justify-between py-1 border-b border-border/40">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/portal/technician/tasks')} 
          className="text-xs font-bold -ml-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          My Tasks
        </Button>
        <div className="flex items-center gap-1.5">
          <Badge className={`text-[9px] font-extrabold px-1.5 py-0 ${getPriorityBadgeColor(task.priority)}`}>
            {task.priority}
          </Badge>
          <Badge variant="outline" className={`text-[9px] font-extrabold px-1.5 py-0 uppercase ${getStatusBadgeColor(task.status)}`}>
            {task.status}
          </Badge>
        </div>
      </div>

      {/* Rejection Alert */}
      {task.rejection_reason && task.status === 'In Progress' && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 flex gap-2.5 text-xs text-red-800 dark:text-red-300 font-semibold">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold">Work Rejected by Manager</p>
              <p className="font-normal text-[11px] leading-relaxed">Reason: {task.rejection_reason}</p>
              <p className="font-normal text-[10px] opacity-80">Please address the issues listed above and resubmit.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Info Card */}
      <Card className="shadow-xs border-border/60 bg-card overflow-hidden">
        <div className="p-4 space-y-3">
          <span className="text-[10px] uppercase font-black text-primary tracking-wider">
            {task.task_type}
          </span>
          <h1 className="text-lg font-bold text-foreground leading-snug">{task.task_title}</h1>
          
          <div className="space-y-2 pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
            </div>
            <div className="text-xs leading-relaxed text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40">
              <span className="block text-[10px] font-extrabold uppercase text-muted-foreground/60 mb-0.5">Manager Instructions</span>
              {task.description}
            </div>
          </div>
        </div>
      </Card>

      {/* Site Customer Info Card */}
      <Card className="shadow-xs border-border/60 bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold uppercase text-foreground">Customer & Location</h3>
          </div>
          
          <div className="space-y-2.5 text-xs font-semibold text-muted-foreground">
            <div>
              <span className="block text-[10px] text-muted-foreground/60 font-bold">Contact Person</span>
              <span className="text-foreground font-extrabold">{task.customer_name}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="block text-[10px] text-muted-foreground/60 font-bold">Phone Number</span>
                <span className="text-foreground">{task.customer_phone}</span>
              </div>
              <a 
                href={`tel:${task.customer_phone}`}
                className="h-8 px-3 rounded bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5" />
                Call Client
              </a>
            </div>

            <div>
              <span className="block text-[10px] text-muted-foreground/60 font-bold">Site Address</span>
              <span className="text-foreground leading-relaxed block mb-1">{task.location}</span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.location)}`}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary hover:underline inline-flex items-center gap-1 font-bold"
              >
                <MapPin className="h-3 w-3" />
                Get GPS Directions
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PHOTO EVIDENCE SECTION */}
      <Card className="shadow-xs border-border/60 bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold uppercase text-foreground flex items-center gap-1">
              <Camera className="h-4 w-4 text-primary" />
              Work Photo Evidence
            </h3>
          </div>

          {errorMsg && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive text-[11px] rounded-md p-2.5 font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {renderPhotoEvidenceGrid('before', 'Before Photos')}
            <div className="border-t border-border/40" />
            {renderPhotoEvidenceGrid('after', 'After Photos')}
            <div className="border-t border-border/40" />
            {renderPhotoEvidenceGrid('completion', 'Completion / Sign-off')}
          </div>
        </CardContent>
      </Card>

      {/* ACTION PANEL */}
      <Card className="shadow-xs border-border/60 bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold uppercase text-foreground flex items-center gap-1">
              <FileText className="h-4 w-4 text-primary" />
              Field Report & Status Action
            </h3>
          </div>

          {task.status === 'Assigned' && (
            <div className="space-y-2.5">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click below when you arrive at the site to notify the manager that work has officially started.
              </p>
              <Button 
                onClick={handleStartTask} 
                disabled={isActionLoading}
                className="w-full font-bold bg-primary text-primary-foreground py-5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Start Work Now
                  </>
                )}
              </Button>
            </div>
          )}

          {task.status === 'In Progress' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="tech-notes" className="text-[11px] font-bold text-muted-foreground">
                  Technician Report Notes
                </Label>
                <Textarea
                  id="tech-notes"
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="Describe what was fixed, materials used, client comments, or any notes..."
                  rows={4}
                  className="text-xs leading-relaxed"
                />
              </div>

              <Button 
                onClick={handleSubmitVerification}
                disabled={isActionLoading}
                className="w-full font-bold bg-emerald-600 hover:bg-emerald-700 text-white py-5 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Submit for Manager Review
                  </>
                )}
              </Button>
            </div>
          )}

          {task.status === 'Pending Verification' && (
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 rounded-lg p-3 text-center space-y-1">
              <Clock className="h-5 w-5 text-purple-500 mx-auto" />
              <p className="text-xs font-bold">Review Pending</p>
              <p className="text-[10px] leading-relaxed opacity-85">
                Work report and photo evidence submitted. Waiting for manager Sarah to verify and close.
              </p>
            </div>
          )}

          {task.status === 'Completed' && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-lg p-3 text-center space-y-1">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
              <p className="text-xs font-bold">Task Completed</p>
              <p className="text-[10px] leading-relaxed opacity-85">
                This task has been verified and closed by Sarah Manager.
              </p>
              {task.technician_notes && (
                <div className="mt-2 text-left bg-emerald-500/5 p-2 rounded text-[10px] border border-emerald-500/10">
                  <span className="block font-bold">Your Notes:</span>
                  <span className="italic">"{task.technician_notes}"</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACTIVITY TIMELINE HISTORIAL */}
      <Card className="shadow-xs border-border/60 bg-card">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs font-bold uppercase text-foreground flex items-center gap-1">
              <History className="h-4 w-4 text-primary" />
              Task Timeline History
            </h3>
          </div>

          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {task.activity_log && task.activity_log.length > 0 ? (
              task.activity_log.map((log, index) => (
                <div key={index} className="flex gap-3 text-xs relative pl-6">
                  {/* Dot */}
                  <div className={`absolute left-0.5 top-1 h-3 w-3 rounded-full border-2 ${
                    log.type === 'status_change' && log.desc.includes('Completed') ? 'bg-emerald-500 border-emerald-200' :
                    log.type === 'status_change' && log.desc.includes('In Progress') ? 'bg-amber-500 border-amber-200' :
                    log.type === 'status_change' && log.desc.includes('verification') ? 'bg-purple-500 border-purple-200' :
                    'bg-blue-500 border-blue-200'
                  }`} />
                  
                  <div className="space-y-0.5">
                    <span className="block font-bold text-foreground text-[11px]">{log.desc}</span>
                    <span className="block text-[10px] text-muted-foreground">
                      By {log.user} • {new Date(log.time).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] text-muted-foreground/60 italic text-center py-2">No events logged yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
