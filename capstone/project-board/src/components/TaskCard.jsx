export default function TaskCard({ task, onClick, className = "" }) {
  const ownerName =
    task.ownerName || task.owner?.name || task.owner || null;
  const due = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString()
    : null;

  return (
    <div
      className={`task-card ${className}`.trim()}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        {task.isStale && (
          <span className="staleness-dot" title="Stale" aria-label="Stale" />
        )}
      </div>
      <div className="task-meta">
        {ownerName && <span>{ownerName}</span>}
        {due && <span>{due}</span>}
      </div>
      {task.priority && (
        <span
          className={`priority-badge priority-${String(task.priority).toLowerCase()}`}
        >
          {task.priority}
        </span>
      )}
    </div>
  );
}
