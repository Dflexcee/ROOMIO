import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import Home from "../pages/user/Home";
import Login from "../pages/user/Login";
import Onboarding from "../pages/Onboarding";
import ProfileSetup from "../pages/ProfileSetup";
import SignupLogin from "../pages/SignupLogin";
import Dashboard from "../pages/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/signup-login" element={<SignupLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 