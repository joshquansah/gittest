import { useEffect, useMemo, useState } from "react";
import { DndContext, DragOverlay, PointerSensor, closestCorners, useSensor, useSensors } from "@dnd-kit/core";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { request } from "../api";
import { BOARD_BASE_URL } from "../config";
import { connectSSE } from "../sse";
import { COLUMNS, STATUSES } from "../constants";
import KanbanColumn from "../components/KanbanColumn";
import TaskCard from "../components/TaskCard";
import TaskDetailPanel from "../components/TaskDetailPanel";
import { useTheme } from "../hooks/useTheme";
import {
  formatDate,
  getInitials,
  getUserAvatarUrl,
  getUserDepartmentName,
  getUserDisplayName,
  normalizeProject,
  normalizeTask,
  replaceTaskInProject,
  summarizeProject,
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

function getEventType(event) {
  return String(event?.type || event?.event || event?.name || event?.action || "").toUpperCase();
}

function applyProjectEvent(currentProject, event, projectId) {
  const eventType = getEventType(event);
  const payloadProject = event?.project || event?.projectData || event?.data?.project;
  if (payloadProject && (eventType.includes("PROJECT") || String(payloadProject.id) === String(projectId))) {
    if (String(payloadProject.id) !== String(projectId)) return currentProject;
    return normalizeProject(payloadProject);
  }

  const taskPayload = event?.task || event?.taskData || event?.data?.task || (event?.id && event?.status ? event : null);
  if (!taskPayload?.id) return currentProject;

  const taskProjectId = taskPayload.projectId ?? taskPayload.project?.id ?? event?.projectId ?? currentProject?.id;
  if (String(taskProjectId) !== String(projectId)) return currentProject;

  return replaceTaskInProject(currentProject, normalizeTask(taskPayload, currentProject || { id: projectId }));
}

function groupTasksByStatus(tasks) {
  return STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((task) => String(task.status).toUpperCase() === status),
  }));
}

