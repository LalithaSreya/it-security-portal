import { useEffect, useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw, 
  UserCheck,
  ShieldAlert
} from 'lucide-react';
import { supabase, type Employee, isUsingMock } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function Employees() {
  const { employee: currentEmployee } = useAuth();
  const isManager = currentEmployee?.role === 'Manager';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog State
  const [isOpen, setIsOpen] = useState(false); // Add/Edit Dialog
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null); // null means adding

  // Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empRole, setEmpRole] = useState<'Manager' | 'Technician'>('Technician');
  const [empStatus, setEmpStatus] = useState<'Active' | 'Inactive'>('Active');
  const [empPassword, setEmpPassword] = useState('password123'); // Default password for new auth account
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirm Dialog State
  const [empToDelete, setEmpToDelete] = useState<Employee | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('employee_name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const openAddDialog = () => {
    setSelectedEmp(null);
    setEmpName('');
    setEmpEmail('');
    setEmpPhone('');
    setEmpRole('Technician');
    setEmpStatus('Active');
    setEmpPassword('password123');
    setIsOpen(true);
  };

  const openEditDialog = (emp: Employee) => {
    setSelectedEmp(emp);
    setEmpName(emp.employee_name);
    setEmpEmail(emp.email);
    setEmpPhone(emp.phone || '');
    setEmpRole(emp.role === 'Admin' ? 'Manager' : emp.role);
    setEmpStatus(emp.status);
    setIsOpen(true);
  };

  const handleSaveEmployee = async () => {
    if (!isManager) {
      alert('Unauthorized! Only Managers can modify employee records.');
      return;
    }
    
    setIsSaving(true);
    try {
      if (selectedEmp) {
        // Edit Mode
        const { error } = await supabase
          .from('employees')
          .update({
            employee_name: empName,
            email: empEmail,
            phone: empPhone,
            role: empRole,
            status: empStatus,
          })
          .eq('id', selectedEmp.id);

        if (error) throw error;
        alert('Employee updated successfully!');
      } else {
        // Add Mode
        if (!isUsingMock) {
          // Real Supabase backend:
          // Call the signUp API via raw fetch to create the auth.users account without signing out the Manager.
          const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
          let cleanUrl = rawUrl.trim();
          if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);
          if (cleanUrl.endsWith('/rest/v1')) cleanUrl = cleanUrl.slice(0, -8);
          if (cleanUrl.endsWith('/')) cleanUrl = cleanUrl.slice(0, -1);

          const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

          if (!cleanUrl || !anonKey) {
            throw new Error('Supabase URL or Anon key is missing in environment variables.');
          }

          const response = await fetch(`${cleanUrl}/auth/v1/signup`, {
            method: 'POST',
            headers: {
              'apikey': anonKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: empEmail.trim(),
              password: empPassword,
              data: {
                employee_name: empName.trim(),
                role: empRole,
                phone: empPhone.trim()
              }
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData?.error_description || errData?.msg || errData?.message || 'Failed to register authentication account.');
          }

          const resData = await response.json();
          const userId = resData?.user?.id;

          if (userId && empStatus === 'Inactive') {
            // Wait brief moment for DB sync trigger to finish inserting profile row
            await new Promise(resolve => setTimeout(resolve, 800));
            await supabase
              .from('employees')
              .update({ status: 'Inactive' })
              .eq('id', userId);
          }

          alert('New employee added successfully!');
        } else {
          // Mock local storage mode:
          const newId = `emp-${Math.random().toString(36).substr(2, 9)}`;
          const { error } = await supabase.from('employees').insert({
            id: newId,
            employee_name: empName,
            email: empEmail,
            phone: empPhone,
            role: empRole,
            status: empStatus,
          });

          if (error) throw error;
          alert('New employee added successfully!');
        }
      }

      setIsOpen(false);
      loadEmployees();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      alert(err.message || 'Failed to save employee record.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!empToDelete) return;
    if (!isManager) {
      alert('Unauthorized! Only Managers can delete employee records.');
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', empToDelete.id);

      if (error) throw error;

      setIsDeleteOpen(false);
      setEmpToDelete(null);
      loadEmployees();
      alert('Employee deleted successfully!');
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Failed to delete employee record.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone && emp.phone.includes(searchTerm))
    );
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Manager':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Technician':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
      : 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isManager 
              ? 'Add, update, or remove internal employee access and credentials.' 
              : 'Browse employee list directory. Modify capabilities restricted to Manager users.'}
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={loadEmployees} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          {isManager && (
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* RLS Warnings for Technician */}
      {!isManager && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-500">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div>
            <span className="font-bold">Technician Mode: </span>
            You have read-only access to this directory. Creating, editing, or deleting employees requires Manager role permissions.
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md bg-card rounded-xl border border-border/50 shadow-sm p-1.5 flex items-center">
        <Search className="absolute left-4.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, role or phone..."
          className="pl-9 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Employees Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="px-6 py-4">Employee Name</TableHead>
              <TableHead className="px-6 py-4">Role</TableHead>
              <TableHead className="px-6 py-4">Email Address</TableHead>
              <TableHead className="px-6 py-4">Phone Number</TableHead>
              <TableHead className="px-6 py-4">Status</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2].map((i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={6} className="px-6 py-6 text-center">
                    <div className="h-5 w-full rounded bg-muted/60"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 py-4 font-semibold text-foreground">{emp.employee_name}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getRoleColor(emp.role)}`}>
                      {emp.role}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{emp.email}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{emp.phone || 'N/A'}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {isManager ? (
                      <div className="flex justify-end items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit employee details"
                          onClick={() => openEditDialog(emp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Remove employee"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setEmpToDelete(emp);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium italic">Read-only</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No matching employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Employee Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[480px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              {selectedEmp ? 'Edit Employee Details' : 'Add New Employee'}
            </DialogTitle>
            <DialogDescription>
              {selectedEmp 
                ? 'Update employee name, role level, and contact info.' 
                : 'Initialize a new team member. They can log in to the portal using their email.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-2">
              <Label htmlFor="emp-name">Employee Full Name</Label>
              <Input
                id="emp-name"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                placeholder="Johnathan Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp-email">Email Address</Label>
                <Input
                  id="emp-email"
                  type="email"
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  placeholder="name@itsec.com"
                  disabled={Boolean(selectedEmp)} // Email cannot be changed once created for mock mapping
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emp-phone">Phone Number</Label>
                <Input
                  id="emp-phone"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            {!selectedEmp && (
              <div className="space-y-2">
                <Label htmlFor="emp-password">Login Password (for new staff)</Label>
                <Input
                  id="emp-password"
                  type="password"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  placeholder="Minimum 6 characters (default: password123)"
                  disabled={isSaving}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emp-role">Access Role</Label>
                <Select
                  value={empRole}
                  onValueChange={(val) => setEmpRole(val as any)}
                >
                  <SelectTrigger id="emp-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emp-status">Employment Status</Label>
                <Select
                  value={empStatus}
                  onValueChange={(val) => setEmpStatus(val as any)}
                >
                  <SelectTrigger id="emp-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEmployee} 
              disabled={isSaving || !empName.trim() || !empEmail.trim() || !empPhone.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Employee'}
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
              Confirm Employee Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {empToDelete && (
            <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive dark:bg-destructive/20">
              <span className="font-bold">Target Account: </span>
              {empToDelete.employee_name} ({empToDelete.email})
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteEmployee} 
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
