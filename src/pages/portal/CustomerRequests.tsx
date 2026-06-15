import { useEffect, useState } from 'react';
import { supabase, type Lead, type Employee } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  PlusSquare,
  CheckCircle,
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const TASK_TYPES = [
  'CCTV Installation', 'CCTV Maintenance', 'AMC Visit', 
  'Site Survey', 'Device Repair', 'Fire Alarm Service', 
  'Access Control Service', 'Network Support', 'Other'
];

const PRIORITIES = ['Low', 'Medium', 'High', 'Emergency'];

export default function CustomerRequests() {
  const [requests, setRequests] = useState<Lead[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Conversion Task Modal State
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Lead | null>(null);
  
  // Task Form State
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Other');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formCustomer, setFormCustomer] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTechId, setFormTechId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formMgrNotes, setFormMgrNotes] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Request Details Modal State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState<Lead | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leadsRes, techsRes] = await Promise.all([
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('employees').select('*').eq('role', 'Technician').eq('status', 'Active')
      ]);

      if (leadsRes.error) throw leadsRes.error;
      if (techsRes.error) throw techsRes.error;

      setRequests(leadsRes.data || []);
      setTechnicians(techsRes.data || []);
    } catch (err) {
      console.error('Error loading customer requests database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenView = (req: Lead) => {
    setViewRequest(req);
    setIsViewOpen(true);
  };

  const mapServiceToTaskType = (service: string): string => {
    const s = service.toLowerCase();
    if (s.includes('cctv') || s.includes('camera') || s.includes('surveillance')) {
      return s.includes('maintain') || s.includes('repair') ? 'CCTV Maintenance' : 'CCTV Installation';
    }
    if (s.includes('fire') || s.includes('smoke') || s.includes('alarm')) {
      return 'Fire Alarm Service';
    }
    if (s.includes('access') || s.includes('biometric') || s.includes('turnstile') || s.includes('lock')) {
      return 'Access Control Service';
    }
    if (s.includes('survey') || s.includes('audit')) {
      return 'Site Survey';
    }
    if (s.includes('network') || s.includes('cabling') || s.includes('rack') || s.includes('wifi')) {
      return 'Network Support';
    }
    return 'Other';
  };

  const handleOpenConvert = (req: Lead) => {
    setSelectedRequest(req);
    
    // Pre-fill task form based on request/lead details
    setFormTitle(`${req.service_required} for ${req.name}`);
    setFormType(mapServiceToTaskType(req.service_required));
    setFormPriority('Medium');
    setFormCustomer(req.name);
    setFormPhone(req.phone);
    setFormLocation(req.city);
    setFormDesc(req.message);
    setFormTechId('');
    setFormDueDate(new Date(Date.now() + 3 * 24 * 3600000).toISOString().split('T')[0]); // 3 days default
    setFormMgrNotes(`Converted from Customer Request ID: ${req.id.substring(0, 8)}`);
    setErrorMsg('');
    setIsTaskOpen(true);
  };

  const handleCreateTask = async () => {
    if (!selectedRequest) return;
    if (!formTitle.trim() || !formCustomer.trim() || !formPhone.trim() || !formLocation.trim() || !formDesc.trim() || !formDueDate) {
      setErrorMsg('Please fill in all the required task fields.');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');
    try {
      // 1. Fetch current logged-in manager info
      const { data: { session } } = await supabase.auth.getSession();
      const managerId = session?.user?.id || null;

      // 2. Create the task
      const taskData = {
        task_title: formTitle.trim(),
        task_type: formType,
        customer_name: formCustomer.trim(),
        customer_phone: formPhone.trim(),
        location: formLocation.trim(),
        description: formDesc.trim(),
        priority: formPriority,
        assigned_technician: formTechId || null,
        assigned_by: managerId,
        due_date: formDueDate,
        status: 'Assigned',
        manager_notes: formMgrNotes.trim(),
        activity_log: [
          {
            type: 'status_change',
            time: new Date().toISOString(),
            desc: formTechId 
              ? 'Task created from customer request and assigned to technician' 
              : 'Task created from customer request (Unassigned)',
            user: 'Manager'
          }
        ]
      };

      const { data: createdTasks, error: taskError } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();

      if (taskError) throw taskError;

      // 3. Mark the customer request/lead status as 'Converted'
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'Converted' })
        .eq('id', selectedRequest.id);

      if (leadError) throw leadError;

      // 4. Send notification to the technician if assigned
      if (formTechId && createdTasks && createdTasks[0]) {
        await supabase.from('notifications').insert({
          user_id: formTechId,
          title: 'New Request Task Assigned',
          message: `You have been assigned request task '${formTitle}' due on ${formDueDate}.`,
          read: false
        });
      }

      alert('Customer request successfully converted to operational task!');
      setIsTaskOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Error converting request to task:', err);
      setErrorMsg(err.message || 'Failed to convert request.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRequestBadgeColor = (status: Lead['status']) => {
    switch (status) {
      case 'Converted':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Closed':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      case 'Qualified':
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'Contacted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'New':
      default:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse';
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.name.toLowerCase().includes(search.toLowerCase()) ||
      req.email.toLowerCase().includes(search.toLowerCase()) ||
      req.service_required.toLowerCase().includes(search.toLowerCase()) ||
      req.city.toLowerCase().includes(search.toLowerCase());
      
    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && req.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Details */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Customer Requests
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor incoming contact form service requests and dispatch field engineering tasks from them directly.
          </p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm" className="cursor-pointer shrink-0">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Filter Tools */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, service required or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Category tabs */}
        <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-lg text-xs font-bold shrink-0">
          {['all', 'New', 'Contacted', 'Qualified', 'Converted', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                statusFilter === status
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Display */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((req) => (
            <Card key={req.id} className="relative overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-border/60 bg-card flex flex-col justify-between">
              {/* Top border colored by status */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                req.status === 'Converted' ? 'bg-emerald-500' :
                req.status === 'New' ? 'bg-rose-500' :
                req.status === 'Contacted' ? 'bg-blue-500' : 'bg-slate-400'
              }`} />

              <CardContent className="p-5 space-y-4 pt-6">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-foreground truncate max-w-[170px]">{req.name}</h3>
                    <span className="text-[10px] text-muted-foreground font-semibold">{req.email}</span>
                  </div>
                  <Badge variant="outline" className={`text-[9px] font-black uppercase px-2 py-0.5 ${getRequestBadgeColor(req.status)}`}>
                    {req.status}
                  </Badge>
                </div>

                {/* Details list */}
                <div className="space-y-2 text-xs font-semibold text-muted-foreground leading-relaxed">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-foreground truncate">{req.service_required}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span>{req.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-primary shrink-0" />
                    <span>{req.phone}</span>
                  </div>
                </div>

                {/* Message preview */}
                <div className="text-[11px] leading-relaxed text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-border/40 line-clamp-3">
                  {req.message}
                </div>

                {/* Actions footer */}
                <div className="flex gap-2 pt-2 border-t border-border/30">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenView(req)} 
                    className="flex-1 text-xs font-bold cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View Details
                  </Button>
                  
                  {req.status !== 'Converted' && req.status !== 'Closed' ? (
                    <Button 
                      size="sm" 
                      onClick={() => handleOpenConvert(req)} 
                      className="flex-1 text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
                    >
                      <PlusSquare className="h-3.5 w-3.5 mr-1" />
                      Create Task
                    </Button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground font-bold border border-dashed rounded bg-muted/10 select-none">
                      <CheckCircle className="h-3 w-3 mr-1 text-emerald-500" />
                      Converted
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center border border-dashed rounded-xl py-16 bg-card">
          <FileText className="h-12 w-12 text-muted-foreground/45 mb-2.5" />
          <p className="text-sm font-bold text-foreground">No customer requests found</p>
          <p className="text-xs text-muted-foreground mt-0.5">Incoming contact form submissions will appear here automatically.</p>
        </div>
      )}

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[450px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5 border-b pb-2">
              <FileText className="h-5 w-5 text-primary" />
              Customer Service Request
            </DialogTitle>
          </DialogHeader>

          {viewRequest && (
            <div className="space-y-4 text-xs py-2">
              <div className="grid grid-cols-2 gap-4 border-b pb-3">
                <div>
                  <span className="block text-[10px] text-muted-foreground/60 font-bold uppercase">Customer Name</span>
                  <span className="font-bold text-foreground text-sm">{viewRequest.name}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground/60 font-bold uppercase">Location / City</span>
                  <span className="font-bold text-foreground text-sm">{viewRequest.city}</span>
                </div>
              </div>

              <div className="space-y-2 border-b pb-3 font-semibold text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{viewRequest.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{viewRequest.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Submitted: {new Date(viewRequest.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <span className="block text-[10px] text-muted-foreground/60 font-bold uppercase mb-1">Service Required</span>
                <Badge variant="secondary" className="font-bold text-xs">{viewRequest.service_required}</Badge>
              </div>

              <div>
                <span className="block text-[10px] text-muted-foreground/60 font-bold uppercase mb-1">Request Message Details</span>
                <div className="rounded-lg border p-3 bg-muted/30 leading-relaxed text-foreground whitespace-pre-wrap">
                  {viewRequest.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsViewOpen(false)}>Close</Button>
            {viewRequest && viewRequest.status !== 'Converted' && viewRequest.status !== 'Closed' && (
              <Button size="sm" onClick={() => { setIsViewOpen(false); handleOpenConvert(viewRequest); }}>
                Create Dispatch Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CONVERT TO TASK MODAL */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-1.5 border-b pb-2">
              <PlusSquare className="h-5 w-5 text-primary" />
              Convert Request to Operation Task
            </DialogTitle>
            <DialogDescription>
              Assign a technician and set instructions based on this customer request.
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
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="priority" className="text-foreground font-semibold">Priority Level</Label>
                <select
                  id="priority"
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="cust" className="text-foreground font-semibold">Customer Name</Label>
                <Input id="cust" value={formCustomer} onChange={(e) => setFormCustomer(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-foreground font-semibold">Customer Phone</Label>
                <Input id="phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="loc" className="text-foreground font-semibold">Site Location / City</Label>
              <Input id="loc" value={formLocation} onChange={(e) => setFormLocation(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="desc" className="text-foreground font-semibold">Work Instructions (Description)</Label>
              <Textarea id="desc" value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4 font-semibold">
              <div className="space-y-1">
                <Label htmlFor="tech" className="text-foreground font-semibold">Assign Technician</Label>
                <select
                  id="tech"
                  value={formTechId}
                  onChange={(e) => setFormTechId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
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
              <Label htmlFor="mgr-notes" className="text-foreground font-semibold">Manager Notes (Internal)</Label>
              <Input id="mgr-notes" value={formMgrNotes} onChange={(e) => setFormMgrNotes(e.target.value)} />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsTaskOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateTask} disabled={isSaving}>
              {isSaving ? 'Converting...' : 'Create Task & Dispatch'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
