import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AppShell from "./components/AppShell";

import StudentFound from "./pages/StudentFound";
import StudentReportLost from "./pages/StudentReportLost";

import AdminDashboard from "./pages/AdminDashboard";
import AdminClaims from "./pages/AdminClaims";

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

function Protected({ children, role }) {
  const token = localStorage.getItem("token");
  const user = getUser();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return <AppShell user={user}>{children}</AppShell>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/student/found"
          element={
            <Protected role="STUDENT">
              <StudentFound />
            </Protected>
          }
        />
        <Route
          path="/student/report-lost"
          element={
            <Protected role="STUDENT">
              <StudentReportLost />
            </Protected>
          }
        />

        <Route
          path="/admin"
          element={
            <Protected role="ADMIN">
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin/claims"
          element={
            <Protected role="ADMIN">
              <AdminClaims />
            </Protected>
          }
        />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
