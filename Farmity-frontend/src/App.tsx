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
import NewsDetailPage from "./pages/public/news/NewDetalPage";
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
        ? "text-yellow-300 border-yellow-300"
        : "text-white/90 border-transparent hover:text-white"
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
    <div className="flex flex-col bg-stardew-bg min-h-screen">
      <header className="bg-gradient-to-b from-[#041649] via-[#0a4ea3] to-[#25a5dd] text-white">
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
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="p-1 text-white/90 hover:text-white transition-colors"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a
              href="https://reddit.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Reddit"
              className="p-1 text-white/90 hover:text-white transition-colors"
            >
              <svg
                className="w-5 sm:w-6 h-5 sm:h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0  1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
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
            className="md:hidden inline-flex justify-center items-center bg-white/10 ml-auto border border-white/50 rounded w-9 h-9 text-white text-sm"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            {mobileNavOpen ? "×" : "☰"}
          </button>
        </div>
        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="md:hidden bg-[#0a4ea3]/80 border-white/20 border-t">
            <div className="flex flex-wrap justify-center items-center gap-2 mx-auto px-4 py-2 max-w-6xl">
              <NavLink
                to="/"
                end
                onClick={() => setMobileNavOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                    isActive
                      ? "bg-yellow-300 text-[#041649]"
                      : "bg-white/10 text-white/90"
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
                      ? "bg-yellow-300 text-[#041649]"
                      : "bg-white/10 text-white/90"
                  }`
                }
              >
                Blog
              </NavLink>
              {["Forums", "Wiki", "Media", "Merch", "FAQ", "Tabletop"].map(
                (label) => (
                  <a
                    key={label}
                    href="#"
                    className="bg-white/10 px-3 py-1.5 rounded-full font-bold text-white/90 text-xs uppercase tracking-wide"
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

      <footer className="bg-[#fef6ad] px-6 py-6 pb-8 border-stardew-green-dark/40 border-t text-center">
        <div className="mx-auto max-w-[900px]">
          <p className="mb-1 text-stardew-brown-soft text-sm">
            © {new Date().getFullYear()} Stardewvalley · Inspired by Stardew
            Valley and other farming games.
          </p>
          <p className="text-stardew-brown-soft/80 text-xs">
            Stardew Valley © ConcernedApe LLC. This is an unofficial fan page.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
