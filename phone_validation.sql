-- ========================================================
-- BACKEND PHONE VALIDATION CONSTRAINTS
-- ========================================================
-- Run this SQL in your Supabase SQL Editor to enforce digit-only validation 
-- on all phone number fields and clean up existing records.

-- 1. Clean up existing phone numbers (strip non-digits)
update public.employees set phone = regexp_replace(phone, '\D', '', 'g') where phone is not null;
update public.leads set phone = regexp_replace(phone, '\D', '', 'g') where phone is not null;
update public.customers set phone = regexp_replace(phone, '\D', '', 'g') where phone is not null;
update public.tasks set customer_phone = regexp_replace(customer_phone, '\D', '', 'g') where customer_phone is not null;

-- 2. Add check constraints (requires between 10 and 15 digits or empty/null)
alter table public.employees drop constraint if exists check_employee_phone;
alter table public.employees add constraint check_employee_phone check (phone is null or phone = '' or phone ~ '^[0-9]{10,15}$');

alter table public.leads drop constraint if exists check_lead_phone;
alter table public.leads add constraint check_lead_phone check (phone is null or phone = '' or phone ~ '^[0-9]{10,15}$');

alter table public.customers drop constraint if exists check_customer_phone;
alter table public.customers add constraint check_customer_phone check (phone is null or phone = '' or phone ~ '^[0-9]{10,15}$');

alter table public.tasks drop constraint if exists check_task_phone;
alter table public.tasks add constraint check_task_phone check (customer_phone is null or customer_phone = '' or customer_phone ~ '^[0-9]{10,15}$');
