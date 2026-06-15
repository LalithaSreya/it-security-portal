import { useEffect, useState } from 'react';
import { 
  Contact2, 
  Users, 
  UserCheck, 
  FileText, 
  ArrowRight,
  Clock,
  ClipboardList,
  CheckCircle,
  CalendarDays,
  CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Lead, type Customer, type Employee, type Survey } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    pendingSurveys: 0,
    todaysAssignments: 0,
    completedSurveys: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [leadsRes, customersRes, employeesRes, surveysRes] = await Promise.all([
          supabase.from('leads').select('*'),
          supabase.from('customers').select('*'),
          supabase.from('employees').select('*'),
          supabase.from('surveys').select('*'),
        ]);

        const leads: Lead[] = leadsRes.data || [];
        const customers: Customer[] = customersRes.data || [];
        const employees: Employee[] = employeesRes.data || [];
        const surveys: Survey[] = surveysRes.data || [];

        const todayStr = new Date().toISOString().split('T')[0];

        // Calculate stats
        const totalLeads = leads.length;
        const totalCustomers = customers.length;
        const totalEmployees = employees.length;
        
        // Pending: status is 'Assigned' or 'In Progress'
        const pendingSurveys = surveys.filter(
          (s) => s.status === 'Assigned' || s.status === 'In Progress'
        ).length;

        // Today's assignments: matching scheduled date
        const todaysAssignments = surveys.filter(
          (s) => s.survey_date === todayStr
        ).length;

        // Completed surveys: waiting for manager approval
        const completedSurveys = surveys.filter((s) => s.status === 'Completed').length;

        setStats({
          totalLeads,
          totalCustomers,
          totalEmployees,
          pendingSurveys,
          todaysAssignments,
          completedSurveys,
        });

        // Get recent 5 leads, sorted by created_at desc
        const sortedLeads = [...leads].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentLeads(sortedLeads.slice(0, 5));
      } catch (err) {
        console.error('Error fetching manager dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Contacted':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Qualified':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Converted':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Closed':
        return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
          <div className="h-4 w-72 animate-pulse rounded bg-muted"></div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 rounded bg-muted"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="col-span-2 animate-pulse h-96"></Card>
          <Card className="animate-pulse h-96"></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Operational Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time visibility into leads, personnel, surveys, and business operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {/* Total Leads */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Leads
            </CardTitle>
            <Contact2 className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalLeads}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Acquired inquiries</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </Card>

        {/* Active Customers */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customers
            </CardTitle>
            <Users className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalCustomers}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active customer bases</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </Card>

        {/* Total Employees */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Employees
            </CardTitle>
            <UserCheck className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalEmployees}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Registered profiles</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </Card>

        {/* Pending Surveys */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Surveys
            </CardTitle>
            <Clock className="h-4.5 w-4.5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-500">
              {stats.pendingSurveys}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Scheduled / In progress</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </Card>

        {/* Today's Assignments */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Today's Work
            </CardTitle>
            <CalendarDays className="h-4.5 w-4.5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-indigo-500">
              {stats.todaysAssignments}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Assigned for today</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500"></div>
        </Card>

        {/* Completed Surveys */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </CardTitle>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-500">
              {stats.completedSurveys}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </Card>
      </div>

      {/* Main Dashboard Rows */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Leads */}
        <Card className="col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Recent Leads</CardTitle>
              <CardDescription>Latest contact inquiries received from company website</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/portal/manager/leads">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Service</th>
                    <th className="px-6 py-3">City</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {recentLeads.length > 0 ? (
                    recentLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-foreground">{lead.name}</td>
                        <td className="px-6 py-3.5 text-muted-foreground">{lead.service_required}</td>
                        <td className="px-6 py-3.5 text-muted-foreground">{lead.city}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-muted-foreground font-medium">
                          {new Date(lead.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No leads found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Operations panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Quick Shortcuts</CardTitle>
            <CardDescription>Shortcut actions for operational managers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2.5">
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/manager/leads">
                  <Contact2 className="mr-2 h-4 w-4" />
                  Manage Leads
                </Link>
              </Button>
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/manager/surveys">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Manage Surveys
                </Link>
              </Button>
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/manager/tasks">
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Task Assignment
                </Link>
              </Button>
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/manager/customers">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border border-dashed p-4.5 bg-muted/20">
              <div className="flex items-center gap-2.5 mb-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Operational Overview</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                As a Manager, you possess administrative access to generate site surveys, delegate assignments to field technicians, register accounts, and approve final reports.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
