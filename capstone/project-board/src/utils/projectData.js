import { STATUSES } from "../constants";

function toStringId(value) {
  if (value == null) return null;
  return String(value);
}

function defaultTaskStatus(task) {
  return STATUSES.includes(task?.status) ? task.status : "TODO";
}

function defaultProjectStatus(project) {
  return String(project?.status || "PLANNED").toUpperCase();
}

export function formatLabel(value) {
  return String(value || "Unspecified")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/(^|\s)\w/g, (match) => match.toUpperCase());
}

export function getInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function getUserDisplayName(user) {
  return user?.username || "User";
}

export function getUserTeamName(user) {
  return user?.team?.name || "Team member";
}

export function getUserDepartmentName(user) {
  return (
    user?.team?.department ||
    "—"
  );
}

export function getUserEmail(user) {
  return user?.email || "—";
}

export function getUserAvatarUrl(user) {
  return user?.photoUrl || null;
}

export function normalizeTask(task = {}, project = {}) {
  const projectId = toStringId(project.id);
  const projectTitle =  project.title || "Untitled project";

  return {
    ...task,
    id: task.id,
    projectId,
    projectTitle,
    projectName: projectTitle,
    status: defaultTaskStatus(task),
    ownerId: task.owner?.id ?? null,
    ownerName: task.owner?.name ||  null,
    teamId: task.team?.id ?? null,
    teamName: project.team?.name || null,
  };
}

export function normalizeProject(project = {}) {
  const id = toStringId(project.id);
  const title = project.title || "Untitled project";
  const tasks = Array.isArray(project.tasks) ? project.tasks.map((task) => normalizeTask(task, { ...project, id, title })) : [];

  return {
    ...project,
    id,
    title,
    name: title,
    status: defaultProjectStatus(project),
    ownerName: project.owner?.username || null,
    ownerId: project.owner?.id ?? null,
    teamName: project.team?.name || null,
    teamId: project.team?.id ?? null,
    dueDate: project.dueDate || null,
    tasks,
  };
}

export function normalizeProjectsResponse(response) {
  if (Array.isArray(response)) {
    return response.map((project) => normalizeProject(project));
  }

  if (response?.projects && Array.isArray(response.projects)) {
    return response.projects.map((project) => normalizeProject(project));
  }

  return [];
}

export function upsertTask(tasks, updatedTask) {
  const exists = tasks.find((task) => String(task.id) === String(updatedTask.id));
  return exists
    ? tasks.map((task) => (String(task.id) === String(updatedTask.id) ? updatedTask : task))
    : [...tasks, updatedTask];
}

export function replaceTaskInProject(project, updatedTask) {
  if (!project) return project;
  const nextTask = normalizeTask(updatedTask, project);
  const remaining = project.tasks.filter((task) => String(task.id) !== String(nextTask.id));
  return {
    ...project,
    tasks: upsertTask(remaining, nextTask),
  };
}

export function upsertProject(projects, updatedProject) {
  const nextProject = normalizeProject(updatedProject);
  const exists = projects.find((project) => String(project.id) === String(nextProject.id));
  return exists
    ? projects.map((project) => (String(project.id) === String(nextProject.id) ? { ...project, ...nextProject } : project))
    : [...projects, nextProject];
}

export function getTaskOwnerName(task) {
  return task?.owner?.name || "Unassigned";
}

export function getTaskTeamName(task, project) {
  return project?.team?.name || "—";
}

export function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return includeTime
    ? date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : date.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function isOverdueTask(task) {
  if (!task?.dueDate) return false;
  if (String(task.status).toUpperCase() === "DONE") return false;
  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
}

export function summarizeProject(project) {
  const tasks = Array.isArray(project?.tasks) ? project.tasks : [];
  const taskCount = tasks.length;
  const staleCount = tasks.filter((task) => task.isStale).length;
  const overdueCount = tasks.filter((task) => isOverdueTask(task)).length;

  return {
    taskCount,
    staleCount,
    overdueCount,
  };
}

export function summarizeProjects(projects) {
  return projects.reduce(
    (summary, project) => {
      const projectSummary = summarizeProject(project);
      summary.projects += 1;
      summary.tasks += projectSummary.taskCount;
      summary.stale += projectSummary.staleCount;
      summary.overdue += projectSummary.overdueCount;
      return summary;
    },
    { projects: 0, tasks: 0, stale: 0, overdue: 0 },
  );
}

export function groupProjectsByStatus(projects) {
  const grouped = new Map();

  for (const project of projects) {
    const status = project.status || "PLANNED";
    if (!grouped.has(status)) grouped.set(status, []);
    grouped.get(status).push(project);
  }

  return Array.from(grouped.entries()).map(([status, statusProjects]) => ({
    status,
    label: formatLabel(status),
    projects: statusProjects,
  }));
}

export function projectMatchesSearch(project, searchTerm) {
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();
  if (!normalizedSearch) return true;

  return [
    project.title,
    project.name,
    project.ownerName,
    project.teamName,
    project.status,
    project.dueDate,
  ].some((value) => String(value || "").toLowerCase().includes(normalizedSearch));
}