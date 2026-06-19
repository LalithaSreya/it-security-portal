import { useEffect, useState } from 'react';
import { supabase, type Report, type Employee, type Task } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Search, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Layers
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface TechPerfSummary {
  name: string;
  assigned: number;
  completed: number;
  pending: number;
  rate: number;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'metrics' | 'general'>('metrics');

  // Search filter for General Reports
  const [search, setSearch] = useState('');

  // Selected Report Modal State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Task metrics calculation
  const [taskStats, setTaskStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    emergency: 0
  });
  const [techSummary, setTechSummary] = useState<TechPerfSummary[]>([]);
  const [backlogTasks, setBacklogTasks] = useState<Task[]>([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [reportsRes, employeesRes, tasksRes] = await Promise.all([
          supabase.from('reports').select('*').order('created_at', { ascending: false }),
          supabase.from('employees').select('*'),
          supabase.from('tasks').select('*'),
        ]);

        if (reportsRes.error) throw reportsRes.error;
        if (employeesRes.error) throw employeesRes.error;
        if (tasksRes.error) throw tasksRes.error;

        const reportsList = reportsRes.data || [];
        const employeesList = employeesRes.data || [];
        const tasksList = tasksRes.data || [];

        setReports(reportsList);
        setEmployees(employeesList);

        // Calculate task stats
        const total = tasksList.length;
        const completed = tasksList.filter((t: Task) => t.status === 'Completed').length;
        const pending = tasksList.filter((t: Task) => t.status === 'Assigned' || t.status === 'In Progress' || t.status === 'Pending Verification').length;
        const emergency = tasksList.filter((t: Task) => t.priority === 'Emergency' && t.status !== 'Completed').length;

        setTaskStats({ total, completed, pending, emergency });

        // Filter active backlog tasks
        const backlog = tasksList.filter((t: Task) => t.status !== 'Completed');
        setBacklogTasks(backlog);

        // Calculate tech performance summaries
        const techs = employeesList.filter((e: Employee) => e.role === 'Technician' && e.status === 'Active');
        const summary = techs.map((t: Employee) => {
          const techTasks = tasksList.filter((tk: Task) => tk.assigned_technician === t.id);
          const tAssigned = techTasks.length;
          const tCompleted = techTasks.filter((tk: Task) => tk.status === 'Completed').length;
          const tPending = techTasks.filter((tk: Task) => tk.status !== 'Completed').length;
          const rate = tAssigned > 0 ? Math.round((tCompleted / tAssigned) * 100) : 0;
          return {
            name: t.employee_name,
            assigned: tAssigned,
            completed: tCompleted,
            pending: tPending,
            rate
          };
        });
        setTechSummary(summary);

      } catch (err) {
        console.error('Error fetching reports database:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const getSubmitterName = (submitterId: string) => {
    const emp = employees.find((e) => e.id === submitterId);
    return emp ? emp.employee_name : 'Unknown Employee';
  };

  const handleOpenReport = (report: Report) => {
    setSelectedReport(report);
    setIsOpen(true);
  };

  // Filtered general reports
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      report.location.toLowerCase().includes(search.toLowerCase()) ||
      report.report_type.toLowerCase().includes(search.toLowerCase()) ||
      getSubmitterName(report.submitted_by).toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        </div>
        <Card className="animate-pulse">
          <CardContent className="h-80 bg-muted/40"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Operations Reports & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Analyze operational metrics, technician performance levels, and general field submissions.
          </p>
        </div>

        {/* Tab Toggle buttons */}
        <div className="flex items-center gap-1.5 bg-muted p-1 rounded-lg self-start sm:self-center">
          <Button
            variant={activeTab === 'metrics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('metrics')}
            className="text-xs font-bold cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 mr-1" />
            Task Metrics
          </Button>
          <Button
            variant={activeTab === 'general' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('general')}
            className="text-xs font-bold cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Field Reports
          </Button>
        </div>
      </div>

      {activeTab === 'metrics' ? (
        /* TASK METRICS TAB */
        <div className="space-y-6">
          {/* Mini Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card className="border-border/50">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider">Total Tasks</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-black text-foreground">{taskStats.total}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Completed Tasks</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-black text-emerald-500">{taskStats.completed}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-amber-500">Pending Tasks</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-black text-amber-500">{taskStats.pending}</p>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-rose-500/5 border-rose-500/20">
              <CardHeader className="pb-1.5 pt-4">
                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Active Emergency</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-2xl font-black text-rose-500">{taskStats.emergency}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Row 1 / Card 1: Task Lifecycle Overview */}
            <Card className="border-border/50 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-primary" />
                  Task Lifecycle Overview
                </CardTitle>
                <CardDescription>Visual completion rate breakdown of the operations backlog</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-5">
                {/* Completion rate bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground">Task Completion Success Rate</span>
                    <span className="text-foreground font-bold">
                      {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/10 space-y-2.5 text-xs flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>{taskStats.completed} tasks</strong> have been successfully resolved and approved.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>{taskStats.pending} tasks</strong> are currently in the field queue or waiting review.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                    <p className="text-muted-foreground">
                      <strong>{taskStats.emergency} emergency</strong> tasks require immediate technical dispatch.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Row 1 / Card 2: Technician Performance summary */}
            <Card className="border-border/50 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-primary" />
                  Technician Performance Rates
                </CardTitle>
                <CardDescription>Average task completion trends by active staff member</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
                      <th className="px-5 py-3">Technician</th>
                      <th className="px-5 py-3 text-center">Assigned</th>
                      <th className="px-5 py-3 text-center">Completed</th>
                      <th className="px-5 py-3 text-center">Pending</th>
                      <th className="px-5 py-3 text-right">Completion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {techSummary.length > 0 ? (
                      techSummary.map((tech, i) => (
                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-foreground">{tech.name}</td>
                          <td className="px-5 py-3.5 text-center text-muted-foreground font-semibold">{tech.assigned}</td>
                          <td className="px-5 py-3.5 text-center text-emerald-500 font-bold">{tech.completed}</td>
                          <td className="px-5 py-3.5 text-center text-amber-500 font-bold">{tech.pending}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 font-bold ${
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
                        <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                          No technician assignments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Row 2 / Card 1: Monthly Completed Trends (Mock Chart) */}
            <Card className="border-border/50 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <BarChart3 className="h-4.5 w-4.5 text-primary" />
                  Monthly Completed Trends
                </CardTitle>
                <CardDescription>Operational trends of resolved jobs over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end pt-4 pb-2">
                <div className="flex justify-between items-end h-[200px] px-2 border-b border-border/80 pb-1">
                  {[
                    { month: 'Jan', count: 12, height: '40%' },
                    { month: 'Feb', count: 18, height: '60%' },
                    { month: 'Mar', count: 24, height: '80%' },
                    { month: 'Apr', count: 15, height: '50%' },
                    { month: 'May', count: 30, height: '100%' },
                    { month: 'Jun', count: 22, height: '73%' },
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 w-1/7 group">
                      <span className="text-[10px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {bar.count}
                      </span>
                      <div 
                        style={{ height: bar.height }} 
                        className="w-8 bg-gradient-to-t from-primary/80 to-primary rounded-t-sm transition-all duration-300 hover:from-primary hover:to-primary/90 cursor-pointer shadow-xs" 
                        title={`${bar.count} tasks completed`}
                      />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Row 2 / Card 2: Active Backlog Queue */}
            <Card className="border-border/50 flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-1.5">
                  <Clock className="h-4.5 w-4.5 text-primary" />
                  Active Backlog Queue
                </CardTitle>
                <CardDescription>Unresolved tasks currently pending technician action</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto max-h-[250px] pr-2">
                <div className="space-y-3">
                  {backlogTasks.length > 0 ? (
                    backlogTasks.map((t) => (
                      <div key={t.id} className="flex justify-between items-start p-2.5 rounded-lg border border-border bg-muted/20 text-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-foreground truncate max-w-[220px]">{t.task_title}</p>
                          <p className="text-[10px] text-muted-foreground">{t.customer_name} • {t.location}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          t.status === 'Pending Verification' 
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : t.status === 'In Progress'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">No pending tasks in queue.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* GENERAL FIELD REPORTS TAB */
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name, location, type, or technician..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Card className="border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="px-6 py-3">Customer Name</th>
                      <th className="px-6 py-3">Location</th>
                      <th className="px-6 py-3">Report Type</th>
                      <th className="px-6 py-3">Submitted By</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {filteredReports.length > 0 ? (
                      filteredReports.map((report) => (
                        <tr key={report.id} className="hover:bg-muted/10 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">{report.customer_name}</td>
                          <td className="px-6 py-4 text-muted-foreground">{report.location}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary border border-primary/20">
                              {report.report_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground">
                            {getSubmitterName(report.submitted_by)}
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenReport(report)}
                              className="cursor-pointer"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No field reports found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report View Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md border-border bg-card">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <DialogTitle className="text-md font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      {selectedReport.customer_name}
                    </DialogTitle>
                    <DialogDescription className="text-primary font-semibold text-xs mt-0.5">
                      Type: {selectedReport.report_type}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-xs">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/40 p-4 border">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Location</p>
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedReport.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Submitted By</p>
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {getSubmitterName(selectedReport.submitted_by)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Submission Date</p>
                  <p className="font-semibold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Report Details</p>
                  <div className="rounded-md border p-4 bg-muted/20 whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-2.5">
                <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
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
