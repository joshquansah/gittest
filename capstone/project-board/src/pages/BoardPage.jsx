import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { request } from "../api";
import { BOARD_BASE_URL } from "../config";
import { connectSSE } from "../sse";
import AIDrawer from "../components/AIDrawer";
import ProjectCard from "../components/ProjectCard";
import { useTheme } from "../hooks/useTheme";
import {
  formatLabel,
  getInitials,
  getUserAvatarUrl,
  getUserDepartmentName,
  getUserDisplayName,
  getUserEmail,
  getUserTeamName,
  groupProjectsByStatus,
  normalizeProject,
  normalizeProjectsResponse,
  normalizeTask,
  projectMatchesSearch,
  replaceTaskInProject,
  summarizeProjects,
  upsertProject,
} from "../utils/projectData";

const SIDEBAR_LINKS = [
  { to: "/", label: "Projects" },
  { to: "/rollup", label: "Rollup" },
  { to: "/admin", label: "Admin" },
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
              ? location.pathname === "/" || location.pathname.startsWith("/projects")
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
          <div className="user-hover-card" role="tooltip">
            <div className="user-hover-header">
              <div className="user-avatar user-avatar-large">
                {getUserAvatarUrl(user) ? <img src={getUserAvatarUrl(user)} alt="" /> : getInitials(getUserDisplayName(user))}
              </div>
              <div>
                <strong>{getUserDisplayName(user)}</strong>
                <span>{user?.role || "Member"}</span>
              </div>
            </div>
            <div className="user-hover-row">
              <span>Team</span>
              <strong>{getUserTeamName(user)}</strong>
            </div>
            <div className="user-hover-row">
              <span>Department</span>
              <strong>{getUserDepartmentName(user)}</strong>
            </div>
            <div className="user-hover-row">
              <span>Email</span>
              <strong>{getUserEmail(user)}</strong>
            </div>
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

function SummaryStrip({ summary }) {
  const cards = [
    { label: "Projects", value: summary.projects || 0, accent: "summary-total" },
    { label: "Tasks", value: summary.tasks || 0, accent: "summary-overdue" },
    { label: "Stale", value: summary.stale || 0, accent: "summary-stale" },
  ];

  return (
    <section className="summary-strip" aria-label="Board summary">
      {cards.map((card) => (
        <article key={card.label} className="summary-card">
          <span className={`summary-indicator ${card.accent}`} />
          <div>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}

function getEventType(event) {
  return String(event?.type || event?.event || event?.name || event?.action || "").toUpperCase();
}

function applyBoardEvent(projects, event) {
  const eventType = getEventType(event);
  const payloadProject = event?.project || event?.projectData || event?.data?.project;
  if (payloadProject && (eventType.includes("PROJECT") || payloadProject.id != null)) {
    return upsertProject(projects, normalizeProject(payloadProject));
  }

  const taskPayload = event?.task || event?.taskData || event?.data?.task || (event?.id && event?.status ? event : null);
  if (!taskPayload?.id) return projects;

  const nextProjectId = taskPayload.projectId ?? taskPayload.project?.id ?? event?.projectId;
  if (nextProjectId == null) return projects;

  return projects.map((project) => {
    if (String(project.id) !== String(nextProjectId)) return project;
    return replaceTaskInProject(project, normalizeTask(taskPayload, project));
  });
}

function matchesProjectFilters(project, searchTerm, statusFilter, teamFilter) {
  const normalizedStatus = String(project.status || "").toUpperCase();
  const teamValue = String(project.teamId ?? project.teamName ?? project.team ?? "").toLowerCase();
  const selectedTeam = String(teamFilter || "").toLowerCase();
  const statusMatches = statusFilter === "ALL" || normalizedStatus === statusFilter;
  const teamMatches = teamFilter === "ALL" || teamValue === selectedTeam || String(project.teamName || "").toLowerCase() === selectedTeam;
  return statusMatches && teamMatches && projectMatchesSearch(project, searchTerm);
}

export default function BoardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      if (!active) return;
      setLoading(true);
      try {
        const data = await request("GET", `${BOARD_BASE_URL}/projects`);
        if (active) {
          setProjects(normalizeProjectsResponse(data));
          setError("");
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load projects");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!token) return undefined;

    return connectSSE(
      `${BOARD_BASE_URL}/updates/stream`,
      token,
      (event) => {
        setProjects((currentProjects) => applyBoardEvent(currentProjects, event));
      },
      (err) => setError(err.message || "Live updates disconnected"),
    );
  }, [token]);

  const filteredProjects = useMemo(
    () => projects.filter((project) => matchesProjectFilters(project, searchTerm, statusFilter, teamFilter)),
    [projects, searchTerm, statusFilter, teamFilter],
  );

  const groupedProjects = useMemo(() => groupProjectsByStatus(filteredProjects), [filteredProjects]);
  const summary = useMemo(() => summarizeProjects(projects), [projects]);
  const statusOptions = useMemo(
    () => Array.from(new Set(projects.map((project) => String(project.status || "").toUpperCase()).filter(Boolean))).sort(),
    [projects],
  );
  const teamOptions = useMemo(
    () => Array.from(new Set(projects.map((project) => project.teamName || project.team).filter(Boolean))).sort(),
    [projects],
  );
  const activeFilters = Boolean(searchTerm.trim() || statusFilter !== "ALL" || teamFilter !== "ALL");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("ALL");
    setTeamFilter("ALL");
  }

  function handleProjectCreated(createdProject) {
    if (!createdProject) return;
    setProjects((currentProjects) => upsertProject(currentProjects, createdProject));
  }

  return (
    <div className="app-shell">
      <Sidebar user={user} />

      <div className="main-column">
        <main className="board-page">
          <div className="board-header-row">
            <div className="board-title-block">
              <h1>Projects</h1>
              <p>{summary.projects} active project(s)</p>
            </div>

            <div className="board-header-actions">
              <button type="button" className="btn-ghost" onClick={toggleTheme}>
                {theme === "light" ? "Dark" : "Light"}
              </button>
              <button type="button" className="btn-ghost" onClick={handleLogout}>
                Logout
              </button>
              <button type="button" className="btn-primary" onClick={() => setDrawerOpen(true)}>
                Create project
              </button>
            </div>
          </div>

          <div className="filter-bar filter-bar-board">
            <label className="filter-field">
              <span>Search</span>
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search projects" />
            </label>
            <label className="filter-field">
              <span>Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-field">
              <span>Team</span>
              <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
                <option value="ALL">All</option>
                {teamOptions.map((team) => (
                  <option key={team} value={team}>
                    {team}
                  </option>
                ))}
              </select>
            </label>
            {activeFilters && (
              <button type="button" className="btn-ghost clear-filters" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          {error && <p className="board-error">{error}</p>}

          {loading ? (
            <p className="board-loading">Loading projects…</p>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state empty-state-board">
              <h2>No matching projects</h2>
              <p>{activeFilters ? "Try clearing the filters or search term." : "Create a project to get started."}</p>
            </div>
          ) : (
            <div className="project-status-board">
              {groupedProjects.map((group) => (
                <section key={group.status} className="kanban-column project-status-column">
                  <div className="column-header">
                    <h2 className="column-title">{group.label}</h2>
                    <span className="column-count">{group.projects.length}</span>
                  </div>
                  <div className="column-body project-status-column-body">
                    {group.projects.map((project) => (
                      <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}

          <SummaryStrip summary={summary} />

          <div className="board-footer-row">
            <p>Tasks are always scoped to their parent project. Open a project card to work on its tasks.</p>
          </div>
        </main>

        <button type="button" className="fab" onClick={() => setDrawerOpen(true)} aria-label="Create project with AI">
          +
        </button>

        <AIDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} onProjectCreated={handleProjectCreated} />
      </div>
    </div>
  );
}
