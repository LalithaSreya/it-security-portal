# App Testing Checklist & Task Division

This document outlines how to thoroughly test all features of the application, split between **Person A** and **Person B**.

---

## 📋 Setup & Preparation (Both Persons)
Before testing, make sure both of you have:
* The local dev server running (`npm run dev`) or access to the live Vercel URL.
* Access to the Supabase database (to verify that actions successfully write to the database tables).

---

## 🧑‍💻 Person A: Public Site & Leads Module

Your focus is on the client-facing website, the lead generation contact form, and the lead management lifecycle in the portal.

### Part 1: Public Website (Frontend)
- [ ] **Navigation & Layout**: Click through every main navigation link (`Home`, `About Us`, `Services`, `Gallery`, `Contact`) and verify all pages load without errors.
- [ ] **Responsive Design**: Resize the browser window to mobile size and test the hamburger menu toggle.
- [ ] **Dark Mode**: Click the sun/moon icon at the top right of the navbar on various pages to verify that Light/Dark themes swap seamlessly.
- [ ] **Services Detail View**: Go to `/services` and click on individual services (e.g., "CCTV Installation") to verify the detailed page loads.

### Part 2: Public Contact Form (API Integration)
- [ ] **Lead Submission**: Go to `/contact`, fill out the form with test data (Name, Email, Phone, City, Service, Message) and click **Send Request**.
- [ ] **Form Validation**: Try submitting the form with an invalid email or short phone number to ensure validation errors prevent submission.
- [ ] **Success State**: Verify the form swaps to the green "Thank you!" success page.

### Part 3: Portal Registration & Leads CRUD
- [ ] **Admin Registration**: Go to `/portal/login`, click **Register Staff here**, and sign up a new user with the **Admin** role.
- [ ] **Verification in Database**: Open the Supabase console, go to the `employees` table, and verify that the admin user was auto-inserted via the database trigger.
- [ ] **Portal Lead List**: Go to the **Leads** tab. Verify the lead you submitted in Part 2 is visible in the list with status "New".
- [ ] **Manual Lead Creation**: Click **+ Create Lead**, fill out the form, and verify it inserts a new lead.
- [ ] **Lead Update**: Edit a lead, change its status (e.g. from "New" to "Qualified"), save it, and verify the changes persist.
- [ ] **Search & Filtering**: Type a city name or contact name in the search bar to verify filtering works.
- [ ] **Lead Deletion**: Delete a lead, confirm the popup, and verify it is removed from the table and database.

---

## 🧑‍💻 Person B: Accounts, Customers, Employees, and RBAC

Your focus is on customer management, employee directories, and verifying that different user roles have the correct access restrictions (Role-Based Access Control).

### Part 1: Registration & Login Checks
- [ ] **Manager Registration**: Go to `/portal/login`, click **Register Staff here**, and sign up a user with the **Manager** role.
- [ ] **Technician Registration**: Repeat and sign up a user with the **Technician** role.
- [ ] **Session Persistence**: Log in as any user, refresh the browser page, and check that you remain logged in without being kicked back to `/portal/login`.
- [ ] **Sign Out**: Click the logout button and confirm you are redirected back to the login screen.

### Part 2: Customer Management (CRUD)
- [ ] **Customer Creation**: Log in as your **Manager** account, navigate to the **Customers** tab, and click **+ Create Customer**. Add a customer and check that they appear in the list.
- [ ] **Customer Edit**: Select a customer, click **Edit**, modify their phone number or address, and check that the edits save.
- [ ] **Customer Search**: Search for a customer by name to ensure the search bar functions correctly.
- [ ] **Customer Deletion**: Delete a customer, confirm the warning prompt, and verify they are removed.

### Part 3: Role-Based Access Control (RBAC) Verification
You need to verify that Admins, Managers, and Technicians have different levels of access:
- [ ] **Admin Access (Full Control)**:
  * Log in as the **Admin** account.
  * Go to the **Employees** tab. Verify you can see all employees, click **Edit** to change their role/status, and click **Delete** to remove them.
- [ ] **Manager Access (Operations Only)**:
  * Log out of Admin and log in as the **Manager** account.
  * Go to the **Employees** tab. Verify you can see the employee directory list, but all edit and delete buttons are **hidden or disabled** (Read-Only access).
- [ ] **Technician Access (Restricted)**:
  * Log out of Manager and log in as the **Technician** account.
  * Verify that you are restricted from seeing the **Employees** directory or editing customers/leads.
