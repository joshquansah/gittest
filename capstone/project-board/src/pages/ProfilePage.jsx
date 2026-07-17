import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import {getUserDisplayName, getUserDepartmentName, getUserAvatarUrl, getInitials, getUserTeamName, getUserEmail} from "../utils/projectData";
const SIDEBAR_LINKS = [
  { to: "/", label: "Projects" },
  { to: "/rollup", label: "Rollup" },
  { to: "/profile", label: "Profile" },
];

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
        <div className="user-hover-trigger">
          <div className="user-avatar user-avatar-large">
            {getUserAvatarUrl(user) ? <img src={getUserAvatarUrl(user)} alt="" /> : getInitials(getUserDisplayName(user))}
          </div>
        </div>
        <div>
          <strong>{getUserDisplayName(user)}</strong>
          <span>{getUserDepartmentName(user)}</span>
        </div>
      </div>
    </aside>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell profile-shell">
      <Sidebar user={user} />

      <div className="main-column">
        <header className="topbar">
          <div className="board-title-block">
            <h1>Profile</h1>
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

        <main className="profile-page">
          <section className="profile-card">
            <div className="profile-card-header">
              <div className="user-avatar profile-avatar">
                {getUserAvatarUrl(user) ? <img src={getUserAvatarUrl(user)} alt="" /> : getInitials(getUserDisplayName(user))}
              </div>
              <div>
                <h2>{getUserDisplayName(user)}</h2>
                <p>{user?.role || "Member"}</p>
              </div>
            </div>

            <div className="profile-grid">
              <div className="profile-field">
                <span>Name</span>
                <strong>{getUserDisplayName(user)}</strong>
              </div>
              <div className="profile-field">
                <span>Department</span>
                <strong>{getUserDepartmentName(user)}</strong>
              </div>
              <div className="profile-field">
                <span>Team</span>
                <strong>{getUserTeamName(user)}</strong>
              </div>
              <div className="profile-field">
                <span>Email</span>
                <strong>{getUserEmail(user)}</strong>
              </div>
              <div className="profile-field">
                <span>Role</span>
                <strong>{user?.role || "Member"}</strong>
              </div>
              <div className="profile-field">
                <span>Profile image</span>
                <strong>{getUserAvatarUrl(user) ? "Set" : "Not set"}</strong>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}