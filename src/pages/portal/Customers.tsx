import { useEffect, useState } from 'react';
import { 
  Search, 
  Edit, 
  Eye, 
  RefreshCw, 
  Users,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Plus,
  Trash2
} from 'lucide-react';
import { supabase, type Customer } from '@/lib/supabase';
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

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Detail Modal State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Edit Modal State
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addCity, setAddCity] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Delete Confirm Dialog State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const openAddDialog = () => {
    setAddName('');
    setAddEmail('');
    setAddPhone('');
    setAddCity('');
    setAddAddress('');
    setIsAddOpen(true);
  };

  const handleCreateCustomer = async () => {
    setIsAdding(true);
    try {
      const { error } = await supabase.from('customers').insert({
        customer_name: addName,
        email: addEmail,
        phone: addPhone,
        city: addCity,
        address: addAddress,
      });

      if (error) throw error;
      alert('New customer record created successfully!');
      setIsAddOpen(false);
      loadCustomers();
    } catch (err) {
      console.error('Error creating customer:', err);
      alert('Failed to create customer.');
    } finally {
      setIsAdding(false);
    }
  };

  const openEditDialog = (cust: Customer) => {
    setCustomerToEdit(cust);
    setEditName(cust.customer_name);
    setEditEmail(cust.email);
    setEditPhone(cust.phone);
    setEditCity(cust.city);
    setEditAddress(cust.address);
    setIsEditOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!customerToEdit) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          customer_name: editName,
          email: editEmail,
          phone: editPhone,
          city: editCity,
          address: editAddress,
        })
        .eq('id', customerToEdit.id);

      if (error) throw error;

      setIsEditOpen(false);
      setCustomerToEdit(null);
      loadCustomers();
      alert('Customer record updated successfully!');
    } catch (err) {
      console.error('Error updating customer:', err);
      alert('Failed to save customer changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerToDelete.id);

      if (error) throw error;
      alert('Customer record deleted successfully!');
      setIsDeleteOpen(false);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert('Failed to delete customer.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCustomers = customers.filter((cust) => {
    return (
      cust.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse and manage converted leads and customer contact information.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button onClick={loadCustomers} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Customer
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md bg-card rounded-xl border border-border/50 shadow-sm p-1.5 flex items-center">
        <Search className="absolute left-4.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, city, address..."
          className="pl-9 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="px-6 py-4">Customer Name</TableHead>
              <TableHead className="px-6 py-4">Email Address</TableHead>
              <TableHead className="px-6 py-4">Phone Number</TableHead>
              <TableHead className="px-6 py-4">City</TableHead>
              <TableHead className="px-6 py-4">Address</TableHead>
              <TableHead className="px-6 py-4">Since</TableHead>
              <TableHead className="px-6 py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2].map((i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={7} className="px-6 py-6 text-center">
                    <div className="h-5 w-full rounded bg-muted/60"></div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredCustomers.length > 0 ? (
              filteredCustomers.map((cust) => (
                <TableRow key={cust.id} className="hover:bg-muted/5 transition-colors">
                  <TableCell className="px-6 py-4 font-semibold text-foreground">{cust.customer_name}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{cust.email}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{cust.phone}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">{cust.city}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground max-w-xs truncate">{cust.address}</TableCell>
                  <TableCell className="px-6 py-4 text-muted-foreground">
                    {new Date(cust.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View profile details"
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsDetailOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Edit profile"
                        onClick={() => openEditDialog(cust)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Remove customer"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setCustomerToDelete(cust);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  No matching customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Customer Profile Card
            </DialogTitle>
            <DialogDescription>
              Full account credentials and location addresses.
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-5 py-3 text-sm">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Building className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base leading-none mb-1">
                    {selectedCustomer.customer_name}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">Customer ID: {selectedCustomer.id}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{selectedCustomer.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">{selectedCustomer.city}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-foreground font-medium">
                    Registered on {new Date(selectedCustomer.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 border border-border/50">
                <div className="font-semibold text-foreground mb-1.5 text-xs uppercase text-muted-foreground">
                  Operational Address:
                </div>
                <p className="text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedCustomer.address}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedCustomer && (
              <Button onClick={() => {
                setIsDetailOpen(false);
                openEditDialog(selectedCustomer);
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Customer Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[480px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create New Customer Profile
            </DialogTitle>
            <DialogDescription>
              Add a new corporate or individual customer account directly to the database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-sm">
            <div className="space-y-2">
              <Label htmlFor="add-cust-name">Customer Account Name</Label>
              <Input
                id="add-cust-name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                placeholder="Enter customer name or company name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-cust-email">Email Address</Label>
                <Input
                  id="add-cust-email"
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-cust-phone">Phone Number</Label>
                <Input
                  id="add-cust-phone"
                  value={addPhone}
                  onChange={(e) => setAddPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-cust-city">City</Label>
              <Input
                id="add-cust-city"
                value={addCity}
                onChange={(e) => setAddCity(e.target.value)}
                placeholder="e.g. Dallas"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-cust-address">Operational Address</Label>
              <Textarea
                id="add-cust-address"
                value={addAddress}
                onChange={(e) => setAddAddress(e.target.value)}
                placeholder="Enter billing/operational address details..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCustomer} 
              disabled={isAdding || !addName.trim() || !addEmail.trim() || !addPhone.trim() || !addCity.trim() || !addAddress.trim()}
            >
              {isAdding ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[480px] border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Edit Customer Profile
            </DialogTitle>
            <DialogDescription>
              Update contact information and operational address details.
            </DialogDescription>
          </DialogHeader>

          {customerToEdit && (
            <div className="space-y-4 py-3 text-sm">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Customer Account Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter company or customer name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  placeholder="e.g. Austin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Address Details</Label>
                <Textarea
                  id="edit-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Enter full address details..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving || !editName.trim() || !editEmail.trim() || !editPhone.trim() || !editCity.trim() || !editAddress.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
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
              Confirm Customer Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this customer? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {customerToDelete && (
            <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive dark:bg-destructive/20">
              <span className="font-bold">Target Account: </span>
              {customerToDelete.customer_name} ({customerToDelete.email})
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteCustomer} 
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
