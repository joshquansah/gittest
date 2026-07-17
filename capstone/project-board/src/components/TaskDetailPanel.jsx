import { useEffect } from "react";
import { COLUMNS } from "../constants";
import { formatDate, getTaskOwnerName, getTaskTeamName, isOverdueTask } from "../utils/projectData";

function buildAuditTrail(task) {
  if (Array.isArray(task.auditTrail) && task.auditTrail.length > 0) {
    return task.auditTrail;
  }

  const trail = [];
  if (task.createdAt) {
    trail.push({ label: "Created", actor: task.createdByName || task.createdBy || "System", at: task.createdAt });
  }
  if (task.updatedAt) {
    trail.push({ label: "Updated", actor: task.updatedByName || task.updatedBy || "System", at: task.updatedAt });
  }
  return trail;
}

export default function TaskDetailPanel({ task, project, onClose, onUpdate }) {
  const auditTrail = buildAuditTrail(task);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="detail-overlay" onMouseDown={onClose}>
      <aside className="detail-panel task-detail-panel" role="dialog" aria-modal="true" aria-label="Task details" onMouseDown={(event) => event.stopPropagation()}>
        <div className="detail-panel-header">
          <div>
            <p className="detail-eyebrow">Task details</p>
            <h2>{task.title}</h2>
            <p className="task-detail-project">{project?.title || project?.name || task.projectName || "Project"}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close task details">
            ×
          </button>
        </div>

        <div className="detail-section">
          <label className="detail-field">
            <span>Status</span>
            <select value={task.status} onChange={(event) => onUpdate({ status: event.target.value })}>
              {COLUMNS.map(({ status, label }) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="detail-grid">
            <div className="detail-field">
              <span>Owner</span>
              <strong>{getTaskOwnerName(task)}</strong>
            </div>
            <div className="detail-field">
              <span>Team</span>
              <strong>{getTaskTeamName(task, project)}</strong>
            </div>
            <div className="detail-field">
              <span>Due date</span>
              <strong className={isOverdueTask(task) ? "is-overdue" : ""}>{formatDate(task.dueDate)}</strong>
            </div>
            <div className="detail-field">
              <span>Priority</span>
              <strong>{task.priority || "—"}</strong>
            </div>
          </div>

          <div className="detail-field detail-description">
            <span>Description</span>
            <p>{task.description || "No description provided."}</p>
          </div>

          <div className="detail-field">
            <span>Audit trail</span>
            <ul className="audit-trail">
              {auditTrail.length === 0 ? (
                <li>No audit history available.</li>
              ) : (
                auditTrail.map((entry, index) => (
                  <li key={`${entry.label}-${index}`}>
                    <strong>{entry.label}</strong>
                    <span>
                      {entry.actor || "System"} · {formatDate(entry.at, true)}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}