import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { Button } from "../../components/ui/button";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2 ${
    isActive
      ? "bg-slate-800/80 text-emerald-300 border-emerald-400 shadow-sm"
      : "text-white/80 border-transparent hover:bg-white/5 hover:text-white"
  }`;

function AdminLayout() {
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem("auth");
      localStorage.removeItem("isAdminLoggedIn");
      navigate("/admin/login", { replace: true });
      setMobileNavOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 bg-slate-900/70 border-r border-slate-800/80 backdrop-blur flex-col">
        <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Stardewvalley Admin
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Navigation
          </p>
          <NavLink to="/admin/blog" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              B
            </span>
            <span>Blog Management</span>
          </NavLink>
          <NavLink to="/admin/news" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              N
            </span>
            <span>News Management</span>
          </NavLink>
          <NavLink to="/admin/media" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
             M
            </span>
            <span>Media Management</span>
          </NavLink>
          <NavLink to="/admin/items" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 text-xs font-semibold">
              I
            </span>
            <span>Items Catalog</span>
          </NavLink>
          <NavLink to="/admin/recipes" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-400 text-xs font-semibold">
              R
            </span>
            <span>Crafting Recipes</span>
          </NavLink>
          <NavLink to="/admin/plants" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10 text-green-400 text-xs font-semibold">
              P
            </span>
            <span>Plants Catalog</span>
          </NavLink>
          <NavLink to="/admin/main-menu" className={linkClass}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-400 text-xs font-semibold">
              🖼
            </span>
            <span>Main Menu BG</span>
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur px-4 md:px-6">
          <div className="h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 md:hidden">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                F
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">
                  Stardewvalley Admin
                </p>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Management dashboard
                </p>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 border-slate-600 text-slate-200"
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                {mobileNavOpen ? "×" : "☰"}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
              <div className="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
                <h1 className="text-base font-semibold tracking-tight">
                  Stardewvalley Admin
                </h1>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 border-slate-600 text-slate-200"
                  onClick={() => setMobileNavOpen(false)}
                >
                  ×
                </Button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1">
                <p className="px-3 pb-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Navigation
                </p>
                <NavLink
                  to="/admin/blog"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    B
                  </span>
                  <span>Blog posts</span>
                </NavLink>
                <NavLink
                  to="/admin/news"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    N
                  </span>
                  <span>News</span>
                </NavLink>
                <NavLink
                  to="/admin/media"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                    M
                  </span>
                  <span>Media</span>
                </NavLink>
                <NavLink
                  to="/admin/items"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400 text-xs font-semibold">
                    I
                  </span>
                  <span>Items Catalog</span>
                </NavLink>
                <NavLink
                  to="/admin/recipes"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-400 text-xs font-semibold">
                    R
                  </span>
                  <span>Crafting Recipes</span>
                </NavLink>
                <NavLink
                  to="/admin/plants"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10 text-green-400 text-xs font-semibold">
                    P
                  </span>
                  <span>Plants Catalog</span>
                </NavLink>
                <NavLink
                  to="/admin/main-menu"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-sky-500/10 text-sky-400 text-xs font-semibold">
                    🖼
                  </span>
                  <span>Main Menu BG</span>
                </NavLink>
              </nav>
              <div className="px-3 py-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </aside>
          </div>
        )}

        <div className="flex-1 w-full px-4 md:px-8 py-6 md:py-8">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
