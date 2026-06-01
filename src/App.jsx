import { SignedIn, SignedOut, AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import RoleRoute from "./components/auth/RoleRoute";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import MyLeaves from "./pages/MyLeaves";
import Profile from "./pages/Profile";
import Approvals from "./pages/Approvals";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGuard from './components/AdminGuard';

export default function App() {
  return (
    <Routes>
      {/* 1. CRITICAL: Callback is unguarded so it isn't destroyed mid-flight */}
      <Route 
        path="/sso-callback" 
        element={
          <AuthenticateWithRedirectCallback 
            signInFallbackRedirectUrl="/" 
            signUpFallbackRedirectUrl="/" 
          />
        } 
      />

      {/* 2. Catch-all for the rest of the application */}
      <Route 
        path="*" 
        element={
          <>
            <SignedOut>
              <Login />
            </SignedOut>

            <SignedIn>
              <MainLayout>
                <Routes>
                  
                  {/* STANDARD EMPLOYEE ROUTES (Intentionally blocking the VC) */}
                  <Route path="/" element={
                    <RoleRoute allowedRoles={["EMPLOYEE", "APPROVER", "ADMIN", "System Administrator"]}>
                      <Dashboard />
                    </RoleRoute>
                  } />
                  
                  <Route path="/leaves" element={
                    <RoleRoute allowedRoles={["EMPLOYEE", "APPROVER", "ADMIN", "System Administrator"]}>
                      <MyLeaves />
                    </RoleRoute>
                  } />

                  {/* UNIVERSAL ROUTE (Everyone gets a profile) */}
                  <Route path="/profile" element={<Profile />} />

                  {/* MANAGEMENT ROUTES (Including the VC) */}
                  <Route path="/approvals" element={
                    <RoleRoute allowedRoles={["APPROVER", "ADMIN", "System Administrator", "VC"]}>
                      <Approvals />
                    </RoleRoute>
                  } />
                  
                  <Route path="/admin" element={
                    <RoleRoute allowedRoles={["ADMIN", "System Administrator", "VC"]}>
                      <AdminGuard>
                          <AdminDashboard />
                      </AdminGuard>
                    </RoleRoute>
                  } />

                  <Route path="*" element={<Navigate to="/" replace />} />
                  
                </Routes>
              </MainLayout>
            </SignedIn>
          </>
        } 
      />
    </Routes>
  );
}