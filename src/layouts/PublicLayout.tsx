import { Outlet, Link } from "react-router-dom"

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col font-light">
      {/* Top Navigation */}
      <header className="h-16 bg-[var(--color-canvas)] sticky top-0 z-50 flex items-center justify-between px-8 border-b border-[var(--color-hairline)]">
        <div className="flex items-center gap-4">
          {/* Logo Puspomal */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/LogoPomal.jpeg" alt="Logo Puspomal" className="h-10 w-10 object-contain" />
            <span className="font-bold text-[var(--color-ink)] tracking-wider">SISP PUSPOMAL</span>
          </Link>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-[14px] font-normal tracking-[0.3px] text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors">Pencarian</Link>
          <Link to="/admin/login" className="text-[14px] font-normal tracking-[0.3px] text-[var(--color-ink)] hover:text-[var(--color-primary)] transition-colors">Admin Login</Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[var(--color-surface-soft)] text-[var(--color-body)] py-16 px-8 mt-auto">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/LogoAL.jpeg" alt="Logo TNI AL" className="h-12 w-12 object-contain" />
              <span className="font-bold text-lg text-[var(--color-ink)]">TNI AL ROBLOX</span>
            </div>
            <p className="text-[14px] font-light max-w-sm text-[var(--color-body)]">Sistem Informasi Pelacakan Sanksi Puspomal. Menjaga disiplin dan ketertiban anggota secara transparan.</p>
          </div>
          <div className="flex flex-col md:items-end justify-center">
            <p className="text-[14px] text-[var(--color-muted)] font-light">&copy; {new Date().getFullYear()} Puspomal TNI AL Roblox. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
