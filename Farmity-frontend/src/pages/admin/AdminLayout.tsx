import { useMemo, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { Button } from "../../components/ui/button";

type AdminAuth = {
  isStaff?: string[] | string;
} | null;

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2 ${
    isActive
      ? "bg-slate-800/80 text-emerald-300 border-emerald-400 shadow-sm"
      : "text-white/80 border-transparent hover:bg-white/5 hover:text-white"
  }`;

function AdminLayout() {
  const HEARTBEAT_VISIBLE_INTERVAL_MS = 15000;
  const HEARTBEAT_HIDDEN_INTERVAL_MS = 15000;
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const kickedRef = useRef(false);
  const closeLogoutSentRef = useRef(false);

  const forceKickToLogin = () => {
    if (kickedRef.current) return;
    kickedRef.current = true;

    localStorage.removeItem("auth");
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    let disposed = false;
    let heartbeatTimer: number | null = null;

    const isUnauthorizedError = (err: any) => {
      const status = err?.response?.status;
      const code = err?.response?.data?.statusCode;
      return status === 401 || code === 401;
    };

    const getHeartbeatInterval = () => {
      return document.visibilityState === "visible"
        ? HEARTBEAT_VISIBLE_INTERVAL_MS
        : HEARTBEAT_HIDDEN_INTERVAL_MS;
    };

    const checkSession = async () => {
      try {
        await authApi.adminCheck();
      } catch (err: any) {
        if (disposed) return;
        if (isUnauthorizedError(err)) {
          forceKickToLogin();
        }
      }
    };

    const sendHeartbeat = async () => {
      try {
        await authApi.heartbeat({ clientUnixMs: Date.now() });
      } catch (err: any) {
        if (disposed) return;
        if (isUnauthorizedError(err)) {
          forceKickToLogin();
        }
      }
    };

    const scheduleHeartbeat = () => {
      if (disposed) return;
      if (heartbeatTimer !== null) {
        window.clearTimeout(heartbeatTimer);
      }

      heartbeatTimer = window.setTimeout(async () => {
        await sendHeartbeat();
        scheduleHeartbeat();
      }, getHeartbeatInterval());
    };

    const sendCloseLogout = () => {
      if (closeLogoutSentRef.current) return;
      closeLogoutSentRef.current = true;

      const base = ((((import.meta as any).env?.VITE_API_BASE_URL as string) || "")).replace(/\/$/, "");
      const endpoint = base ? `${base}/auth/logout` : "/auth/logout";

      let accessToken = "";
      try {
        const raw = localStorage.getItem("auth");
        if (raw) {
          const parsed = JSON.parse(raw);
          accessToken = parsed?.access_token || "";
        }
      } catch {
        // Ignore parse error and try cookie-only logout.
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      try {
        void fetch(endpoint, {
          method: "POST",
          headers,
          body: "{}",
          credentials: "include",
          keepalive: true,
        });
      } catch {
        // Best effort only during page teardown.
      }
    };

    void checkSession();
    void sendHeartbeat();
    scheduleHeartbeat();

    const onFocus = () => {
      void checkSession();
      void sendHeartbeat();
    };

    const onVisibilityChange = () => {
      void sendHeartbeat();
      scheduleHeartbeat();
    };

    const onPageHide = () => {
      sendCloseLogout();
    };

    const onBeforeUnload = () => {
      sendCloseLogout();
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      disposed = true;
      if (heartbeatTimer !== null) {
        window.clearTimeout(heartbeatTimer);
      }
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [navigate]);

  const auth = useMemo<AdminAuth>(() => {
    const raw = localStorage.getItem("auth");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const normalizePermission = (permission: string) => {
    const normalized = permission?.toString().trim().toLowerCase();
    if (normalized === "new") return "news";
    return normalized;
  };

  const staffPermissions = useMemo(() => {
    if (!auth?.isStaff) return [];
    const raw = auth.isStaff;
    const permissions = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
        ? raw.split(/[,;\s]+/)
        : [];

    const normalized = permissions
      .map((permission) => normalizePermission(permission))
      .filter(Boolean);

    return normalized;
  }, [auth]);

  const isStaffUser = staffPermissions.length > 0;

  const staffNavItems = [
    {
      to: "/admin/blog",
      label: "Blog Management",
      icon: "B",
      iconClass: "bg-emerald-500/10 text-emerald-400",
      permission: "blog",
    },
    {
      to: "/admin/news",
      label: "News Management",
      icon: "N",
      iconClass: "bg-emerald-500/10 text-emerald-400",
      permission: "news",
    },
    {
      to: "/admin/media",
      label: "Media Management",
      icon: "M",
      iconClass: "bg-emerald-500/10 text-emerald-400",
      permission: "media",
    },
  ];

  const adminNavItems = [
    {
      to: "/admin/blog",
      label: "Blog Management",
      icon: "B",
      iconClass: "bg-emerald-500/10 text-emerald-400",
    },
    {
      to: "/admin/news",
      label: "News Management",
      icon: "N",
      iconClass: "bg-emerald-500/10 text-emerald-400",
    },
    {
      to: "/admin/media",
      label: "Media Management",
      icon: "M",
      iconClass: "bg-emerald-500/10 text-emerald-400",
    },
    {
      to: "/admin/analytics",
      label: "Analytics",
      icon: "An",
      iconClass: "bg-cyan-500/10 text-cyan-300",
    },
    {
      to: "/admin/achievements",
      label: "Achievements",
      icon: "Ac",
      iconClass: "bg-yellow-500/10 text-yellow-300",
    },
    {
      to: "/admin/quests",
      label: "Quest Management",
      icon: "Q",
      iconClass: "bg-fuchsia-500/10 text-fuchsia-300",
    },
    {
      to: "/admin/events",
      label: "Event Management",
      icon: "Ev",
      iconClass: "bg-teal-500/10 text-teal-300",
    },
    {
      to: "/admin/items",
      label: "Items Catalog",
      icon: "I",
      iconClass: "bg-amber-500/10 text-amber-400",
    },
    {
      to: "/admin/materials",
      label: "Materials",
      icon: "Mt",
      iconClass: "bg-orange-500/10 text-orange-400",
    },
    {
      to: "/admin/plants",
      label: "Plants Catalog",
      icon: "P",
      iconClass: "bg-green-500/10 text-green-400",
    },
    {
      to: "/admin/recipes",
      label: "Crafting Recipes",
      icon: "R",
      iconClass: "bg-violet-500/10 text-violet-400",
    },
    {
      to: "/admin/skills",
      label: "Combat Skills",
      icon: "Sk",
      iconClass: "bg-indigo-500/10 text-indigo-300",
    },
    {
      to: "/admin/enemy-stats",
      label: "Enemy Stats",
      icon: "En",
      iconClass: "bg-red-500/10 text-red-300",
    },
    {
      to: "/admin/resource-configs",
      label: "Resource Configs",
      icon: "Rc",
      iconClass: "bg-cyan-500/10 text-cyan-400",
    },
    {
      to: "/admin/combat-configs",
      label: "Combat Configs",
      icon: "Cc",
      iconClass: "bg-rose-500/10 text-rose-300",
    },
    {
      to: "/admin/skin-configs",
      label: "Skin Configs",
      icon: "S",
      iconClass: "bg-pink-500/10 text-pink-400",
    },
    {
      to: "/admin/main-menu",
      label: "Main Menu BG",
      icon: "🖼",
      iconClass: "bg-sky-500/10 text-sky-400",
    },
    {
      to: "/admin/staff",
      label: "Staff Management",
      icon: "St",
      iconClass: "bg-violet-500/10 text-violet-300",
    },
  ];

  const visibleNavItems = isStaffUser
    ? staffNavItems.filter((item) => staffPermissions.includes(item.permission))
    : adminNavItems;

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      forceKickToLogin();
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
          {visibleNavItems.length > 0 ? (
            visibleNavItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <span
                  className={`inline-flex justify-center items-center rounded-md w-6 h-6 font-semibold text-xs ${
                    item.iconClass ?? "bg-slate-800/50 text-slate-50"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))
          ) : (
            <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-4 text-sm text-slate-400">
              No assigned modules. Contact your administrator.
            </div>
          )}
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
                {visibleNavItems.length > 0 ? (
                  visibleNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileNavOpen(false)}
                      className={linkClass}
                    >
                      <span className="inline-flex justify-center items-center rounded-md w-6 h-6 font-semibold text-slate-50 text-xs bg-slate-800/50">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </NavLink>
                  ))
                ) : (
                  <div className="rounded-md border border-slate-800 bg-slate-950 px-3 py-4 text-sm text-slate-400">
                    No assigned modules. Contact your administrator.
                  </div>
                )}
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
