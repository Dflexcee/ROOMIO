import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import Home from "../pages/user/Home";
import Login from "../pages/user/Login";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
} 