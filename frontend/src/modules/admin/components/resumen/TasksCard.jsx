export function TasksCard({ tasks, onToggleTask, onNavigateTasks }) {
  const remaining = tasks.filter((task) => !task.done).length;

  return (
    <article className="panel tasks-panel">
      <div className="panel-heading">
        <div>
          <h2>Por resolver</h2>
          <p>{remaining === 1 ? "1 tarea pendiente" : `${remaining} tareas pendientes`}</p>
        </div>
        <span className="tasks-header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M9 4V3h6v1M9 10h6M9 14h6M9 18h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      <ul className="task-list">
        {tasks.map((task) => {
          const zoneLabel = task.zone || task.sector || "Sector común";
          const level = (
            task.priorityLevel ||
            task.priority ||
            "media"
          ).toLowerCase();

          return (
            <li className="task-item" key={task.id}>
              <label className="task-check">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => onToggleTask(task.id)}
                />
                <span className="checkmark" />
                <span className="task-body">
                  <strong>{task.title}</strong>
                  <span className="task-meta">
                    <span>{zoneLabel}</span>
                    <span className={`priority-badge priority-${level}`}>
                      {task.priority}
                    </span>
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <button
        className="availability-link"
        type="button"
        onClick={onNavigateTasks}
      >
        Gestionar tareas <span>↗</span>
      </button>
    </article>
  );
}