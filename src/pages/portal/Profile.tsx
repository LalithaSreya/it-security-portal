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
  Loader2,
  Settings
} from 'lucide-react';

export default function Profile() {
  const { employee } = useAuth();
  
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [phoneSuccess, setPhoneSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Account settings simulated states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [language, setLanguage] = useState('English');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    if (employee?.phone) {
      setPhone(employee.phone);
    }
  }, [employee]);

  const handleUpdatePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee?.id) return;

    if (!/^\d{10,15}$/.test(phone)) {
      setPhoneError('Phone number must be between 10 and 15 digits.');
      return;
    }
    
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
    
    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
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
      // Verify current password by logging in / re-authenticating
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: employee?.email || '',
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordError('Verification failed: Incorrect current password.');
        setIsUpdatingPassword(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    setSettingsSuccess(false);
    setTimeout(() => {
      setIsUpdatingSettings(false);
      setSettingsSuccess(true);
    }, 600);
  };

  return (
    <div className="space-y-6 w-full">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Profile Details Card */}
        {employee && (
          <Card className="shadow-xs border-border/60 flex flex-col">
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
            <CardContent className="pt-2 flex-1 space-y-4 text-sm flex flex-col justify-center">
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
        <Card className="shadow-xs flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold flex items-center gap-1.5">
              <Phone className="h-4.5 w-4.5 text-primary" />
              Contact Details
            </CardTitle>
            <CardDescription className="text-xs">
              Update your primary phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <form onSubmit={handleUpdatePhone} className="space-y-4 flex flex-col h-full justify-between">
              <div className="space-y-4">
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
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="5551234567"
                    disabled={isUpdatingPhone}
                    className="py-4"
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full font-semibold cursor-pointer mt-4" disabled={isUpdatingPhone}>
                {isUpdatingPhone ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Update Card */}
        <Card className="shadow-xs flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold flex items-center gap-1.5">
              <Lock className="h-4.5 w-4.5 text-primary" />
              Security Credentials
            </CardTitle>
            <CardDescription className="text-xs">
              Change your account security password.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <form onSubmit={handleUpdatePassword} className="space-y-4 flex flex-col h-full justify-between">
              <div className="space-y-3.5">
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
                <div className="space-y-1.5">
                  <Label htmlFor="current-pass" className="text-xs font-semibold">Current Password</Label>
                  <Input
                    id="current-pass"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    disabled={isUpdatingPassword}
                    className="py-4"
                  />
                </div>
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
              <Button type="submit" size="sm" className="w-full font-semibold cursor-pointer mt-4" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card className="shadow-xs flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-md font-bold flex items-center gap-1.5">
              <Settings className="h-4.5 w-4.5 text-primary" />
              Account Settings
            </CardTitle>
            <CardDescription className="text-xs">
              Manage your app preferences and notification settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            <form onSubmit={handleSaveSettings} className="space-y-4 flex flex-col h-full justify-between">
              <div className="space-y-4">
                {settingsSuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-md p-3 flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Preferences saved successfully!</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-xs font-semibold cursor-pointer">Email Notifications</Label>
                    <p className="text-[10px] text-muted-foreground">Receive daily summaries and task updates.</p>
                  </div>
                  <input
                    id="email-notifications"
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </div>
                
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-alerts" className="text-xs font-semibold cursor-pointer">SMS Alerts</Label>
                    <p className="text-[10px] text-muted-foreground">Get text updates for emergency task status.</p>
                  </div>
                  <input
                    id="sms-alerts"
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="language" className="text-xs font-semibold">Language Preference</Label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="English">English (US)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                  </select>
                </div>
              </div>
              <Button type="submit" size="sm" className="w-full font-semibold cursor-pointer mt-4" disabled={isUpdatingSettings}>
                {isUpdatingSettings ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                Save Preferences
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
