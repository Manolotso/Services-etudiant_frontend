import { BrowserRouter, Routes, Route } from "react-router-dom"

import LoginForm from "./components/LoginForm"
import CompleteProfile from "./components/CompleteProfile"

import DashboardLayout from "./pages/DashboardLayout"
import DashboardHome from "./pages/dashboard/DashboardHome"
import Students from "./pages/dashboard/Help"
//import Courses from "./pages/Courses"
import Schedule from "./pages/dashboard/Schedule"
import Jobs from './pages/dashboard/Jobs';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route path="/" element={<LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* DASHBOARD LAYOUT */}
        <Route path="/dashboard" element={<DashboardLayout />}>

          <Route index element={<DashboardHome />} />
          <Route path="students" element={<Students />} />
          {/* <Route path="courses" element={<Courses />} /> */}
          <Route path="schedule" element={<Schedule />} />
          <Route path="jobs" element={<Jobs />} />

        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App