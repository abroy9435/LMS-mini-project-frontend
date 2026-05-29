import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import Login from "./pages/Login";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import MyLeaves from "./pages/MyLeaves";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <>
      <SignedOut>
        <Routes>
          <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </SignedOut>

      <SignedIn>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leaves" element={<MyLeaves />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </SignedIn>
    </>
  );
}