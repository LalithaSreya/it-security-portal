import { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw, 
  UserCheck, 
  AlertCircle,
  FileText,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { supabase, type Lead } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Detail Modal State
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Add/Edit Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null); // null means adding

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formService, setFormService] = useState('CCTV Installation');
  const [formMessage, setFormMessage] = useState('');
  const [formStatus, setFormStatus] = useState<Lead['status']>('New');
  const [isSavingLead, setIsSavingLead] = useState(false);

  // Survey Dialog State
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [surveyCustName, setSurveyCustName] = useState('');
  const [surveyService, setSurveyService] = useState('');
  const [surveyLocation, setSurveyLocation] = useState('');
  const [surveyTechId, setSurveyTechId] = useState('');
  const [surveyDate, setSurveyDate] = useState('');
  const [isSavingSurvey, setIsSavingSurvey] = useState(false);

  // Conversion Modal State
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [custAddress, setCustAddress] = useState('');
  const [custName, setCustName] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Delete Confirm Dialog State
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Edit State
  const [isStatusUpdating, setIsStatusUpdating] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (err) {
      console.error('Error loading leads:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('role', 'Technician')
        .eq('status', 'Active');
      if (error) throw error;
      setTechnicians(data || []);
    } catch (err) {
      console.error('Error loading technicians:', err);
    }
  };

  useEffect(() => {
    loadLeads();
    loadTechnicians();
  }, []);

  const handleUpdateStatus = async (leadId: string, newStatus: Lead['status']) => {
    setIsStatusUpdating(leadId);
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
      
      // Update local state
      setLeads(prev => prev.map(lead => lead.id === leadId ? { ...lead, status: newStatus } : lead));
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update lead status.');
    } finally {
      setIsStatusUpdating(null);
    }
  };

  const openAddDialog = () => {
    setLeadToEdit(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCity('');
    setFormService('CCTV Installation');
    setFormMessage('');
    setFormStatus('New');
    setIsFormOpen(true);
  };

  const openEditDialog = (lead: Lead) => {
    setLeadToEdit(lead);
    setFormName(lead.name);
    setFormEmail(lead.email);
    setFormPhone(lead.phone);
    setFormCity(lead.city);
    setFormService(lead.service_required);
    setFormMessage(lead.message);
    setFormStatus(lead.status);
    setIsFormOpen(true);
  };

  const handleSaveLead = async () => {
    setIsSavingLead(true);
    try {
      if (leadToEdit) {
        // Edit Mode
        const { error } = await supabase
          .from('leads')
          .update({
            name: formName,
            email: formEmail,
            phone: formPhone,
            city: formCity,
            service_required: formService,
            message: formMessage,
            status: formStatus,
          })
          .eq('id', leadToEdit.id);

        if (error) throw error;
        alert('Lead updated successfully!');
      } else {
        // Add Mode
        const { error } = await supabase.from('leads').insert({
          name: formName,
          email: formEmail,
          phone: formPhone,
          city: formCity,
          service_required: formService,
          message: formMessage,
          status: formStatus,
        });

        if (error) throw error;
        alert('New lead created successfully!');
      }

      setIsFormOpen(false);
      loadLeads();
    } catch (err) {
      console.error('Error saving lead:', err);
      alert('Failed to save lead.');
    } finally {
      setIsSavingLead(false);
    }
  };

  const openSurveyDialog = (lead: Lead) => {
    setSurveyCustName(lead.name);
    setSurveyService(lead.service_required);
    setSurveyLocation(lead.city);
    setSurveyTechId('');
    // Default to tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSurveyDate(tomorrow.toISOString().split('T')[0]);
    setIsSurveyOpen(true);
  };

  const handleCreateSurvey = async () => {
    if (!selectedLead) return;
    if (!surveyTechId) {
      alert('Please select a technician to assign.');
      return;
    }
    if (!surveyDate) {
      alert('Please select a survey date.');
      return;
    }

    setIsSavingSurvey(true);
    try {
      // 1. Insert survey record
      const { error: surveyError } = await supabase
        .from('surveys')
        .insert({
          lead_id: selectedLead.id,
          customer_name: surveyCustName,
          service_type: surveyService,
          location: surveyLocation,
          assigned_technician: surveyTechId,
          survey_date: surveyDate,
          status: 'Assigned',
          photos: []
        });

      if (surveyError) throw surveyError;

      // 2. Update lead status to 'Qualified' if it is 'New' or 'Contacted'
      if (selectedLead.status === 'New' || selectedLead.status === 'Contacted') {
        await supabase
          .from('leads')
          .update({ status: 'Qualified' })
          .eq('id', selectedLead.id);
      }

      alert('Survey assigned and created successfully!');
      setIsSurveyOpen(false);
      loadLeads();
    } catch (err) {
      console.error('Error creating survey:', err);
      alert('Failed to create survey.');
    } finally {
      setIsSavingSurvey(false);
    }
  };

  const openConversionDialog = (lead: Lead) => {
    setLeadToConvert(lead);
    setCustName(lead.name);
    setCustAddress('');
    setIsConvertOpen(true);
  };

  const handleConvertLead = async () => {
    if (!leadToConvert) return;
    setIsConverting(true);
    try {
      // 1. Create customer record
      const { error: customerError } = await supabase.from('customers').insert({
        customer_name: custName,
        phone: leadToConvert.phone,
        email: leadToConvert.email,
        city: leadToConvert.city,
        address: custAddress || 'No address provided',
      });

      if (customerError) throw customerError;

      // 2. Update lead status to 'Converted'
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'Converted' })
        .eq('id', leadToConvert.id);

      if (leadError) throw leadError;

      // Reset and reload
      setIsConvertOpen(false);
      setLeadToConvert(null);
      loadLeads();
      alert('Lead successfully converted to Customer!');
    } catch (err) {
      console.error('Error converting lead:', err);
      alert('Failed to convert lead to customer.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadToDelete.id);

      if (error) throw error;

      setIsDeleteOpen(false);
      setLeadToDelete(null);
      loadLeads();
      alert('Lead deleted successfully!');
    } catch (err) {
      console.error('Error deleting lead:', err);
      alert('Failed to delete lead.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering & Searching logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.service_required.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review contact enquiries, qualify prospects, and convert them to customers.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={loadLeads} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Lead
          </Button>
        </div>
      </div>

      {/* Filters & Search controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, city or service..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Converted">Converted</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="px-6 py-4">Name</TableHead>
              <TableHead className="px-6 py-4">Service Required</TableHead>
              <TableHead className="px-6 py-4">Contact Info</TableHead>
              <TableHead className="px-6 py-4">Location</TableHead>
              <TableHead className="px-6 py-4">Status</TableHead>
              <TableHead className="px-6 py-4">Date</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={7} className="px-6 py-6 text-center">
                    <div className="h-5 w-full rounded bg-muted/60"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredLeads.length > 0 ? (
              filteredLeads.map((lead) => (
                <TableRow key={lead.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 py-4 font-semibold text-foreground">{lead.name}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{lead.service_required}</TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="text-xs space-y-0.5">
                      <div className="text-foreground font-medium">{lead.email}</div>
                      <div className="text-muted-foreground">{lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{lead.city}</TableCell>
                  <TableCell className="px-6 py-4">
                    <Select
                      disabled={isStatusUpdating === lead.id || lead.status === 'Converted'}
                      value={lead.status}
                      onValueChange={(val) => {
                        if (val === 'Converted') {
                          openConversionDialog(lead);
                        } else {
                          handleUpdateStatus(lead.id, val as Lead['status']);
                        }
                      }}
                    >
                      <SelectTrigger className={`h-7 w-[120px] text-xs font-semibold rounded-full border px-2.5 py-0.5 ${getStatusColor(lead.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Contacted">Contacted</SelectItem>
                        <SelectItem value="Qualified">Qualified</SelectItem>
                        <SelectItem value="Converted" disabled>Converted</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View details"
                        onClick={() => {
                          setSelectedLead(lead);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit lead"
                        onClick={() => openEditDialog(lead)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete lead"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setLeadToDelete(lead);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs ml-1.5"
                        disabled={lead.status === 'Converted'}
                        onClick={() => openConversionDialog(lead)}
                      >
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                        Convert
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No matching leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Lead Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[550px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Lead Information Details
            </DialogTitle>
            <DialogDescription>
              Details of the inquiry message submitted by the customer.
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-5 py-4 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Prospect Name</span>
                  <div className="font-bold text-foreground text-base">{selectedLead.name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</span>
                  <div>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{selectedLead.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{selectedLead.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">{selectedLead.city}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">
                    Received on {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/30 p-4 border border-border/50">
                <div className="font-semibold text-foreground mb-1 text-xs uppercase text-muted-foreground">
                  Service Requested:
                </div>
                <div className="text-foreground font-bold text-sm mb-3">
                  {selectedLead.service_required}
                </div>
                <div className="font-semibold text-foreground mb-1 text-xs uppercase text-muted-foreground">
                  Inquiry Message:
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedLead && selectedLead.status !== 'Converted' && (
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setIsDetailOpen(false);
                    openSurveyDialog(selectedLead);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Assign Survey
                </Button>
                <Button onClick={() => {
                  setIsDetailOpen(false);
                  openConversionDialog(selectedLead);
                }}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Convert to Customer
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Survey Dialog */}
      <Dialog open={isSurveyOpen} onOpenChange={setIsSurveyOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Assign Site Survey
            </DialogTitle>
            <DialogDescription>
              Schedule a site survey and assign a technician to inspect the premises.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-2">
              <Label htmlFor="survey-cust">Customer Name</Label>
              <Input
                id="survey-cust"
                value={surveyCustName}
                onChange={(e) => setSurveyCustName(e.target.value)}
                placeholder="Customer Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="survey-service">Service Type</Label>
                <Input
                  id="survey-service"
                  value={surveyService}
                  onChange={(e) => setSurveyService(e.target.value)}
                  placeholder="e.g. CCTV Installation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="survey-loc">Location / City</Label>
                <Input
                  id="survey-loc"
                  value={surveyLocation}
                  onChange={(e) => setSurveyLocation(e.target.value)}
                  placeholder="e.g. New York"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="survey-tech">Assign Technician</Label>
                <select
                  id="survey-tech"
                  value={surveyTechId}
                  onChange={(e) => setSurveyTechId(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground bg-card"
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
                <Label htmlFor="survey-date">Scheduled Date</Label>
                <Input
                  id="survey-date"
                  type="date"
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSurveyOpen(false)} disabled={isSavingSurvey}>
              Cancel
            </Button>
            <Button onClick={handleCreateSurvey} disabled={isSavingSurvey}>
              {isSavingSurvey ? 'Assigning...' : 'Assign & Create Survey'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Lead Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {leadToEdit ? 'Edit Lead Details' : 'Create New Lead'}
            </DialogTitle>
            <DialogDescription>
              {leadToEdit ? 'Update lead credentials and service parameters.' : 'Register a new lead directly into the database.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-2">
              <Label htmlFor="lead-name">Prospect Name</Label>
              <Input
                id="lead-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Full Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-email">Email Address</Label>
                <Input
                  id="lead-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lead-phone">Phone Number</Label>
                <Input
                  id="lead-phone"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lead-city">City</Label>
                <Input
                  id="lead-city"
                  value={formCity}
                  onChange={(e) => setFormCity(e.target.value)}
                  placeholder="City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-status">Lead Status</Label>
                <Select
                  value={formStatus}
                  onValueChange={(val) => setFormStatus(val as any)}
                  disabled={formStatus === 'Converted'} // Cannot change from Converted back to normal
                >
                  <SelectTrigger id="lead-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Converted" disabled>Converted</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-service">Service Required</Label>
              <Select
                value={formService}
                onValueChange={setFormService}
              >
                <SelectTrigger id="lead-service">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CCTV Installation">CCTV Installation</SelectItem>
                  <SelectItem value="CCTV Maintenance">CCTV Maintenance</SelectItem>
                  <SelectItem value="Access Control">Access Control Systems</SelectItem>
                  <SelectItem value="Fire Alarm System">Fire Alarm System</SelectItem>
                  <SelectItem value="Video Door Phone">Video Door Phone</SelectItem>
                  <SelectItem value="Biometric System">Biometric System</SelectItem>
                  <SelectItem value="AMC Service">Annual Maintenance Contract (AMC)</SelectItem>
                  <SelectItem value="Technical Support">Technical Support</SelectItem>
                  <SelectItem value="Other">Other / General Inquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead-message">Requirements Detail</Label>
              <Textarea
                id="lead-message"
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Describe specific customer security needs..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSavingLead}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveLead} 
              disabled={isSavingLead || !formName.trim() || !formEmail.trim() || !formPhone.trim() || !formCity.trim() || !formMessage.trim()}
            >
              {isSavingLead ? 'Saving...' : 'Save Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Convert to Customer Dialog */}
      <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              Convert Lead to Customer
            </DialogTitle>
            <DialogDescription>
              Confirming conversion. This will automatically create a profile in the Customers module and mark the Lead status as Converted.
            </DialogDescription>
          </DialogHeader>

          {leadToConvert && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-emerald-500/5 p-4 border border-emerald-500/10 flex gap-3 text-sm text-emerald-800 dark:text-emerald-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>
                  You are converting <strong>{leadToConvert.name}</strong>. The customer profile will be initialized with their submitted contact credentials.
                </p>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <Label htmlFor="cust-name">Customer Account Name</Label>
                  <Input
                    id="cust-name"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    placeholder="Enter customer name or company name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Email Address</Label>
                    <div className="font-semibold py-1">{leadToConvert.email}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground uppercase">Phone Number</Label>
                    <div className="font-semibold py-1">{leadToConvert.phone}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cust-address">Address Detail (Required)</Label>
                  <Textarea
                    id="cust-address"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    placeholder="Enter full billing or shipping address..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConvertOpen(false)} disabled={isConverting}>
              Cancel
            </Button>
            <Button 
              onClick={handleConvertLead} 
              disabled={isConverting || !custAddress.trim() || !custName.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isConverting ? 'Converting...' : 'Confirm Conversion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[420px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirm Lead Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {leadToDelete && (
            <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive dark:bg-destructive/20">
              <span className="font-bold">Target Lead: </span>
              {leadToDelete.name} ({leadToDelete.email})
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteLead} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
