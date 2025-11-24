import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/Home";
import Dashboard from "@/pages/dashboard/Dashboard";
import DataInput from "@/pages/dataInput/DataInput";
import Analysis from "@/pages/analysis/Analysis";
import Visualization from "@/pages/visualization/Visualization";
import Reports from "@/pages/reports/Reports";
import DataAnalysisReport from "@/pages/reports/DataAnalysisReport";
import Settings from "@/pages/settings/Settings";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/data-input" element={
            <ProtectedRoute>
              <DataInput />
            </ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute>
              <Analysis />
            </ProtectedRoute>
          } />
          <Route path="/visualization" element={
            <ProtectedRoute>
              <Visualization />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/reports/data-analysis" element={
            <ProtectedRoute>
              <DataAnalysisReport />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
