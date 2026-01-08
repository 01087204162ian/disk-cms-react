import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Employees from './pages/staff/Employees'
import EmployeeSchedule from './pages/staff/EmployeeSchedule'
import Holidays from './pages/staff/Holidays'
import HalfDayApproval from './pages/staff/HalfDayApproval'
import OrganizationChart from './pages/staff/OrganizationChart'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/staff/employees" element={<Employees />} />
                    <Route path="/staff/employee-schedule" element={<EmployeeSchedule />} />
                    <Route path="/staff/holidays" element={<Holidays />} />
                    <Route path="/staff/half-day-approval" element={<HalfDayApproval />} />
                    <Route path="/staff/organization-chart" element={<OrganizationChart />} />
                    {/* 이전 경로 호환 */}
                    <Route path="/staff/work-schedules" element={<Navigate to="/staff/employee-schedule" replace />} />
                    {/* 추가 라우트는 여기에 추가 */}
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
