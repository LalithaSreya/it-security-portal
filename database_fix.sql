-- ==========================================
-- IT Security Portal Database Fix Script (v2 - Recursion Free)
-- ==========================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- to create the missing tables, correct RLS policies, and fix the 500 Internal Server Error recursion bug.

-- 1. CREATE TASKS TABLE (IF NOT EXISTS)
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  assigned_technician uuid references public.employees(id) on delete cascade,
  status text not null check (status in ('Pending', 'Completed')) default 'Pending',
  due_date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Tasks
alter table public.tasks enable row level security;

-- Drop existing task policies if they exist
drop policy if exists "Allow Managers full access to tasks" on public.tasks;
drop policy if exists "Allow Technicians to view assigned tasks" on public.tasks;
drop policy if exists "Allow Technicians to update assigned tasks" on public.tasks;

-- Recreate Task Policies (using fast and safe JWT role checks)
create policy "Allow Managers full access to tasks" on public.tasks
  for all using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'Manager');

create policy "Allow Technicians to view assigned tasks" on public.tasks
  for select using (assigned_technician = auth.uid());

create policy "Allow Technicians to update assigned tasks" on public.tasks
  for update using (assigned_technician = auth.uid());


-- 2. CREATE REPORTS TABLE (IF NOT EXISTS)
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  submitted_by uuid references public.employees(id) on delete set null,
  customer_name text not null,
  location text not null,
  report_type text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Reports
alter table public.reports enable row level security;

-- Drop existing report policies if they exist
drop policy if exists "Allow Managers to view all reports" on public.reports;
drop policy if exists "Allow Technicians to insert reports" on public.reports;
drop policy if exists "Allow Technicians to view own reports" on public.reports;

-- Recreate Report Policies (using fast and safe JWT role checks)
create policy "Allow Managers to view all reports" on public.reports
  for select using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'Manager');

create policy "Allow Technicians to insert reports" on public.reports
  for insert with check (submitted_by = auth.uid());

create policy "Allow Technicians to view own reports" on public.reports
  for select using (submitted_by = auth.uid());


-- 3. FIX EMPLOYEES TABLE RLS POLICIES (RECURSION-FREE)
-- Drop all old conflicting policies on employees table
drop policy if exists "Allow Admins full write to employees" on public.employees;
drop policy if exists "Allow Managers and Admins full write to employees" on public.employees;
drop policy if exists "Allow employees to update own profile" on public.employees;
drop policy if exists "Allow employees to update own record" on public.employees;
drop policy if exists "Allow users to update own record" on public.employees;
drop policy if exists "Allow authenticated users to read employees" on public.employees;

-- Policy A: Allow authenticated users to read employees list (simple, recursion-free check)
create policy "Allow authenticated users to read employees" on public.employees
  for select using (auth.role() = 'authenticated');

-- Policy B: Allow Managers and Admins to modify employee rows (uses JWT metadata to avoid table query recursion)
create policy "Allow Managers and Admins to write employees" on public.employees
  for all using ((auth.jwt() -> 'user_metadata' ->> 'role') in ('Admin', 'Manager'));

-- Policy C: Allow individual employees to update their own profile details (recursion-free)
create policy "Allow employees to update own record" on public.employees
  for update using (auth.uid() = id) with check (auth.uid() = id);
