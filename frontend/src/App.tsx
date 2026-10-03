import React, { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import type { User } from "./types";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Applicants = lazy(() => import("./pages/Applicants"));
const Profile = lazy(() => import("./pages/Profile"));

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const x = localStorage.getItem("user"); return x ? JSON.parse(x) : null;
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
    localStorage.clear();
    setUser(null);
  };

  return (
    <Suspense fallback={<div className="center">Loading SmartHire...</div>}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login onLogin={login} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register onLogin={login} />} />
        <Route path="/*" element={
          user ? <ProtectedLayout user={user} logout={logout} dark={dark} setDark={setDark} /> :
          <Navigate to="/login" replace />
        } />
      </Routes>
    </Suspense>
  );
}

function ProtectedLayout({ user, logout, dark, setDark }: {
  user: User; logout: () => void; dark: boolean; setDark: (x: boolean) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const links = [["/", "Dashboard"], ["/jobs", "Jobs"], ["/applicants", "Applicants"], ["/profile", "Profile"]];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Smart<span>Hire</span></div>
        <div className="role">Recruiter Portal</div>
        <nav>{links.map(([path, label]) =>
          <button key={path} className={location.pathname === path ? "nav active" : "nav"} onClick={() => navigate(path)}>{label}</button>
        )}</nav>
        <div className="side-bottom">
          <button className="nav" onClick={() => setDark(!dark)}>{dark ? "☀ Light Mode" : "☾ Dark Mode"}</button>
          <button className="nav logout" onClick={logout}>↪ Logout</button>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div><b>SmartHire</b><span className="muted"> / {location.pathname === "/" ? "Dashboard" : location.pathname.slice(1)}</span></div>
          <div className="user-chip">{user.name}</div>
        </header>
        <Suspense fallback={<div className="center">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applicants" element={<Applicants />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
