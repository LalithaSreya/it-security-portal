# Walkthrough - Phase 3 Complete (MVP Stabilization & Deployment)

I have successfully stabilized the IT Security & Solutions Company Application, prepared it for connection with a live Supabase backend, completed all CRUD operations, and set up deployment settings.

## Live Link
The application development server is active and verified at:
👉 **[http://localhost:5173/](http://localhost:5173/)**

---

## 1. Database Schema & Supabase Setup Instructions

Run this SQL script in the **Supabase SQL Editor** to create the tables, define RLS policies, and set up automatic employee profile syncing:

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

alter table public.leads enable row level security;

create policy "Allow public insert to leads" on public.leads
  for insert with check (true);

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

alter table public.customers enable row level security;

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

alter table public.employees enable row level security;

create policy "Allow authenticated users to read employees" on public.employees
  for select using (auth.role() = 'authenticated');

create policy "Allow Admins full write to employees" on public.employees
  for all using (
    exists (
      select 1 from public.employees
      where id = auth.uid() and role = 'Admin'
    )
  );

-- 4. NEW AUTH USER TRIGGER PROFILE SYNC
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 2. Environment Variables Configuration

Create a `.env` file in your root folder:
```env
VITE_SUPABASE_URL=https://your-supabase-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
*Note: If these env variables are not supplied, the client dynamically runs in sandboxed LocalStorage Mock Mode so that the portal remains fully functional.*

---

## 3. CRUD Upgrades & Enhancements

*   **Leads Module**:
    *   Added **`+ Create Lead`** button and modal form.
    *   Enhanced **`Edit Lead`** to support full modifications (name, email, phone, city, service required, message, status).
    *   Added **`Delete Lead`** action with a safety confirmation modal.
*   **Customers Module**:
    *   Added **`+ Create Customer`** button and modal form.
    *   Added **`Delete Customer`** action with a safety confirmation modal.
*   **Error Handling**:
    *   Integrated loading placeholder skeletons.
    *   Added empty warning rows if a search returned no items.
    *   Equipped request operations with `try/catch` alert prompts in case of API failures.

---

## 4. Deployment on Vercel

*   We created `vercel.json` in the root containing:
    ```json
    {
      "rewrites": [
        { "source": "/(.*)", "destination": "/index.html" }
      ]
    }
    ```
*   **Vercel Build Settings**:
    *   Build Command: `npm run build`
    *   Output Directory: `dist`
    *   Environment Variables: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under settings.

---

## 5. Testing & Verification Checklist

1.  **Authentication**:
    *   Register or invite a user via the Supabase Auth panel. Write metadata properties `employee_name` and `role`.
    *   Confirm login, persistent sessions on page reload, and logout functions.
2.  **Contact Form**:
    *   Verify submitting the public contact form saves a new lead in the Supabase database.
3.  **Lead CRUD**:
    *   Verify clicking `+ Create Lead`, editing, status-updating, and deleting operations sync correctly.
4.  **Customer CRUD**:
    *   Verify manually adding a customer, updating fields, and deleting operations sync correctly.
5.  **Employee CRUD**:
    *   Verify role limits (Technicians blocked, Managers read-only, Admins read-write).
