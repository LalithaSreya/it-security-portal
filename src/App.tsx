import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "@/components/layout/PublicLayout"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Services from "@/pages/Services"
import ServiceDetail from "@/pages/ServiceDetail"
import Gallery from "@/pages/Gallery"
import Contact from "@/pages/Contact"

import { AuthProvider, useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import ManagerLayout from "@/components/layout/ManagerLayout"
import TechnicianLayout from "@/components/layout/TechnicianLayout"
import Login from "@/pages/portal/Login"
import ManagerDashboard from "@/pages/portal/ManagerDashboard"
import TechnicianDashboard from "@/pages/portal/TechnicianDashboard"
import Employees from "@/pages/portal/Employees"
import ManagerTasks from "@/pages/portal/ManagerTasks"
import Reports from "@/pages/portal/Reports"
import GalleryManagement from "@/pages/portal/GalleryManagement"
import MyTasks from "@/pages/portal/MyTasks"
import TaskDetails from "@/pages/portal/TaskDetails"
import SubmitReport from "@/pages/portal/SubmitReport"
import Profile from "@/pages/portal/Profile"

// Redirector to route logged-in users to their correct workspace subtree
function PortalRedirector() {
  const { user, employee, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/portal/login" replace />;
  }

  if (employee?.role === 'Manager') {
    return <Navigate to="/portal/manager/dashboard" replace />;
  }

  if (employee?.role === 'Technician') {
    return <Navigate to="/portal/technician/dashboard" replace />;
  }

  // Fallback to login if role is unknown or not resolved
  return <Navigate to="/portal/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root Redirect to Workspace Redirector */}
          <Route path="/" element={<Navigate to="/portal" replace />} />
          <Route path="/portal" element={<PortalRedirector />} />
          <Route path="/portal/dashboard" element={<PortalRedirector />} />

          {/* Public Website Routes */}
          <Route path="/about-us" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:serviceId" element={<ServiceDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Portal Authentication */}
          <Route path="/portal/login" element={<Login />} />

          {/* Protected Manager Subtree */}
          <Route
            path="/portal/manager"
            element={
              <ProtectedRoute allowedRoles={["Manager"]}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/portal/manager/dashboard" replace />} />
            <Route path="dashboard" element={<ManagerDashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="tasks" element={<ManagerTasks />} />
            <Route path="gallery" element={<GalleryManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Protected Technician Subtree */}
          <Route
            path="/portal/technician"
            element={
              <ProtectedRoute allowedRoles={["Technician"]}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/portal/technician/dashboard" replace />} />
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="tasks/:taskId" element={<TaskDetails />} />
            <Route path="submit-report" element={<SubmitReport />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
