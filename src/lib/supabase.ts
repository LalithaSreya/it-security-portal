import { createClient } from '@supabase/supabase-js';

// Env variables for real Supabase
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Clean URL in case it has trailing slashes or /rest/v1 appended from the Data API tab
let supabaseUrl = rawSupabaseUrl.trim();
if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}
if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.slice(0, -8);
}
if (supabaseUrl.endsWith('/')) {
  supabaseUrl = supabaseUrl.slice(0, -1);
}

const isRealSupabase = Boolean(supabaseUrl && supabaseAnonKey);

// Interfaces for our database entities
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  service_required: string;
  message: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Converted' | 'Closed';
  created_at: string;
}

export interface Customer {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  created_at: string;
}

export interface Employee {
  id: string; // matches auth.users id
  employee_name: string;
  role: 'Admin' | 'Manager' | 'Technician';
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

// -------------------------------------------------------------
// MOCK DATABASE & CLIENT IMPLEMENTATION
// -------------------------------------------------------------

const STORAGE_KEYS = {
  LEADS: 'mock_supabase_leads',
  CUSTOMERS: 'mock_supabase_customers',
  EMPLOYEES: 'mock_supabase_employees',
  SESSION: 'mock_supabase_session',
};

// Seed Data
const initialEmployees: Employee[] = [
  {
    id: 'emp-admin-1',
    employee_name: 'John Admin',
    role: 'Admin',
    phone: '+1 (555) 010-0001',
    email: 'admin@itsec.com',
    status: 'Active',
    created_at: new Date('2026-01-01').toISOString(),
  },
  {
    id: 'emp-mgr-1',
    employee_name: 'Sarah Manager',
    role: 'Manager',
    phone: '+1 (555) 010-0002',
    email: 'manager@itsec.com',
    status: 'Active',
    created_at: new Date('2026-02-15').toISOString(),
  },
  {
    id: 'emp-tech-1',
    employee_name: 'Alex Technician',
    role: 'Technician',
    phone: '+1 (555) 010-0003',
    email: 'tech@itsec.com',
    status: 'Active',
    created_at: new Date('2026-03-20').toISOString(),
  },
];

const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    city: 'New York',
    service_required: 'CCTV Security System',
    message: 'We want to install 12 IP cameras in our new office premises.',
    status: 'New',
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(), // 4 hrs ago
  },
  {
    id: 'lead-2',
    name: 'Robert Smith',
    email: 'robert@smithcorp.io',
    phone: '+1 (555) 987-6543',
    city: 'San Francisco',
    service_required: 'Access Control',
    message: 'Need biometric entry gates and card readers for a 3-floor building.',
    status: 'Contacted',
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
  },
  {
    id: 'lead-3',
    name: 'Alice Johnson',
    email: 'alice.j@retailgroup.net',
    phone: '+1 (555) 456-7890',
    city: 'Chicago',
    service_required: 'Fire Alarm System',
    message: 'Requesting a safety audit and upgrading our current smoke detectors.',
    status: 'Qualified',
    created_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(), // 3 days ago
  },
  {
    id: 'lead-4',
    name: 'David Lee',
    email: 'dlee@techstart.co',
    phone: '+1 (555) 654-3210',
    city: 'Austin',
    service_required: 'Biometrics',
    message: 'Biometric time attendance integration with HR software.',
    status: 'Converted',
    created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(), // 7 days ago
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    customer_name: 'David Lee (TechStart Co)',
    phone: '+1 (555) 654-3210',
    email: 'dlee@techstart.co',
    city: 'Austin',
    address: '500 Innovation Way, Suite 100, Austin, TX 78701',
    created_at: new Date(Date.now() - 6 * 24 * 3600000).toISOString(),
  },
  {
    id: 'cust-2',
    customer_name: 'MegaCorp Inc.',
    phone: '+1 (555) 888-9999',
    email: 'facilities@megacorp.com',
    city: 'Boston',
    address: '100 Financial District Blvd, Boston, MA 02110',
    created_at: new Date('2026-04-10').toISOString(),
  },
];

// Load helper
const getStorageItem = <T>(key: string, fallback: T): T => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Initialize Mock Data
if (!isRealSupabase) {
  getStorageItem(STORAGE_KEYS.LEADS, initialLeads);
  getStorageItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  getStorageItem(STORAGE_KEYS.EMPLOYEES, initialEmployees);
}

