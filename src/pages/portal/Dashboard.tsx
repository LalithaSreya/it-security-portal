import { useEffect, useState } from 'react';
import { 
  Contact2, 
  Users, 
  UserCheck, 
  TrendingUp, 
  FileText, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Lead, type Customer, type Employee } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalCustomers: 0,
    totalEmployees: 0,
    newLeads: 0,
    convertedLeads: 0,
  });
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        // Fetch all tables
        const [leadsRes, customersRes, employeesRes] = await Promise.all([
          supabase.from('leads').select('*'),
          supabase.from('customers').select('*'),
          supabase.from('employees').select('*'),
        ]);

        const leads: Lead[] = leadsRes.data || [];
        const customers: Customer[] = customersRes.data || [];
        const employees: Employee[] = employeesRes.data || [];

        // Calculate stats
        const totalLeads = leads.length;
        const totalCustomers = customers.length;
        const totalEmployees = employees.length;
        const newLeads = leads.filter((l) => l.status === 'New').length;
        const convertedLeads = leads.filter((l) => l.status === 'Converted').length;

        setStats({
          totalLeads,
          totalCustomers,
          totalEmployees,
          newLeads,
          convertedLeads,
        });

        // Get recent 5 leads, sorted by created_at desc
        const sortedLeads = [...leads].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setRecentLeads(sortedLeads.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
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
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome to the IT Security & Solutions Management Portal.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
            <p className="text-[10px] text-muted-foreground mt-1">Total inquiries received</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        </Card>

        {/* Total Customers */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Customers
            </CardTitle>
            <Users className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalCustomers}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Active customer accounts</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
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
            <p className="text-[10px] text-muted-foreground mt-1">Registered team members</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-500"></div>
        </Card>

        {/* New Leads */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              New Leads
            </CardTitle>
            <Clock className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-blue-500 dark:text-blue-400">
              {stats.newLeads}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Requires follow-up action</p>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
        </Card>

        {/* Converted Leads */}
        <Card className="relative overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Converted
            </CardTitle>
            <TrendingUp className="h-4.5 w-4.5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-emerald-500 dark:text-emerald-400">
              {stats.convertedLeads}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Conversion rate: {stats.totalLeads > 0 ? Math.round((stats.convertedLeads / stats.totalLeads) * 100) : 0}%</p>
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
              <Link to="/portal/leads">
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
            <CardTitle className="text-lg font-bold">Quick Operations</CardTitle>
            <CardDescription>Shortcut actions for administration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2.5">
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/leads">
                  <Contact2 className="mr-2 h-4 w-4" />
                  Manage Leads
                </Link>
              </Button>
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/customers">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Customers
                </Link>
              </Button>
              <Button className="w-full justify-start text-left" variant="outline" asChild>
                <Link to="/portal/employees">
                  <UserCheck className="mr-2 h-4 w-4" />
                  Manage Employees
                </Link>
              </Button>
            </div>

            <div className="rounded-lg border border-dashed p-4.5 bg-muted/20">
              <div className="flex items-center gap-2.5 mb-2">
                <FileText className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Phase 2 Scope</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We are currently running the Internal Portal Foundation. Real database updates will apply to local storage mock data unless a real Supabase URL is specified in the environment file.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
