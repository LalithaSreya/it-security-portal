import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Phone, 
  Mail, 
  Lock, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function Profile() {
  const { employee } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [phoneSuccess, setPhoneSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (employee?.phone) {
      setPhone(employee.phone);
    }
  }, [employee]);

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) return;
    
    setIsUpdatingPhone(true);
    setPhoneSuccess(false);
    setPhoneError('');

    try {
      const { error } = await supabase
        .from('employees')
        .update({ phone: phone.trim() })
        .eq('id', employee.id);

      if (error) throw error;
      setPhoneSuccess(true);
    } catch (err: any) {
      console.error('Error updating phone number:', err);
      setPhoneError(err.message || 'Failed to update phone number.');
    } finally {
      setIsUpdatingPhone(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(false);
    setPasswordError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          User Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          View your credentials and manage security settings.
        </p>
      </div>

      {/* Profile Details Card */}
      {employee && (
        <Card className="shadow-xs border-border/60">
          <CardHeader className="pb-3 flex flex-row items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center font-bold text-lg shrink-0">
              {employee.employee_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg font-bold leading-tight">{employee.employee_name}</CardTitle>
              <CardDescription className="text-xs font-semibold text-primary mt-0.5 uppercase tracking-wider">
                {employee.role}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-3.5 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase leading-none">Email Address</p>
                <p className="font-semibold text-foreground mt-1">{employee.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle className="h-4.5 w-4.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase leading-none">Account Status</p>
                <p className="font-semibold text-emerald-500 mt-1">{employee.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Phone Number */}
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-bold flex items-center gap-1.5">
            <Phone className="h-4.5 w-4.5 text-primary" />
            Contact Details
          </CardTitle>
          <CardDescription className="text-xs">
            Update your primary phone number.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePhone} className="space-y-4">
            {phoneSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-md p-3 flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Phone number updated successfully!</span>
              </div>
            )}
            {phoneError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md p-3 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{phoneError}</span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                disabled={isUpdatingPhone}
                className="py-4"
              />
            </div>
            <Button type="submit" size="sm" className="w-full font-semibold cursor-pointer" disabled={isUpdatingPhone}>
              {isUpdatingPhone ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Update Card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-md font-bold flex items-center gap-1.5">
            <Lock className="h-4.5 w-4.5 text-primary" />
            Security Credentials
          </CardTitle>
          <CardDescription className="text-xs">
            Change your account security password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-md p-3 flex items-center gap-2 font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                <span>Password changed successfully!</span>
              </div>
            )}
            {passwordError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md p-3 flex items-center gap-2 font-medium">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}
            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="new-pass" className="text-xs font-semibold">New Password</Label>
                <Input
                  id="new-pass"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  disabled={isUpdatingPassword}
                  className="py-4"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-pass" className="text-xs font-semibold">Confirm Password</Label>
                <Input
                  id="confirm-pass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={isUpdatingPassword}
                  className="py-4"
                />
              </div>
            </div>
            <Button type="submit" size="sm" className="w-full font-semibold cursor-pointer" disabled={isUpdatingPassword}>
              {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