// Chainable mock query builder class
class MockQueryBuilder {
  private tableName: string;
  private data: any[] = [];
  private filters: ((item: any) => boolean)[] = [];
  private sortColumn: string | null = null;
  private sortAscending = true;
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private opValues: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.refreshData();
  }

  private refreshData() {
    if (this.tableName === 'leads') {
      this.data = getStorageItem<Lead[]>(STORAGE_KEYS.LEADS, []);
    } else if (this.tableName === 'customers') {
      this.data = getStorageItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, []);
    } else if (this.tableName === 'employees') {
      this.data = getStorageItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    }
  }

  select(_columns = '*') {
    this.op = 'select';
    return this;
  }

  insert(values: any | any[]) {
    this.op = 'insert';
    this.opValues = values;
    return this;
  }

  update(values: any) {
    this.op = 'update';
    this.opValues = values;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  ilike(column: string, pattern: string) {
    // Simple mock: removes % and performs case insensitive search
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push((item) => {
      const val = item[column];
      if (typeof val === 'string') {
        return val.toLowerCase().includes(cleanPattern);
      }
      return false;
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.sortColumn = column;
    this.sortAscending = ascending;
    return this;
  }

  // Terminal methods that execute the query
  async then(resolve: (value: any) => void) {
    try {
      this.refreshData(); // Refresh to get the latest database state
      let result = [...this.data];

      if (this.op === 'select') {
        for (const filter of this.filters) {
          result = result.filter(filter);
        }

        if (this.sortColumn) {
          result.sort((a, b) => {
            const valA = a[this.sortColumn!];
            const valB = b[this.sortColumn!];
            if (valA < valB) return this.sortAscending ? -1 : 1;
            if (valA > valB) return this.sortAscending ? 1 : -1;
            return 0;
          });
        }

        resolve({ data: result, error: null });
      } else if (this.op === 'insert') {
        const itemsToInsert = Array.isArray(this.opValues) ? this.opValues : [this.opValues];
        const createdItems = itemsToInsert.map((item) => {
          const newItem = {
            id: item.id || `${this.tableName.slice(0, -1)}-${Math.random().toString(36).substr(2, 9)}`,
            created_at: new Date().toISOString(),
            ...item,
          };
          return newItem;
        });

        const updatedDb = [...this.data, ...createdItems];
        this.saveDb(updatedDb);

        resolve({ data: createdItems, error: null });
      } else if (this.op === 'update') {
        // Find matching items from filters
        let matchingIds: string[] = [];
        let filteredData = [...this.data];
        for (const filter of this.filters) {
          filteredData = filteredData.filter(filter);
        }
        matchingIds = filteredData.map((item) => item.id);

        const updatedDb = this.data.map((item) => {
          if (matchingIds.includes(item.id)) {
            return { ...item, ...this.opValues };
          }
          return item;
        });

        this.saveDb(updatedDb);

        const updatedItems = updatedDb.filter((item) => matchingIds.includes(item.id));
        resolve({ data: updatedItems, error: null });
      } else if (this.op === 'delete') {
        let filteredData = [...this.data];
        for (const filter of this.filters) {
          filteredData = filteredData.filter(filter);
        }
        const matchingIds = filteredData.map((item) => item.id);

        const updatedDb = this.data.filter((item) => !matchingIds.includes(item.id));
        this.saveDb(updatedDb);

        resolve({ data: filteredData, error: null });
      }
    } catch (err: any) {
      resolve({ data: null, error: err });
    }
  }

  private saveDb(updatedData: any[]) {
    this.data = updatedData;
    if (this.tableName === 'leads') {
      setStorageItem(STORAGE_KEYS.LEADS, updatedData);
    } else if (this.tableName === 'customers') {
      setStorageItem(STORAGE_KEYS.CUSTOMERS, updatedData);
    } else if (this.tableName === 'employees') {
      setStorageItem(STORAGE_KEYS.EMPLOYEES, updatedData);
    }
  }
}


// Mock Auth system
const mockAuthService = {
  async signInWithPassword({ email, password: _password }: any) {
    const employees = getStorageItem<Employee[]>(STORAGE_KEYS.EMPLOYEES, []);
    const matchingEmp = employees.find((emp) => emp.email.toLowerCase() === email.toLowerCase());

    if (!matchingEmp) {
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials or user does not exist' } };
    }

    if (matchingEmp.status === 'Inactive') {
      return { data: { user: null, session: null }, error: { message: 'Account is inactive. Contact Administrator.' } };
    }

    // Accept any password for mock portal testing to make verification easier
    const mockSession = {
      access_token: 'mock-jwt-token-xyz',
      user: {
        id: matchingEmp.id,
        email: matchingEmp.email,
        role: 'authenticated',
        user_metadata: {
          employee_name: matchingEmp.employee_name,
          role: matchingEmp.role,
        },
      },
    };

    setStorageItem(STORAGE_KEYS.SESSION, mockSession);
    
    // Notify listeners if any
    this.triggerStateChange(mockSession);

    return { data: mockSession, error: null };
  },

  async signOut() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    this.triggerStateChange(null);
    return { error: null };
  },

  async getSession() {
    const session = getStorageItem<any>(STORAGE_KEYS.SESSION, null);
    return { data: { session }, error: null };
  },

  listeners: [] as ((event: string, session: any) => void)[],

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const session = getStorageItem<any>(STORAGE_KEYS.SESSION, null);
    // Initial call
    callback('INITIAL_SESSION', session);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
          },
        },
      },
    };
  },

  triggerStateChange(session: any) {
    const event = session ? 'SIGNED_IN' : 'SIGNED_OUT';
    this.listeners.forEach((callback) => callback(event, session));
  },
};

// Expose Mock Client
const mockSupabase = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },
  auth: mockAuthService,
};

// -------------------------------------------------------------
// EXPORT UNIFIED CLIENT
// -------------------------------------------------------------

export const supabase = isRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockSupabase as any);

export const isUsingMock = !isRealSupabase;
