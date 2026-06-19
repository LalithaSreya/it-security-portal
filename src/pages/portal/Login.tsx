import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, User, Phone, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  phone: z.string().regex(/^\d{10,15}$/, { message: 'Phone number must be between 10 and 15 digits (digits only).' }),
  role: z.enum(['Manager', 'Technician']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSimLink, setShowSimLink] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Check if we are in recovery mode
  const queryParams = new URLSearchParams(location.search);
  const isRecovery = queryParams.get('type') === 'recovery';

  // Get redirect path
  const from = (location.state as any)?.from?.pathname || '/portal/dashboard';

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Register Form
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    setValue: setSignupValue,
    formState: { errors: signupErrors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'Technician',
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await login(data.email, data.password);
      if (error) {
        setErrorMsg(error.message || 'Login failed. Please check your credentials.');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            employee_name: data.name,
            role: data.role,
            phone: data.phone,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (authData.session) {
        // Logged in immediately (email confirmation is off)
        setSuccessMsg('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 1500);
      } else {
        // Email confirmation is on
        setSuccessMsg('Registration successful! Please check your inbox to confirm your email.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setErrorMsg(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setShowSimLink(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/portal/login?type=recovery',
      });
      if (error) {
        setErrorMsg(error.message || 'Failed to send reset link.');
      } else {
        setSuccessMsg('A password reset link has been sent to your email.');
        // If mock mode, show simulator link
        const isMock = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
        if (isMock) {
          setShowSimLink(true);
        }
      }
    } catch (err: any) {
      console.error('Reset error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setErrorMsg(error.message || 'Failed to update password.');
      } else {
        setSuccessMsg('Password updated successfully! You can now log in.');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/portal/login', { replace: true });
        }, 2000);
      }
    } catch (err: any) {
      console.error('Update password error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            Security Management Portal
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {isForgotPassword 
              ? 'Reset your portal password' 
              : isRecovery 
                ? 'Set your new password' 
                : isRegistering 
                  ? 'Create a new staff account' 
                  : 'Sign in to manage portal operations'}
          </p>
        </div>

        <div className="border border-border/50 bg-card p-8 rounded-2xl shadow-xl dark:shadow-slate-900/50 backdrop-blur-sm">
          {errorMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive dark:bg-destructive/20 border border-destructive/20">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 flex items-center gap-3 rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {isForgotPassword ? (
            /* Forgot Password Request Form */
            <form onSubmit={handleSendResetLink} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    className="pl-10"
                    placeholder="name@company.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {showSimLink && (
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600 dark:text-blue-400">
                  <span className="font-semibold block mb-1">Mock Mode Active:</span>
                  You can simulate clicking the email reset link by clicking here:
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setShowSimLink(false);
                      setSuccessMsg(null);
                      navigate('/portal/login?type=recovery');
                    }}
                    className="font-bold underline ml-1 cursor-pointer block mt-1 hover:text-blue-500 text-left"
                  >
                    Simulate Open Reset Link
                  </button>
                </div>
              )}

              <p className="text-center text-xs text-muted-foreground mt-4">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setIsForgotPassword(false);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          ) : isRecovery ? (
            /* Reset Password Password Form */
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'Reset Password'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Want to cancel?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    navigate('/portal/login', { replace: true });
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Back to Sign In
                </button>
              </p>
            </form>
          ) : !isRegistering ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    placeholder="name@company.com"
                    disabled={isLoading}
                    {...registerLogin('email')}
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-xs text-destructive mt-1">{loginErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setIsForgotPassword(true);
                    }}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...registerLogin('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-destructive mt-1">{loginErrors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setIsRegistering(true);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Register Staff here
                </button>
              </p>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleSignupSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-name"
                    type="text"
                    className="pl-10"
                    placeholder="John Doe"
                    disabled={isLoading}
                    {...registerSignup('name')}
                  />
                </div>
                {signupErrors.name && (
                  <p className="text-xs text-destructive mt-1">{signupErrors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-email"
                    type="email"
                    className="pl-10"
                    placeholder="name@company.com"
                    disabled={isLoading}
                    {...registerSignup('email')}
                  />
                </div>
                {signupErrors.email && (
                  <p className="text-xs text-destructive mt-1">{signupErrors.email.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-phone"
                      type="text"
                      className="pl-10"
                      placeholder="5551234567"
                      disabled={isLoading}
                      {...registerSignup('phone')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setSignupValue('phone', val, { shouldValidate: true });
                      }}
                    />
                  </div>
                  {signupErrors.phone && (
                    <p className="text-xs text-destructive mt-1">{signupErrors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-role">Access Role</Label>
                  <Select
                    defaultValue="Technician"
                    onValueChange={(val) => setSignupValue('role', val as any)}
                  >
                    <SelectTrigger id="reg-role">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Technician">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="pl-10 pr-10"
                    placeholder="••••••••"
                    disabled={isLoading}
                    {...registerSignup('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground focus:outline-none"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="text-xs text-destructive mt-1">{signupErrors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Register Account'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setIsRegistering(false);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Sign In here
                </button>
              </p>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
