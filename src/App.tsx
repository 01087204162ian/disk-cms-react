import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components'

// 인증 관련 페이지 (즉시 로드)
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

// 주요 페이지들은 동적 import로 지연 로딩 (코드 스플리팅)
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Employees = lazy(() => import('./pages/staff/Employees'))
const EmployeeSchedule = lazy(() => import('./pages/staff/EmployeeSchedule'))
const Holidays = lazy(() => import('./pages/staff/Holidays'))
const HalfDayApproval = lazy(() => import('./pages/staff/HalfDayApproval'))
const OrganizationChart = lazy(() => import('./pages/staff/OrganizationChart'))
const PharmacyApplications = lazy(() => import('./pages/pharmacy/Applications'))
const PharmacyRenewalList = lazy(() => import('./pages/pharmacy/RenewalList'))
// 문서 페이지는 마크다운 라이브러리가 커서 별도 청크로 분리
const PharmacyDocumentation = lazy(() => import('./pages/pharmacy/Documentation'))
const DriverSearch = lazy(() => import('./pages/insurance/DriverSearch'))
const PolicySearch = lazy(() => import('./pages/insurance/PolicySearch'))
const CompanyManagement = lazy(() => import('./pages/insurance/CompanyManagement'))
const EndorseList = lazy(() => import('./pages/insurance/EndorseList'))
const CodeByPolicy = lazy(() => import('./pages/insurance/CodeByPolicy'))
const KjDriverDocumentation = lazy(() => import('./pages/insurance/Documentation'))

// 로딩 컴포넌트
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">페이지를 불러오는 중...</p>
    </div>
  </div>
)

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
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/staff/employees" element={<Employees />} />
                      <Route path="/staff/employee-schedule" element={<EmployeeSchedule />} />
                      <Route path="/staff/holidays" element={<Holidays />} />
                      <Route path="/staff/half-day-approval" element={<HalfDayApproval />} />
                      <Route path="/staff/organization-chart" element={<OrganizationChart />} />
                      {/* 보험 상품 */}
                      <Route path="/pharmacy/applications" element={<PharmacyApplications />} />
                      <Route path="/pharmacy/renewal-list" element={<PharmacyRenewalList />} />
                      <Route path="/pharmacy/documentation" element={<PharmacyDocumentation />} />
                      {/* KJ 대리운전 */}
                      <Route path="/insurance/kj-driver-search" element={<DriverSearch />} />
                      <Route path="/insurance/kj-driver-policy-search" element={<PolicySearch />} />
                      <Route path="/insurance/kj-driver-company" element={<CompanyManagement />} />
                      <Route path="/insurance/kj-driver-endorse-list" element={<EndorseList />} />
                      <Route path="/insurance/kj-driver-code-by-policy" element={<CodeByPolicy />} />
                      <Route path="/insurance/kj-driver-documentation" element={<KjDriverDocumentation />} />
                      {/* 이전 경로 호환 */}
                      <Route path="/staff/work-schedules" element={<Navigate to="/staff/employee-schedule" replace />} />
                      {/* 추가 라우트는 여기에 추가 */}
                    </Routes>
                  </Suspense>
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
