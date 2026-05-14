import { Navigate, Route, Routes } from "react-router-dom"
import AdminLayout from "./layouts/AdminLayout"
import AppointmentHistoryPage from "./pages/AppointmentHistoryPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import AdminProfilePage from "./pages/AdminProfilePage"
import DashboardPage from "./pages/DashboardPage"
import DoctorsPage from "./pages/DoctorsPage"
import LoginPage from "./pages/LoginPage"
import NotificationsPage from "./pages/NotificationsPage"
import RegisterPage from "./pages/RegisterPage"
import SchedulePage from "./pages/SchedulePage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/doctors" element={<DoctorsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/history" element={<AppointmentHistoryPage />} />
        <Route path="/profile" element={<AdminProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
