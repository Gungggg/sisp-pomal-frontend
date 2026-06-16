import { Outlet, Link, useNavigate } from "react-router-dom"
import { Shield } from "lucide-react"

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("sisp_admin_auth")
    navigate("/admin/login")
  }

  // Cek Auth
  const isAuthenticated = !!localStorage.getItem("sisp_admin_auth")
  const userDataString = localStorage.getItem("sisp_user")
  let user = null
  try {
    user = userDataString ? JSON.parse(userDataString) : null
  } catch (e) {
    console.error("Failed to parse user data", e)
    user = null
  }
  const isSuperadmin = user?.role === "superadmin"

  if (!isAuthenticated && window.location.pathname !== "/admin/login") {
    // Akan redirect jika tidak auth, dihandle di level komponen page atau router, 
    // tapi buat jaga-jaga kita cegah render content admin
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-strong)]">
        <p>Akses Ditolak. Silakan Login.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col font-light bg-[var(--color-canvas)]">
      <header className="h-16 bg-[var(--color-surface-dark)] text-[var(--color-on-dark)] sticky top-0 z-50 flex items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[var(--color-primary)]" />
            <span className="font-bold tracking-wider text-[var(--color-on-dark)]">ADMIN SISP</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-6 border-l border-[var(--color-surface-dark-elevated)] pl-8">
              <Link to="/admin/dashboard" className={`text-[14px] font-normal tracking-[0.3px] transition-colors ${window.location.pathname === '/admin/dashboard' ? 'text-white' : 'text-[var(--color-on-dark-soft)] hover:text-white'}`}>
                Manajemen Sanksi
              </Link>
              {isSuperadmin && (
                <Link to="/admin/users" className={`text-[14px] font-normal tracking-[0.3px] transition-colors ${window.location.pathname === '/admin/users' ? 'text-white' : 'text-[var(--color-on-dark-soft)] hover:text-white'}`}>
                  Kelola Admin
                </Link>
              )}
            </nav>
          )}
        </div>
        {isAuthenticated && (
          <nav className="flex items-center gap-6">
            <span className="hidden md:inline text-[13px] text-[var(--color-on-dark-soft)] uppercase tracking-[1px] font-bold mr-4">
              {user?.email} ({user?.role})
            </span>
            <button onClick={handleLogout} className="text-[14px] font-normal tracking-[0.3px] text-[var(--color-on-dark-soft)] hover:text-[var(--color-on-dark)] transition-colors">
              Logout
            </button>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
