import { useEffect, useState } from 'react';
import { supabase, type Survey, type Employee } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ClipboardList, 
  Search, 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  UserCheck, 
  Eye, 
  AlertCircle,
  ThumbsUp,
  RotateCcw
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Surveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [technicians, setTechnicians] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Assigned' | 'In Progress' | 'Completed' | 'Approved'>('all');

  // Detail Modal State
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [reassignTechId, setReassignTechId] = useState('');
  const [reassignDate, setReassignDate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        // Fetch all surveys and technician employee profiles
        const [surveysRes, employeesRes] = await Promise.all([
          supabase.from('surveys').select('*').order('created_at', { ascending: false }),
          supabase.from('employees').select('*').eq('role', 'Technician').eq('status', 'Active'),
        ]);

        if (surveysRes.error) throw surveysRes.error;
        if (employeesRes.error) throw employeesRes.error;

        setSurveys(surveysRes.data || []);
        setTechnicians(employeesRes.data || []);
      } catch (err) {
        console.error('Error fetching surveys database:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getTechName = (techId: string) => {
    const tech = technicians.find((t) => t.id === techId);
    return tech ? tech.employee_name : 'Unassigned';
  };

  const getStatusBadge = (status: Survey['status']) => {
    switch (status) {
      case 'Assigned':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500 border border-blue-500/20">
            <Clock className="h-3.5 w-3.5" />
            Assigned
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-500 border border-amber-500/20">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            In Progress
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/20 animate-bounce">
            <CheckCircle className="h-3.5 w-3.5" />
            Completed
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-500 border border-indigo-500/20">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </span>
        );
      default:
        return null;
    }
  };

  const handleOpenDetails = (survey: Survey) => {
    setSelectedSurvey(survey);
    setReassignTechId(survey.assigned_technician || '');
    setReassignDate(survey.survey_date || '');
    setErrorMsg('');
    setIsDetailOpen(true);
  };

  // Update Technician Assignment / Date
  const handleUpdateAssignment = async () => {
    if (!selectedSurvey) return;
    setIsUpdating(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({
          assigned_technician: reassignTechId,
          survey_date: reassignDate,
        })
        .eq('id', selectedSurvey.id)
        .select()
        .single();

      if (error) throw error;

      // Update Local State
      setSurveys(surveys.map((s) => (s.id === selectedSurvey.id ? data : s)));
      setSelectedSurvey(data);
    } catch (err: any) {
      console.error('Error updating assignment:', err);
      setErrorMsg('Failed to update assignment settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Approve Survey
  const handleApproveSurvey = async () => {
    if (!selectedSurvey) return;
    setIsUpdating(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('surveys')
        .update({ status: 'Approved' })
        .eq('id', selectedSurvey.id)
        .select()
        .single();

      if (error) throw error;

      setSurveys(surveys.map((s) => (s.id === selectedSurvey.id ? data : s)));
      setIsDetailOpen(false);
    } catch (err: any) {
      console.error('Error approving survey:', err);
      setErrorMsg('Failed to approve survey.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Reject / Send back to technician
  const handleSendBack = async () => {
    if (!selectedSurvey) return;
    setIsUpdating(true);
    setErrorMsg('');

    try {
      // Move status back to 'In Progress'
      const { data, error } = await supabase
        .from('surveys')
        .update({ status: 'In Progress' })
        .eq('id', selectedSurvey.id)
        .select()
        .single();

      if (error) throw error;

      setSurveys(surveys.map((s) => (s.id === selectedSurvey.id ? data : s)));
      setIsDetailOpen(false);
    } catch (err: any) {
      console.error('Error sending survey back:', err);
      setErrorMsg('Failed to return survey status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter logic
  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      survey.location.toLowerCase().includes(search.toLowerCase()) ||
      survey.service_type.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-5 w-2/3 rounded bg-muted mb-2"></div>
                <div className="h-4 w-1/3 rounded bg-muted"></div>
              </CardHeader>
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
      <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            Survey Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Track site surveys, reassign technicians, view uploads, and approve results.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name, location, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Grid of Surveys */}
      {filteredSurveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center bg-card">
          <ClipboardList className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-foreground text-md">No surveys found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your search criteria or filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSurveys.map((survey) => (
            <Card
              key={survey.id}
              className={`hover:border-primary/50 transition-all shadow-xs cursor-pointer ${
                survey.status === 'Completed' ? 'border-amber-500/50 bg-amber-500/[0.02]' : ''
              }`}
              onClick={() => handleOpenDetails(survey)}
            >
              <CardHeader className="pb-3 flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-lg font-bold truncate max-w-[180px]">
                    {survey.customer_name}
                  </CardTitle>
                  <CardDescription className="text-primary font-medium text-xs mt-0.5">
                    {survey.service_type}
                  </CardDescription>
                </div>
                {getStatusBadge(survey.status)}
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground">
                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span className="truncate">{survey.location}</span>
                </div>

                {/* Technician Profile */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    Tech: {getTechName(survey.assigned_technician)}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Scheduled: {new Date(survey.survey_date).toLocaleDateString()}</span>
                </div>

                {/* Footnote for action */}
                <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-primary">
                  <span>View Details & Actions</span>
                  <Eye className="h-3.5 w-3.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedSurvey && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <DialogTitle className="text-xl font-bold">
                      {selectedSurvey.customer_name}
                    </DialogTitle>
                    <DialogDescription className="text-primary font-semibold">
                      {selectedSurvey.service_type}
                    </DialogDescription>
                  </div>
                  <div>{getStatusBadge(selectedSurvey.status)}</div>
                </div>
              </DialogHeader>

              {errorMsg && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-xs text-destructive flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-6 pt-2">
                {/* Information Rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-slate-50 dark:bg-slate-900 p-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Site Location</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selectedSurvey.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Created Date</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(selectedSurvey.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Technician Assignment and Scheduling (Only Editable if not Approved) */}
                {selectedSurvey.status !== 'Approved' && (
                  <Card className="border-border bg-card shadow-xs">
                    <CardHeader className="py-3 px-4 border-b border-border/55">
                      <h4 className="text-sm font-bold flex items-center gap-1.5">
                        <UserCheck className="h-4.5 w-4.5 text-primary" />
                        Reassign Technician / Reschedule Date
                      </h4>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Technician Dropdown */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Assign Technician</label>
                          <select
                            value={reassignTechId}
                            onChange={(e) => setReassignTechId(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                            disabled={isUpdating}
                          >
                            <option value="">Select Technician</option>
                            {technicians.map((tech) => (
                              <option key={tech.id} value={tech.id}>
                                {tech.employee_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date Selector */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Survey Date</label>
                          <input
                            type="date"
                            value={reassignDate}
                            onChange={(e) => setReassignDate(e.target.value)}
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                            disabled={isUpdating}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateAssignment}
                          disabled={
                            isUpdating ||
                            (reassignTechId === selectedSurvey.assigned_technician &&
                              reassignDate === selectedSurvey.survey_date)
                          }
                        >
                          Update Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Photos Section */}
                <div>
                  <h4 className="text-sm font-bold mb-2 text-foreground uppercase tracking-wider">Site Photos</h4>
                  {selectedSurvey.photos && selectedSurvey.photos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedSurvey.photos.map((url, idx) => (
                        <a 
                          key={idx} 
                          href={url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="group relative aspect-square rounded-md overflow-hidden border border-border bg-slate-100 dark:bg-slate-800"
                        >
                          <img
                            src={url}
                            alt={`Site photo ${idx + 1}`}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold">
                            View Fullscreen
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic bg-slate-100 dark:bg-slate-900 rounded p-3 text-center">
                      No photos uploaded yet by the technician.
                    </p>
                  )}
                </div>

                {/* Remarks Section */}
                <div>
                  <h4 className="text-sm font-bold mb-2 text-foreground uppercase tracking-wider">Technician Remarks</h4>
                  <div className="rounded-md bg-slate-100 dark:bg-slate-900 border p-4 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedSurvey.remarks || (
                      <span className="italic text-muted-foreground">No remarks provided yet.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <DialogFooter className="border-t border-border pt-4 flex flex-col gap-2 sm:flex-row sm:justify-between">
                <div>
                  {selectedSurvey.status === 'Completed' && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        onClick={handleSendBack}
                        variant="outline"
                        className="text-amber-600 border-amber-600/35 hover:bg-amber-500/10 w-full sm:w-auto"
                        disabled={isUpdating}
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Send Back to Tech
                      </Button>
                      <Button
                        onClick={handleApproveSurvey}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                        disabled={isUpdating}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Approve Survey
                      </Button>
                    </div>
                  )}
                </div>
                <Button variant="ghost" onClick={() => setIsDetailOpen(false)} disabled={isUpdating}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
