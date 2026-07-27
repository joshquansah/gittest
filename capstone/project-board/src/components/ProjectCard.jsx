import { Link } from "react-router-dom";
import { formatDate, formatLabel, summarizeProject } from "../utils/projectData";

export default function ProjectCard({ project, onClick }) {
  const summary = summarizeProject(project);
  const title = project.title || "Untitled project";

  function handleKeyDown(event) {
    if (!onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <article
      className="project-card"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      <div className="project-card-header">
        <div>
          <h3>{title}</h3>
          <p>{project.owner?.username || "Unassigned"}</p>
        </div>
        <span className="status-badge status-project">{formatLabel(project.status)}</span>
      </div>

      <div className="project-card-meta">
        <div>
          <span>Team</span>
          <strong>{project.team?.name || "—"}</strong>
        </div>
        <div>
          <span>Due date</span>
          <strong>{formatDate(project.dueDate)}</strong>
        </div>
      </div>

      <div className="project-card-stats">
        <div>
          <span>Tasks</span>
          <strong>{summary.taskCount}</strong>
        </div>
        <div>
          <span>Stale</span>
          <strong className={summary.staleCount > 0 ? "is-stale" : ""}>{summary.staleCount}</strong>
        </div>
        <div>
          <span>Overdue</span>
          <strong className={summary.overdueCount > 0 ? "is-overdue" : ""}>{summary.overdueCount}</strong>
        </div>
      </div>

      {project.description && <p className="project-card-description">{project.description}</p>}

      <Link className="project-card-link" to={`/projects/${project.id}`} aria-hidden="true" tabIndex={-1}>
        Open project
      </Link>
    </article>
  );
}