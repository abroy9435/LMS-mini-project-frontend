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

export default function App() {
  return (
    <Routes>
      {/* 1. CRITICAL: Callback is unguarded so it isn't destroyed mid-flight */}
      <Route 
        path="/sso-callback" 
        element={<AuthenticateWithRedirectCallback />} 
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
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/leaves" element={<MyLeaves />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                  <Route path="/approvals" element={
                    <RoleRoute allowedRoles={["APPROVER", "ADMIN"]}>
                      <Approvals />
                    </RoleRoute>
                  } />
                  <Route 
                    path="/admin" 
                    element={
                      <RoleRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                      </RoleRoute>
                    } 
                  />
                </Routes>
              </MainLayout>
            </SignedIn>
          </>
        } 
      />
    </Routes>
  );
}