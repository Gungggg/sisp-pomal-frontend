import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "./layouts/PublicLayout"
import AdminLayout from "./layouts/AdminLayout"
import SearchPage from "./pages/public/SearchPage"
import LoginPage from "./pages/admin/LoginPage"
import DashboardPage from "./pages/admin/DashboardPage"
import UserManagementPage from "./pages/admin/UserManagementPage"
import BlacklistManagementPage from "./pages/admin/BlacklistManagementPage"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<SearchPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="blacklist" element={<BlacklistManagementPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
