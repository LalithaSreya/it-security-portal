import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "@/components/layout/PublicLayout"
import Home from "@/pages/Home"
import About from "@/pages/About"
import Services from "@/pages/Services"
import ServiceDetail from "@/pages/ServiceDetail"
import Gallery from "@/pages/Gallery"
import Contact from "@/pages/Contact"

import { AuthProvider } from "@/context/AuthContext"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import PortalLayout from "@/components/layout/PortalLayout"
import Login from "@/pages/portal/Login"
import Dashboard from "@/pages/portal/Dashboard"
import Leads from "@/pages/portal/Leads"
import Customers from "@/pages/portal/Customers"
import Employees from "@/pages/portal/Employees"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="services/:serviceId" element={<ServiceDetail />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          {/* Portal Authentication */}
          <Route path="/portal/login" element={<Login />} />

          {/* Protected Portal Routes */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <PortalLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/portal/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="customers" element={<Customers />} />
            <Route
              path="employees"
              element={
                <ProtectedRoute allowedRoles={["Manager"]}>
                  <Employees />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
