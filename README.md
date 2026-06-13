# Secure IT Solutions - Management Portal & Website

A comprehensive, production-ready corporate website and internal management portal built for an IT Security & Solutions provider.

## Tech Stack
* **Frontend**: React 19, TypeScript, Vite, React Router v7
* **Styling**: Tailwind CSS v4 (CSS-first config), ShadCN UI, Lucide Icons
* **Backend & Auth**: Supabase (PostgreSQL, Row Level Security, Auth Services)
* **Form Validation**: React Hook Form, Zod

## Key Features
* **Public Landing Page**: Services listings, detailed solution pages, gallery portfolio, and a validated contact form.
* **Lead Capturing**: Contact submissions automatically sync directly to the database as new leads.
* **Internal Portal**:
  * **Role-Based Access (RBAC)**: Secure routes tailored for Admin, Manager, and Technician roles.
  * **Interactive Dashboard**: Dynamically computes lead statistics and displays recent inquiries.
  * **Leads Module**: View details, filter by status, and convert leads directly to customers.
  * **Customers Module**: Manage customer accounts and edit contact details.
  * **Employees Module**: Direct employee directory (guarded so only Admins can create/edit/delete; Managers read-only; Technicians blocked).
