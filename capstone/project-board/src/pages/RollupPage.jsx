import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { request } from "../api";
import { BOARD_BASE_URL } from "../config";

const SIDEBAR_LINKS = [
  { to: "/", label: "Projects" },
  { to: "/rollup", label: "Rollup" },
  { to: "/profile", label: "Profile" },
];

function getUserDisplayName(user) {
  return user?.username || "User";
}

function getUserDepartmentName(user) {
  return (
    user?.team?.department || "—"
  );
}

function getUserAvatarUrl(user) {
  return user?.photoUrl || null;
}

function getInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Sidebar({ user }) {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">EC</div>
        <div>
          <strong>EverBank Connect</strong>
          <span>Internal delivery space</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {SIDEBAR_LINKS.map((link) => {
          const isActive =
            link.to === "/"
              ? location.pathname === "/"
              : location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);

          return (
            <Link key={link.to} to={link.to} className={`sidebar-link ${isActive ? "is-active" : ""}`}>
              <span className="sidebar-link-dot" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar user-avatar-large">
          {getUserAvatarUrl(user) ? <img src={getUserAvatarUrl(user)} alt="" /> : getInitials(getUserDisplayName(user))}
        </div>
        <div>
          <strong>{getUserDisplayName(user)}</strong>
          <span>{getUserDepartmentName(user)}</span>
        </div>
      </div>
    </aside>
  );
}

export default function RollupPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [summary, setSummary] = useState({ total: 0, overdue: 0, stale: 0 });

  useEffect(() => {
    let active = true;

    async function loadSummary() {
      try {
        const data = await request("GET", `${BOARD_BASE_URL}/tasks/summary`);
        if (active) setSummary(data || { total: 0, overdue: 0, stale: 0 });
      } catch {
        if (active) setSummary({ total: 0, overdue: 0, stale: 0 });
      }
    }

    loadSummary();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: "Total Tasks", value: summary.total || 0 },
      { label: "Overdue", value: summary.overdue || 0 },
      { label: "Stale", value: summary.stale || 0 },
    ],
    [summary],
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell rollup-shell">
      <Sidebar user={user} />

      <div className="main-column">
        <header className="topbar">
          <div className="board-title-block">
            <h1>Rollup</h1>
            <p>{getUserDisplayName(user)}</p>
          </div>
          <div className="topbar-actions">
            <button type="button" className="btn-ghost" onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <button type="button" className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="rollup-page">
          <section className="rollup-grid">
            {cards.map((card) => (
              <article key={card.label} className="profile-card rollup-card">
                <p className="rollup-label">{card.label}</p>
                <strong className="rollup-value">{card.value}</strong>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}