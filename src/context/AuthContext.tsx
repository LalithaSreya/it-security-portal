import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Employee } from '@/lib/supabase';

interface AuthContextType {
  user: any | null;
  employee: Employee | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<{ error: any }>;
  logout: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch employee record matching the auth user ID
  const fetchEmployeeData = async (userId: string): Promise<Employee | null> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        const emp = data[0] as Employee;
        setEmployee(emp);
        return emp;
      } else {
        setEmployee(null);
        return null;
      }
    } catch (err) {
      console.error('Error fetching employee details:', err);
      setEmployee(null);
      return null;
    }
  };

  useEffect(() => {
    let subscription: any = null;

    const setupAuth = async () => {
      // Get initial session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      const handleUserAuth = async (currUser: any) => {
        setUser(currUser);
        if (currUser) {
          const emp = await fetchEmployeeData(currUser.id);
          if (emp && emp.role === 'Technician' && emp.status !== 'Active') {
            await supabase
              .from('employees')
              .update({ status: 'Active' })
              .eq('id', currUser.id);
            setEmployee({ ...emp, status: 'Active' });
          }
        } else {
          setEmployee(null);
        }
      };

      if (session?.user) {
        await handleUserAuth(session.user);
      } else {
        setUser(null);
        setEmployee(null);
      }
      setLoading(false);

      // Listen to auth changes
      const authListener = supabase.auth.onAuthStateChange(async (_event: string, currentSession: any) => {
        setLoading(true);
        if (currentSession?.user) {
          await handleUserAuth(currentSession.user);
        } else {
          setUser(null);
          setEmployee(null);
        }
        setLoading(false);
      });

      subscription = authListener.data.subscription;
    };

    setupAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password = 'password123') => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    if (data?.user) {
      setUser(data.user);
      const emp = await fetchEmployeeData(data.user.id);
      if (emp && emp.role === 'Technician') {
        await supabase
          .from('employees')
          .update({ status: 'Active' })
          .eq('id', data.user.id);
        setEmployee({ ...emp, status: 'Active' });
      }
    }

    return { error: null };
  };

  const logout = async () => {
    if (user && employee?.role === 'Technician') {
      try {
        await supabase
          .from('employees')
          .update({ status: 'Inactive' })
          .eq('id', user.id);
      } catch (err) {
        console.error('Failed to set status to Inactive on logout:', err);
      }
    }
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setEmployee(null);
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, employee, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
