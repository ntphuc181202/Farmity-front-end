import { JSX, useState } from "react";
import {
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./pages/public/HomePage";
import BlogPage from "./pages/public/blog/BlogPage";
import BlogDetailPage from "./pages/public/blog/BlogDetailPage";
import BlogAdminPage from "./pages/admin/blog/BlogAdminPage";
import AdminLoginPage from "./pages/admin/auth/AdminLoginPage";
import AdminRegisterPage from "./pages/admin/auth/AdminRegisterPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminResetPasswordPage from "./pages/admin/auth/AdminResetPasswordPage";
import NewAdminPage from "./pages/admin/news/NewsAdminPage";
import MediaAdminPage from "./pages/admin/media/MediaAdminPage";
import ItemsAdminPage from "./pages/admin/items/ItemsAdminPage";
import RecipesAdminPage from "./pages/admin/recipes/RecipesAdminPage";
import PlantsAdminPage from "./pages/admin/plants/PlantsAdminPage";
import MainMenuConfigPage from "./pages/admin/game-config/MainMenuConfigPage";
import SkinConfigPage from "./pages/admin/game-config/SkinConfigPage";
import CombatConfigPage from "./pages/admin/game-config/CombatConfigPage";
import MaterialsAdminPage from "./pages/admin/materials/MaterialsAdminPage";
import ResourceConfigsAdminPage from "./pages/admin/ResourceConfigsAdminPage";
import AchievementsAdminPage from "./pages/admin/achievements/AchievementsAdminPage";
import SkillsAdminPage from "./pages/admin/skills/SkillsAdminPage";
import AnalyticsAdminPage from "./pages/admin/analytics/AnalyticsAdminPage";
import EnemyStatsAdminPage from "./pages/admin/enemy-stats/EnemyStatsAdminPage";
import MediaPage from "./pages/public/media/MediaPage";
import MediaDetailPage from "./pages/public/media/MediaDetailPage";
import NewsPage from "./pages/public/news/NewPage";
import NewsDetailPage from "./pages/public/news/NewDetailPage";
import FAQPage from "./pages/public/faq/FAQPage";
import TroubleshootingPage from "./pages/public/troubleshooting/TroubleshootingPage";
import ContactSupportPage from "./pages/public/support/ContactSupportPage";
import DownloadPage from "./pages/public/dowload/DownloadPage";
import WikiPage from "./pages/public/wiki/WikiPage";

type RequireAdminProps = {
  children: JSX.Element;
};

function RequireAdmin({ children }: RequireAdminProps) {
  const isLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("isAdminLoggedIn") === "true";
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-xs sm:text-sm font-bold tracking-wide uppercase border-b-2 transition-colors ${
      isActive
        ? "text-[#fef3c7] border-[#f59e0b]"
        : "text-[#eaf6ea] border-transparent hover:text-[#fff7dd]"
    }`;

  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isAdminRoute = location.pathname.startsWith("/admin");

  if (isAdminRoute) {
    // Admin layout, không dùng header/footer public
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/register" element={<AdminRegisterPage />} />
        <Route
          path="/admin/reset-password"
          element={<AdminResetPasswordPage />}
        />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route path="blog" element={<BlogAdminPage />} />
          <Route path="news" element={<NewAdminPage />} />
          <Route path="media" element={<MediaAdminPage />} />
          <Route path="items" element={<ItemsAdminPage />} />
          <Route path="recipes" element={<RecipesAdminPage />} />
          <Route path="plants" element={<PlantsAdminPage />} />
          <Route path="main-menu" element={<MainMenuConfigPage />} />
          <Route path="skin-configs" element={<SkinConfigPage />} />
          <Route path="skill-visual" element={<CombatConfigPage />} />
          <Route path="skill-config" element={<CombatConfigPage />} />
          <Route path="combat-configs" element={<CombatConfigPage />} />
          <Route path="materials" element={<MaterialsAdminPage />} />
          <Route
            path="resource-configs"
            element={<ResourceConfigsAdminPage />}
          />
          <Route path="achievements" element={<AchievementsAdminPage />} />
          <Route path="skills" element={<SkillsAdminPage />} />
          <Route path="analytics" element={<AnalyticsAdminPage />} />
          <Route path="enemy-stats" element={<EnemyStatsAdminPage />} />
        </Route>
      </Routes>
    );
  }

  return (
    <div className="flex flex-col bg-[#f3f1e6] min-h-screen">
      <header className="bg-gradient-to-b from-[#1f5a3f] via-[#2f7a52] to-[#4f9b68] text-white shadow-[0_6px_18px_rgba(23,61,44,0.35)]">
        <div className="flex justify-between items-center gap-4 mx-auto px-4 sm:px-6 py-3 max-w-6xl">
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/img/headbarlogo.png"
              alt="Farmity"
              className="h-10 sm:h-12 md:h-14 w-auto drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]"
            />
          </Link>
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-3 sm:gap-4">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Blog
            </NavLink>
            <NavLink to="/news" className={navLinkClass}>
              News
            </NavLink>
            <NavLink to="/media" className={navLinkClass}>
              Media
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              FAQ
            </NavLink>
            <NavLink to="/contact-support" className={navLinkClass}>
              Contact & Support
            </NavLink>
            <NavLink to="/download" className={navLinkClass}>
              Dowload
            </NavLink>
            <NavLink to="/wiki" className={navLinkClass}>
              Wiki
            </NavLink>
            {/* <a
              href="#"
              className="px-3 py-2 font-bold text-white/90 hover:text-white text-xs sm:text-sm uppercase tracking-wide"
            >
              Wiki
            </a> */}
          </nav>
          {/* Right social icons (desktop only for spacing) */}
          <div className="hidden sm:flex items-center gap-3 sm:gap-4 ml-auto">
            {/* social icons kept as in JSX version */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="p-1 text-white/90 hover:text-white transition-colors"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="mailto:contact@example.com"
              aria-label="Email"
              className="p-1 text-white/90 hover:text-white transition-colors"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </a>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord"
              className="p-1 text-white/90 hover:text-white transition-colors"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </a>
          </div>
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden inline-flex justify-center items-center bg-[#163e2b]/35 ml-auto border border-[#c9e7d3]/60 rounded w-9 h-9 text-[#eefaf0] text-sm"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? "×" : "☰"}
          </button>
        </div>
        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#215e41]/95 border-[#c9e7d3]/30 border-t">
            <div className="flex flex-wrap justify-center items-center gap-2 mx-auto px-4 py-2 max-w-6xl">
              <NavLink
                to="/"
                end
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isActive
                      ? "bg-[#f7d87c] text-[#163e2b]"
                      : "bg-[#163e2b]/40 text-[#eefaf0]"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/blog"
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isActive
                      ? "bg-[#f7d87c] text-[#163e2b]"
                      : "bg-[#163e2b]/40 text-[#eefaf0]"
                  }`
                }
              >
                Blog
              </NavLink>
              {["News", "Media", "FAQ", "Support", "Download", "Wiki"].map(
                (label) => (
                  <a
                    key={label}
                    href="#"
                    className="bg-[#163e2b]/40 px-3 py-1.5 rounded-full font-bold text-[#eefaf0] text-xs uppercase tracking-wide"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {label}
                  </a>
                ),
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/:id" element={<MediaDetailPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsDetailPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/troubleshooting" element={<TroubleshootingPage />} />
          <Route path="/contact-support" element={<ContactSupportPage />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="/wiki" element={<WikiPage />} />
        </Routes>
      </main>

      <footer className="bg-gradient-to-b from-[#f3ecd0] to-[#e8ddb9] px-6 py-6 pb-8 border-[#8fa77f]/40 border-t text-center">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-1 text-[#5a4a2f] text-sm">
            © {new Date().getFullYear()} Peaceful Farmstead · A cozy farm adventure.
          </p>
          <p className="text-[#6f5d3f]/80 text-xs">
            Community fan site for farm game lovers.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
