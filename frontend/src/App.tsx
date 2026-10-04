import React, { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { User } from "./types";
import {
  IconDashboard,
  IconBriefcase,
  IconUsers,
  IconUser,
  IconSun,
  IconMoon,
  IconLogOut
} from "./components/Icons";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Applicants = lazy(() => import("./pages/Applicants"));
const Profile = lazy(() => import("./pages/Profile"));

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });

  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true");

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("dark", String(dark));
  }, [dark]);

  const login = (u: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <Suspense
      fallback={
        <div className="page-loading-wrapper">
          <div className="spinner-large"></div>
          <p>Loading SmartHire...</p>
        </div>
      }
    >
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login onLogin={login} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register onLogin={login} />}
        />
        <Route
          path="/*"
          element={
            user ? (
              <ProtectedLayout
                user={user}
                logout={logout}
                dark={dark}
                setDark={setDark}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
}

function ProtectedLayout({
  user,
  logout,
  dark,
  setDark
}: {
  user: User;
  logout: () => void;
  dark: boolean;
  setDark: (x: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: <IconDashboard size={19} /> },
    { path: "/applicants", label: "Candidates", icon: <IconUsers size={19} /> },
    { path: "/jobs", label: "Job Openings", icon: <IconBriefcase size={19} /> },
    { path: "/profile", label: "Recruiter Profile", icon: <IconUser size={19} /> }
  ];

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Dashboard";
      case "/applicants":
        return "Candidate Pipeline";
      case "/jobs":
        return "Job Requisitions";
      case "/profile":
        return "Recruiter Profile";
      default:
        return "Recruiter Portal";
    }
  };

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-brand-box">
          <div className="brand" onClick={() => navigate("/")}>
            Smart<span>Hire</span>
            <span className="brand-subtag">ATS</span>
          </div>
          <div className="role-badge">Recruiter Workspace</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                type="button"
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="nav-item-icon">{item.icon}</span>
                <span className="nav-item-text">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="theme-switch-btn"
            onClick={() => setDark(!dark)}
            title="Toggle color theme"
          >
            {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <div className="sidebar-user-card">
            <div className="user-avatar-mini">
              {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
            </div>
            <div className="user-details-mini">
              <div className="user-mini-name">{user.name}</div>
              <div className="user-mini-email">{user.email}</div>
            </div>
            <button
              type="button"
              className="user-logout-icon-btn"
              onClick={logout}
              title="Sign Out"
            >
              <IconLogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-viewport">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              ☰
            </button>
            <div className="topbar-breadcrumb">
              <span className="brand-crumb">SmartHire</span>
              <span className="crumb-separator">/</span>
              <span className="crumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="theme-toggle-top-btn"
              onClick={() => setDark(!dark)}
              title="Toggle theme"
            >
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </button>

            <div
              className="topbar-profile-chip"
              onClick={() => navigate("/profile")}
              role="button"
              tabIndex={0}
            >
              <div className="topbar-avatar">
                {user.name ? user.name.slice(0, 2).toUpperCase() : "U"}
              </div>
              <span className="topbar-name">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="main-content-scroll">
          <Suspense
            fallback={
              <div className="page-loading-wrapper">
                <div className="spinner-large"></div>
                <p>Loading view...</p>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/applicants" element={<Applicants />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
