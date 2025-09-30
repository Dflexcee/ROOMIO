import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdminRoutes from "./AdminRoutes";
import Home from "../pages/user/Home";
import Login from "../pages/user/Login";
import Onboarding from "../pages/Onboarding";
import ProfileSetup from "../pages/ProfileSetup";
import ProfileEdit from "../pages/ProfileEdit";
import SignupLogin from "../pages/SignupLogin";
import Dashboard from "../pages/Dashboard";
import FindRoommate from "../pages/FindRoommate";
import FindRoom from "../pages/FindRoom";
import PostRoom from "../pages/PostRoom";
import ScamBoard from "../pages/ScamBoard";
import CommunityFeed from "../pages/CommunityFeed";
import HelpCenter from "../pages/HelpCenter";
import MyRooms from "../pages/MyRooms";
import EditRoom from "../pages/EditRoom";
import Inbox from "../pages/Inbox";
import ChatDetail from "../pages/ChatDetail";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Show loading while checking session
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-gray-900 dark:via-black dark:to-gray-900 transition-colors">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-blue-100 dark:border-gray-800 animate-fade-in">
            <div className="text-lg text-blue-700 dark:text-pink-400 font-bold">Loading...</div>
          </div>
        </div>
      </div>
    );
  }
  
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
      <Route path="/profile-edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
      <Route path="/signup-login" element={<SignupLogin />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/find-roommate" element={<ProtectedRoute><FindRoommate /></ProtectedRoute>} />
      <Route path="/find-room" element={<ProtectedRoute><FindRoom /></ProtectedRoute>} />
      <Route path="/post-room" element={<ProtectedRoute><PostRoom /></ProtectedRoute>} />
      <Route path="/scam-board" element={<ScamBoard />} />
      <Route path="/community" element={<CommunityFeed />} />
      <Route path="/help-center" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
      <Route path="/my-rooms" element={<ProtectedRoute><MyRooms /></ProtectedRoute>} />
      <Route path="/edit-room/:id" element={<ProtectedRoute><EditRoom /></ProtectedRoute>} />
      <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
      <Route path="/chat/:userId" element={<ProtectedRoute><ChatDetail /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 