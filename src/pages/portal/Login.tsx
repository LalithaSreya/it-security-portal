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
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  role: z.enum(['Admin', 'Manager', 'Technician']),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Get redirect path
  const from = (location.state as any)?.from?.pathname || '/portal/dashboard';

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
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
      const { error } = await login(data.email);
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

  const autofill = (email: string) => {
    setLoginValue('email', email);
    setLoginValue('password', 'password123');
    setErrorMsg(null);
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
            {isRegistering ? 'Create a new staff account' : 'Sign in to manage portal operations'}
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

          {!isRegistering ? (
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
                <Label htmlFor="password">Password</Label>
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
                      <SelectItem value="Admin">Admin</SelectItem>
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

          {/* Quick Demo Credentials (only visible when not registering) */}
          {!isRegistering && (
            <div className="mt-8 border-t pt-6 border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center mb-4">
                Demo Access Credentials (Local Mock)
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  type="button"
                  onClick={() => autofill('admin@itsec.com')}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2 text-xs font-medium hover:bg-muted/70 transition-colors text-left"
                >
                  <div>
                    <span className="font-bold text-foreground">Admin: </span>
                    <span className="text-muted-foreground">admin@itsec.com</span>
                  </div>
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    Full Access
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => autofill('manager@itsec.com')}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2 text-xs font-medium hover:bg-muted/70 transition-colors text-left"
                >
                  <div>
                    <span className="font-bold text-foreground">Manager: </span>
                    <span className="text-muted-foreground">manager@itsec.com</span>
                  </div>
                  <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
                    Operations
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => autofill('tech@itsec.com')}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-4 py-2 text-xs font-medium hover:bg-muted/70 transition-colors text-left"
                >
                  <div>
                    <span className="font-bold text-foreground">Technician: </span>
                    <span className="text-muted-foreground">tech@itsec.com</span>
                  </div>
                  <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Restricted
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
