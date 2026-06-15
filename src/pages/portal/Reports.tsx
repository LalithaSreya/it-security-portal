import { useEffect, useState } from 'react';
import { supabase, type Report, type Employee } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Search, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  Eye
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search filter
  const [search, setSearch] = useState('');

  // Selected Report Modal State
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [reportsRes, employeesRes] = await Promise.all([
          supabase.from('reports').select('*').order('created_at', { ascending: false }),
          supabase.from('employees').select('*'),
        ]);

        if (reportsRes.error) throw reportsRes.error;
        if (employeesRes.error) throw employeesRes.error;

        setReports(reportsRes.data || []);
        setEmployees(employeesRes.data || []);
      } catch (err) {
        console.error('Error fetching field reports:', err);
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

  // Filtered reports
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
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          General Field Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Review general reports, site updates, and observations submitted by field technicians.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by customer name, location, type, or technician..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Reports Table Card */}
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

      {/* Report View Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          {selectedReport && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary shrink-0" />
                      {selectedReport.customer_name}
                    </DialogTitle>
                    <DialogDescription className="text-primary font-semibold text-xs mt-0.5">
                      Type: {selectedReport.report_type}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 pt-2 text-sm">
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 dark:bg-slate-900 p-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Location</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {selectedReport.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Submitted By</p>
                    <p className="font-medium text-foreground flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {getSubmitterName(selectedReport.submitted_by)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Submission Date</p>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Report Details</p>
                  <div className="rounded-md bg-slate-100 dark:bg-slate-900 border p-4 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedReport.description}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
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
