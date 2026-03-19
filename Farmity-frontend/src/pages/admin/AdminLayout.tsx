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
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 min-h-screen text-slate-50">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex flex-col bg-slate-900/70 backdrop-blur border-slate-800/80 border-r w-64">
        <div className="flex justify-between items-center px-4 py-4 border-slate-800 border-b">
          <div>
            <h1 className="font-semibold text-lg tracking-tight">
              Stardewvalley Admin
            </h1>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-3 pb-1 font-semibold text-slate-500 text-xs uppercase tracking-wide">
            Navigation
          </p>
          <NavLink to="/admin/blog" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-6 h-6 font-semibold text-emerald-400 text-xs">
              B
            </span>
            <span>Blog Management</span>
          </NavLink>
          <NavLink to="/admin/news" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-6 h-6 font-semibold text-emerald-400 text-xs">
              N
            </span>
            <span>News Management</span>
          </NavLink>
          <NavLink to="/admin/media" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-6 h-6 font-semibold text-emerald-400 text-xs">
             M
            </span>
            <span>Media Management</span>
          </NavLink>
          <NavLink to="/admin/items" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-amber-500/10 rounded-md w-6 h-6 font-semibold text-amber-400 text-xs">
              I
            </span>
            <span>Items Catalog</span>
          </NavLink>
          <NavLink to="/admin/recipes" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-violet-500/10 rounded-md w-6 h-6 font-semibold text-violet-400 text-xs">
              R
            </span>
            <span>Crafting Recipes</span>
          </NavLink>
          <NavLink to="/admin/plants" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-green-500/10 rounded-md w-6 h-6 font-semibold text-green-400 text-xs">
              P
            </span>
            <span>Plants Catalog</span>
          </NavLink>
          <NavLink to="/admin/main-menu" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-sky-500/10 rounded-md w-6 h-6 font-semibold text-sky-400 text-xs">
              🖼
            </span>
            <span>Main Menu BG</span>
          </NavLink>
          <NavLink to="/admin/skin-configs" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-pink-500/10 rounded-md w-6 h-6 font-semibold text-pink-400 text-xs">
              S
            </span>
            <span>Skin Configs</span>
          </NavLink>
          <NavLink to="/admin/materials" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-orange-500/10 rounded-md w-6 h-6 font-semibold text-orange-400 text-xs">
              Mt
            </span>
            <span>Materials</span>
          </NavLink>
          <NavLink to="/admin/resource-configs" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-cyan-500/10 rounded-md w-6 h-6 font-semibold text-cyan-400 text-xs">
              Rc
            </span>
            <span>Resource Configs</span>
          </NavLink>
          <NavLink to="/admin/achievements" className={linkClass}>
            <span className="inline-flex justify-center items-center bg-yellow-500/10 rounded-md w-6 h-6 font-semibold text-yellow-300 text-xs">
              Ac
            </span>
            <span>Achievements</span>
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-slate-800 border-t">
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
      <main className="flex flex-col flex-1">
        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur px-4 md:px-6 border-slate-800/80 border-b">
          <div className="flex justify-between items-center h-14">
            <div className="md:hidden flex items-center gap-2">
              <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-8 h-8 font-semibold text-emerald-400 text-sm">
                F
              </span>
              <div>
                <p className="font-semibold text-sm leading-tight">
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
                className="border-slate-600 w-8 h-8 text-slate-200"
                onClick={() => setMobileNavOpen((v) => !v)}
              >
                {mobileNavOpen ? "×" : "☰"}
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile sidebar overlay */}
        {mobileNavOpen && (
          <div className="md:hidden z-40 fixed inset-0">
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="left-0 absolute inset-y-0 flex flex-col bg-slate-900 border-slate-800 border-r w-64">
              <div className="flex justify-between items-center px-4 py-4 border-slate-800 border-b">
                <h1 className="font-semibold text-base tracking-tight">
                  Stardewvalley Admin
                </h1>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="border-slate-600 w-7 h-7 text-slate-200"
                  onClick={() => setMobileNavOpen(false)}
                >
                  ×
                </Button>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-4">
                <p className="px-3 pb-1 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                  Navigation
                </p>
                <NavLink
                  to="/admin/blog"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-6 h-6 font-semibold text-emerald-400 text-xs">
                    B
                  </span>
                  <span>Blog posts</span>
                </NavLink>
                <NavLink
                  to="/admin/news"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-6 h-6 font-semibold text-emerald-400 text-xs">
                    N
                  </span>
                  <span>News</span>
                </NavLink>
                <NavLink
                  to="/admin/media"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-emerald-500/10 rounded-md w-6 h-6 font-semibold text-emerald-400 text-xs">
                    M
                  </span>
                  <span>Media</span>
                </NavLink>
                <NavLink
                  to="/admin/items"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-amber-500/10 rounded-md w-6 h-6 font-semibold text-amber-400 text-xs">
                    I
                  </span>
                  <span>Items Catalog</span>
                </NavLink>
                <NavLink
                  to="/admin/recipes"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-violet-500/10 rounded-md w-6 h-6 font-semibold text-violet-400 text-xs">
                    R
                  </span>
                  <span>Crafting Recipes</span>
                </NavLink>
                <NavLink
                  to="/admin/plants"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-green-500/10 rounded-md w-6 h-6 font-semibold text-green-400 text-xs">
                    P
                  </span>
                  <span>Plants Catalog</span>
                </NavLink>
                <NavLink
                  to="/admin/main-menu"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-sky-500/10 rounded-md w-6 h-6 font-semibold text-sky-400 text-xs">
                    🖼
                  </span>
                  <span>Main Menu BG</span>
                </NavLink>
                <NavLink
                  to="/admin/skin-configs"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-pink-500/10 rounded-md w-6 h-6 font-semibold text-pink-400 text-xs">
                    S
                  </span>
                  <span>Skin Configs</span>
                </NavLink>
                <NavLink
                  to="/admin/materials"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-orange-500/10 rounded-md w-6 h-6 font-semibold text-orange-400 text-xs">
                    Mt
                  </span>
                  <span>Materials</span>
                </NavLink>
                <NavLink
                  to="/admin/resource-configs"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-cyan-500/10 rounded-md w-6 h-6 font-semibold text-cyan-400 text-xs">
                    Rc
                  </span>
                  <span>Resource Configs</span>
                </NavLink>
                <NavLink
                  to="/admin/achievements"
                  onClick={() => setMobileNavOpen(false)}
                  className={linkClass}
                >
                  <span className="inline-flex justify-center items-center bg-yellow-500/10 rounded-md w-6 h-6 font-semibold text-yellow-300 text-xs">
                    Ac
                  </span>
                  <span>Achievements</span>
                </NavLink>
              </nav>
              <div className="px-3 py-4 border-slate-800 border-t">
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

        <div className="flex-1 px-4 md:px-8 py-6 md:py-8 w-full">
          <div className="mx-auto w-full max-w-5xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
