import { BrowserRouter, Routes, Route } from "react-router-dom"

import LoginForm from "./components/LoginForm"
import CompleteProfile from "./components/CompleteProfile"

import DashboardLayout from "./pages/DashboardLayout"
import DashboardHome from "./pages/dashboard/DashboardHome"
import Students from "./pages/dashboard/Help"
import Schedule from "./pages/dashboard/Schedule"
import Admin from "./pages/admin"
import AdminSchedule from "./pages/admin/AdminSchedule"
import AdminJobs from "./pages/admin/AdminJobs"
import AdminHelpRequests from './pages/admin/AdminHelpRequests'
import Jobs from "./pages/dashboard/Jobs"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* ADMIN */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/jobs" element={<AdminJobs />} />
        <Route path="/admin/help" element={<AdminHelpRequests />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="students" element={<Students />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="jobs" element={<Jobs />} />
          
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App