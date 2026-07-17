import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";

function SortableTask({ task, projectId, onSelect }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task, status: task.status, projectId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onClick={() => onSelect?.(task)} />
    </div>
  );
}

export default function KanbanColumn({ status, label, tasks, droppableId, projectId, onSelectTask }) {
  const { setNodeRef, isOver } = useDroppable({ id: droppableId || status });

  return (
    <div className={`kanban-column ${isOver ? "kanban-column-over" : ""}`}>
      <div className="column-header">
        <h2 className="column-title">{label}</h2>
        <span className="column-count">{tasks.length}</span>
      </div>
      <div ref={setNodeRef} className="column-body">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask
              key={task.id}
              task={task}
              projectId={projectId}
              onSelect={onSelectTask}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
