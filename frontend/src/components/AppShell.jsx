import { NavLink, useNavigate } from "react-router-dom";
import {
  LogOut,
  Search,
  Shield,
  FilePlus2,
  LayoutDashboard,
  ClipboardList,
  Boxes,
} from "lucide-react";

export default function AppShell({ user, children }) {
  const navigate = useNavigate();
  const isAdmin = user?.role === "ADMIN";

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-900 flex items-center justify-center font-bold">
              U
            </div>
            <div className="leading-tight">
              <div className="text-xs text-slate-400">UniFind</div>
              <div className="text-base font-semibold tracking-tight">
                Lost & Found System
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium">
                {user?.fullName || "User"}
              </div>
              <div className="text-xs text-slate-400">{user?.role}</div>
            </div>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-sm hover:bg-slate-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-4 py-6">
        <aside className="col-span-12 md:col-span-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3">
            <nav className="flex flex-col gap-1">
              {!isAdmin ? (
                <>
                  <NavItem
                    to="/student/found"
                    icon={<Search className="h-4 w-4" />}
                    label="Browse Found Items"
                  />
                  <NavItem
                    to="/student/report-lost"
                    icon={<FilePlus2 className="h-4 w-4" />}
                    label="Report Lost Item"
                  />
                </>
              ) : (
                <>
                  <NavItem
                    to="/admin"
                    icon={<LayoutDashboard className="h-4 w-4" />}
                    label="Dashboard"
                  />
                  <NavItem
                    to="/admin/claims"
                    icon={<ClipboardList className="h-4 w-4" />}
                    label="Claims Review"
                  />
                  <NavItem
                    to="/admin/items"
                    icon={<Boxes className="h-4 w-4" />}
                    label="Items"
                  />
                </>
              )}

              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-slate-200">
                  <Shield className="h-4 w-4" />
                  Role-based access enabled
                </div>
                <div className="mt-1 text-slate-400">
                  JWT auth • MySQL • Audit history
                </div>
              </div>
            </nav>
          </div>
        </aside>

        <main className="col-span-12 md:col-span-9">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-200 hover:bg-slate-900"
        }`
      }
    >
      {icon}
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}