function emptyDraft() {
  return {
    title: "",
    description: "",
    status: "TODO",
    dueDate: "",
    priority: "MEDIUM",
    owner: "",
  };
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTask, setActiveTask] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [draft, setDraft] = useState(() => emptyDraft());
  const [savingTask, setSavingTask] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    let active = true;

    async function loadProject() {
      if (!projectId) return;
      setLoading(true);
      try {
        const data = await request("GET", `${BOARD_BASE_URL}/projects/${projectId}`);
        if (active) {
          const nextProject = normalizeProject(data?.project || data);
          setProject(nextProject);
          setError("");
          setSelectedTaskId(null);
          setActiveTask(null);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load project");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProject();

    return () => {
      active = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (!token || !projectId) return undefined;

    return connectSSE(
      `${BOARD_BASE_URL}/updates/stream`,
      token,
      (event) => {
        setProject((currentProject) => applyProjectEvent(currentProject, event, projectId));
      },
      (err) => setError(err.message || "Live updates disconnected"),
    );
  }, [projectId, token]);

  const summary = useMemo(() => summarizeProject(project || {}), [project]);

  const tasksByStatus = useMemo(() => {
    const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
    return groupTasksByStatus(tasks);
  }, [project]);

  const selectedTask = useMemo(
    () => project?.tasks?.find((task) => String(task.id) === String(selectedTaskId)) || null,
    [project, selectedTaskId],
  );

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  function handleTaskSelect(task) {
    setSelectedTaskId(String(task.id));
  }

  async function updateTask(taskId, updates) {
    if (!project) return;
    const snapshot = project;
    const existingTask = project.tasks.find((task) => String(task.id) === String(taskId));
    if (!existingTask) return;

    const optimisticTask = normalizeTask({ ...existingTask, ...updates }, project);
    setProject((currentProject) => replaceTaskInProject(currentProject, optimisticTask));

    try {
      const response = await request("PATCH", `${BOARD_BASE_URL}/projects/${projectId}/tasks/${taskId}`, updates);
      const updatedTask = response?.task || response || optimisticTask;
      setProject((currentProject) => replaceTaskInProject(currentProject, normalizeTask(updatedTask, currentProject || snapshot)));
    } catch (err) {
      setProject(snapshot);
      setError(err.message || "Failed to update task");
    }
  }

  async function handleDragEnd(event) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !project) return;

    const nextStatus = String(over.id || "").toUpperCase();
    if (!STATUSES.includes(nextStatus)) return;

    const currentStatus = String(active.data.current?.status || "").toUpperCase();
    if (currentStatus === nextStatus) return;

    await updateTask(active.id, { status: nextStatus });
  }

  function handleDragStart(event) {
    const task = event.active.data.current?.task;
    if (task) setActiveTask(task);
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    if (!project) return;
    if (!draft.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSavingTask(true);
    setError("");

    try {
      const response = await request("POST", `${BOARD_BASE_URL}/projects/${projectId}/tasks`, {
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: draft.status,
        dueDate: draft.dueDate || undefined,
        priority: draft.priority,
        owner: draft.owner.trim() || undefined,
      });
      const createdTask = response?.task || response;
      if (createdTask) {
        setProject((currentProject) => replaceTaskInProject(currentProject, normalizeTask(createdTask, currentProject || project)));
      }
      setDraft(emptyDraft());
      setShowAddTaskForm(false);
    } catch (err) {
      setError(err.message || "Failed to create task");
    } finally {
      setSavingTask(false);
    }
  }

  const projectTitle = project?.title || project?.name || "Project";
  const projectStats = summary;

  return (
    <div className="app-shell project-detail-shell">
      <Sidebar user={user} />

      <div className="main-column">
        <header className="topbar">
          <div className="board-title-block">
            <p className="detail-eyebrow">Project detail</p>
            <h1>{projectTitle}</h1>
            <p>{project?.teamName || project?.team || "Project workspace"}</p>
          </div>
          <div className="topbar-actions">
            <Link className="btn-ghost" to="/">
              Back to board
            </Link>
            <button type="button" className="btn-ghost" onClick={toggleTheme}>
              {theme === "light" ? "Dark" : "Light"}
            </button>
            <button type="button" className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="project-detail-page">
          {error && <p className="board-error">{error}</p>}

          {loading ? (
            <p className="board-loading">Loading project…</p>
          ) : !project ? (
            <div className="empty-state empty-state-board">
              <h2>Project not found</h2>
              <p>This project may have been removed or you do not have access to it.</p>
            </div>
          ) : (
            <>
              <section className="project-summary-card">
                <div className="project-summary-grid">
                  <div className="profile-field">
                    <span>Status</span>
                    <strong>{project.status}</strong>
                  </div>
                  <div className="profile-field">
                    <span>Owner</span>
                    <strong>{project.ownerName || project.owner || "Unassigned"}</strong>
                  </div>
                  <div className="profile-field">
                    <span>Team</span>
                    <strong>{project.teamName || project.team || "—"}</strong>
                  </div>
                  <div className="profile-field">
                    <span>Due date</span>
                    <strong className={project.dueDate ? "" : ""}>{formatDate(project.dueDate)}</strong>
                  </div>
                  <div className="profile-field">
                    <span>Tasks</span>
                    <strong>{projectStats.taskCount}</strong>
                  </div>
                  <div className="profile-field">
                    <span>Stale</span>
                    <strong>{projectStats.staleCount}</strong>
                  </div>
                </div>
              </section>

              <div className="project-detail-actions">
                <button type="button" className="btn-primary" onClick={() => setShowAddTaskForm((value) => !value)}>
                  {showAddTaskForm ? "Close task form" : "Add task"}
                </button>
              </div>

              {showAddTaskForm && (
                <section className="profile-card add-task-card">
                  <h2>New task</h2>
                  <form className="add-task-form" onSubmit={handleCreateTask}>
                    <input
                      value={draft.title}
                      onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                      placeholder="Task title"
                      disabled={savingTask}
                    />
                    <textarea
                      value={draft.description}
                      onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                      placeholder="Task description"
                      rows={3}
                      disabled={savingTask}
                    />
                    <label>
                      Status
                      <select
                        value={draft.status}
                        onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value }))}
                        disabled={savingTask}
                      >
                        {COLUMNS.map(({ status, label }) => (
                          <option key={status} value={status}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Priority
                      <select
                        value={draft.priority}
                        onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))}
                        disabled={savingTask}
                      >
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </label>
                    <label>
                      Due date
                      <input
                        type="date"
                        value={draft.dueDate}
                        onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
                        disabled={savingTask}
                      />
                    </label>
                    <label>
                      Owner
                      <input
                        value={draft.owner}
                        onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))}
                        placeholder="Optional owner"
                        disabled={savingTask}
                      />
                    </label>
                    <button type="submit" className="btn-primary" disabled={savingTask || !draft.title.trim()}>
                      {savingTask ? "Creating…" : "Create task"}
                    </button>
                  </form>
                </section>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="project-detail-board">
                  {tasksByStatus.map(({ status, tasks: statusTasks }) => (
                    <KanbanColumn
                      key={status}
                      status={status}
                      label={COLUMNS.find((column) => column.status === status)?.label || status}
                      tasks={statusTasks}
                      droppableId={status}
                      projectId={project.id}
                      onSelectTask={handleTaskSelect}
                    />
                  ))}
                </div>

                <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
              </DndContext>
            </>
          )}
        </main>

        {selectedTask && <TaskDetailPanel task={selectedTask} project={project} onClose={() => setSelectedTaskId(null)} onUpdate={(updates) => updateTask(selectedTask.id, updates)} />}
      </div>
    </div>
  );
}