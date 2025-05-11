import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminRoutes from "./AdminRoutes";
import Home from "../pages/user/Home";
import Login from "../pages/user/Login";
import Onboarding from "../pages/Onboarding";
import ProfileSetup from "../pages/ProfileSetup";
import SignupLogin from "../pages/SignupLogin";
import Dashboard from "../pages/Dashboard";
import FindRoommate from "../pages/FindRoommate";
import FindRoom from "../pages/FindRoom";
import PostRoom from "../pages/PostRoom";
import ScamBoard from "../pages/ScamBoard";
import CommunityFeed from "../pages/CommunityFeed";
import HelpCenter from "../pages/HelpCenter";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/signup-login" element={<SignupLogin />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/find-roommate" element={<ProtectedRoute><FindRoommate /></ProtectedRoute>} />
      <Route path="/find-room" element={<ProtectedRoute><FindRoom /></ProtectedRoute>} />
      <Route path="/post-room" element={<PostRoom />} />
      <Route path="/scam-board" element={<ScamBoard />} />
      <Route path="/community" element={<CommunityFeed />} />
      <Route path="/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 