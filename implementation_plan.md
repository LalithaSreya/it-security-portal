# Implementation Plan - Phase 3: MVP Stabilization & Real Database Integration

This plan details the transition of our application from using local storage mock data to connecting directly to a live Supabase backend, implementing full authentication, adding missing CRUD features (Create/Edit/Delete for Leads; Create/Delete for Customers), adding loading/error states, and preparing for deployment on Vercel.

---

## 1. Database Schema & Supabase Setup (SQL Scripts)

You must run the following SQL scripts in the **Supabase SQL Editor** to create the tables, enable Row Level Security (RLS), define access policies, and setup automatic employee profile syncing.

### SQL Setup Script
```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. LEADS TABLE
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text not null,
  city text not null,
  service_required text not null,
  message text not null,
  status text not null default 'New', -- New, Contacted, Qualified, Converted, Closed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Leads
alter table public.leads enable row level security;

-- Policies: Anybody can insert (public contact form)
create policy "Allow public insert to leads" on public.leads
  for insert with check (true);

-- Policies: Authenticated portal users can read and write leads
create policy "Allow authenticated users access to leads" on public.leads
  for all using (auth.role() = 'authenticated');


-- 2. CUSTOMERS TABLE
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  phone text not null,
  email text not null,
  city text not null,
  address text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Customers
alter table public.customers enable row level security;

-- Policies: Authenticated portal users can read and write customers
create policy "Allow authenticated users access to customers" on public.customers
  for all using (auth.role() = 'authenticated');


-- 3. EMPLOYEES TABLE
create table if not exists public.employees (
  id uuid references auth.users on delete cascade primary key,
  employee_name text not null,
  role text not null check (role in ('Admin', 'Manager', 'Technician')),
  phone text,
  email text not null,
  status text not null default 'Active', -- Active, Inactive
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Employees
alter table public.employees enable row level security;

-- Policies: Authenticated users can read employees list
create policy "Allow authenticated users to read employees" on public.employees
  for select using (auth.role() = 'authenticated');

-- Policies: Only Admins can modify employee rows
create policy "Allow Admins full write to employees" on public.employees
  for all using (
    exists (
      select 1 from public.employees
      where id = auth.uid() and role = 'Admin'
    )
  );

-- 4. AUTOMATIC SIGNUP-TO-PROFILE SYNC TRIGGER
-- Automatically creates an employee profile record when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.employees (id, employee_name, role, phone, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'employee_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'role', 'Technician'),
    new.raw_user_meta_data->>'phone',
    new.email,
    'Active'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 2. Authentication Setup & Persistence

When a user registers or is invited via Supabase Auth, they can log in via `/portal/login`.
*   **User Registration**:
    *   For testing, the developer can create a user in the **Supabase Dashboard** (`Authentication -> Users`) and attach `employee_name`, `role`, and `phone` in the User Metadata JSON.
    *   Alternatively, the Admin in the Portal can call `supabase.auth.signUp()` (which triggers our database sync code).
*   **Session Persistence**:
    *   The `AuthContext` listens to the Supabase session state and automatically re-fetches user roles on page refresh, preserving active sessions.

---

## 3. UI Modules CRUD Enhancements

We will modify the existing portal components to add the missing operations:

### 3.1 Leads Module (`src/pages/portal/Leads.tsx`)
*   **Create Lead**: Add a "+ Create Lead" button and dialog form to manually add leads directly from the dashboard.
*   **Update Lead**: Extend the edit flow to allow modifying name, email, phone, city, service required, and description message (not just status).
*   **Delete Lead**: Add a delete confirmation modal.

### 3.2 Customers Module (`src/pages/portal/Customers.tsx`)
*   **Create Customer**: Add a "+ Create Customer" button and dialog form to manually add corporate customer accounts.
*   **Delete Customer**: Add a delete confirmation modal.

### 3.3 Dashboard, Employees, and Contact Integration
*   Verify that they are fully integrated.
*   Ensure all modules use loading states (Skeletons/Spinners), handle empty states beautifully, and handle request errors with user-friendly alerts.

---

## 4. Environment Variables Configuration

Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*Note: If these values are omitted, the application will transparently fall back to localStorage mock mode so the app remains instantly testable locally.*

---

## 5. Deployment Setup (Vercel)

### Project Preparation
We will configure `vercel.json` in the root:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
*This ensures that React Router paths (like `/portal/dashboard`) route correctly without throwing 404s.*

---

## 6. Verification Plan

### Automated Verification
*   Execute `npm run build` to verify compiling results.

### Manual Verification
1.  **Lead CRUD**: Create, read, update, and delete a lead, checking that it reflects immediately.
2.  **Customer CRUD**: Create, read, update, and delete a customer, checking that it reflects immediately.
3.  **Real Supabase Auth**:
    *   Configure environment variables.
    *   Register a user in the Supabase Auth panel with metadata `role: "Admin"`.
    *   Verify login, session persistence on page refresh, and logout functions.
4.  **Theme & Mobile**: Test responsive views and dark/light switching on all pages.
