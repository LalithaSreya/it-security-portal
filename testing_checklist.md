# Phase 4A - Unified Testing Guide

Follow this step-by-step test script to verify all features and role boundaries in the portal.

---

## 📋 Step 1: Create a Lead (Public Website)
1. Navigate to the public website home page or the contact form at:
   👉 **[https://it-security-portal.vercel.app/about-us/contact](https://it-security-portal.vercel.app/about-us/contact)**
2. Fill in the contact form with test data:
   * **Name**: `Site Test Customer`
   * **Email**: `test@sitecustomer.com`
   * **Phone**: `1234567890`
   * **City**: `New York`
   * **Service**: Select `CCTV Installation`
   * **Message**: `Need 4 security cameras mounted at main warehouse.`
3. Click **Send Request** and verify you see the green success message.

---

## 📋 Step 2: Manager Operations (Assign Survey & Tasks)
1. Go to the login screen:
   👉 **[https://it-security-portal.vercel.app/portal/login](https://it-security-portal.vercel.app/portal/login)**
2. If you don't have a Manager account, click **Register Staff here**, create one with **Manager** role, and log in.
3. Verify you are automatically redirected to the Manager's workspace at:
   👉 `/portal/manager/dashboard`
4. **Assign Survey**:
   * Navigate to **Leads**. Find the `Site Test Customer` lead in the table (status should be `New`).
   * Click the lead row or the **View** icon to open details.
   * Click **Assign Survey** (blue button).
   * In the dialog: Select a technician (e.g. `Alex Technician` or register one if none exist) and select a date. Click **Assign & Create Survey**.
   * Verify lead status immediately updates to `Qualified`.
5. **Verify Survey is Created**:
   * Navigate to **Surveys** tab in sidebar. Verify the survey for `Site Test Customer` is listed in `Assigned` status.
6. **Assign Task**:
   * Navigate to **Task Assignment** tab.
   * Click **Assign Task**.
   * Enter: Title (`Inspect Warehouse Mounting Brackets`), Description (`Check heights and layout details`), select the same technician, and choose a due date.
   * Click **Assign & Notify**. Verify it appears in the task list.

---

## 📋 Step 3: Technician Flow (Execute Field Work)
1. Log out of the Manager account.
2. Log in with a **Technician** account (register one as a Technician if you haven't already).
3. Verify you are immediately redirected to the simple mobile-first Technician workspace at:
   👉 `/portal/technician/dashboard`
4. **Security/Route Guard Verification**:
   * Try typing `/portal/manager/employees` or `/portal/manager/dashboard` in the browser URL bar.
   * Verify you are blocked and immediately kicked back to `/portal/technician/dashboard`.
5. **Complete Assigned Task**:
   * On the dashboard, tap the **Today's Tasks** card (or navigate to **My Tasks** in sidebar).
   * Find the `Inspect Warehouse Mounting Brackets` task.
   * Click **Mark Completed** (green button). Verify the task moves to the **Completed** tab.
6. **Execute Site Survey**:
   * On the dashboard, tap the **Assigned Surveys** card (or navigate to **My Surveys** in sidebar).
   * Click the card for `Site Test Customer` (status `Assigned`) -> Click **Open Survey** (or it opens directly).
   * Click **Save Draft** after writing some text in remarks (e.g., `Observed brick wall, needs concrete drills.`). Verify "Remarks draft saved successfully!" message appears.
   * Click **Tap to Upload Site Photos** and upload 1-2 test images.
   * Verify the image thumbnails render on screen.
   * Click **Mark Completed** (green button). Verify you are redirected back to your surveys list and the survey status is now `Completed`.
7. **Submit General Field Report**:
   * Navigate to **Submit Report** in sidebar.
   * Enter: Customer (`Warehouse Site B`), Location (`Dock 4`), Select type `Site Hazard Notice`, and Description (`High voltage line exposed near the mount location.`).
   * Click **Submit Report**. Verify submission success.

---

## 📋 Step 4: Manager Approval & Review
1. Log out of the Technician account.
2. Log back in as your **Manager** account.
3. **Approve Survey**:
   * Navigate to the **Surveys** page.
   * Under the **Completed** status filter (or search `Site Test Customer`), find the survey and click on it.
   * Verify you can see the technician's remarks and the uploaded photos.
   * Click **Approve Survey** (green button). Verify the status updates to `Approved` (ready for quotation).
4. **Review Technician Field Report**:
   * Navigate to the **Reports** page.
   * Verify the `Warehouse Site B` hazard report submitted by the technician appears in the table. Click **View** to inspect details.
5. **Dashboard Analytics**:
   * Navigate to the **Dashboard**. Verify the metrics count reflect the completed/approved surveys and new customer listings!
