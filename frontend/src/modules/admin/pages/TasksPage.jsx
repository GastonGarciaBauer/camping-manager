export function TasksPage({
  tasks,
  isLiveData,
  onToggleTask,
  onOpenNewTask,
  onShowToast,
}) {
  const list = Array.isArray(tasks) ? tasks : [];

  return (
    <>
      <div className="date-row">
        <div className="date-display">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect
              x="3.5"
              y="5"
              width="17"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M7.5 3v4M16.5 3v4M4 9h16M8 13h2M13 13h2M8 17h2"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <span>Sábado, 21 de noviembre de 2026</span>
          <span className="today-pill">Hoy</span>
        </div>
      </div>

      <article className="panel tasks-page-panel">
        <div className="tasks-page-header">
          <div>
            <h2>Limpieza y mantenimiento</h2>
            <p>Completa una tarea para actualizar su estado.</p>
          </div>

          <button
            type="button"
            className="add-task-inline-btn"
            onClick={() => {
              if (onOpenNewTask) {
                onOpenNewTask();
              } else if (onShowToast) {
                onShowToast("Nueva tarea abierta.");
              }
            }}
          >
            <span>+ Agregar tarea</span>
          </button>
        </div>

        <ul className="tasks-page-list">
          {list.map((task) => {
            const isDone = Boolean(task.done);
            return (
              <li
                key={task.id}
                className={`tasks-page-item ${isDone ? "is-completed" : ""}`}
              >
                <label className="tasks-page-check">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => onToggleTask(task.id)}
                  />
                  <span className="tasks-page-box" aria-hidden="true">
                    {isDone && (
                      <svg viewBox="0 0 14 14" fill="none">
                        <path
                          d="M2.5 7.2 5.5 10.2 11.5 3.8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>

                  <div className="tasks-page-info">
                    <strong className="tasks-page-title">{task.title}</strong>
                    <span className="tasks-page-sub">
                      {task.sector || task.zone || "Sector común"} · Prioridad{" "}
                      {task.priority || "Media"}
                    </span>
                  </div>
                </label>

                <span
                  className={`task-status-pill ${
                    isDone ? "is-done" : "is-pending"
                  }`}
                >
                  {isDone ? "Completada" : "Pendiente"}
                </span>
              </li>
            );
          })}
        </ul>

        {list.length === 0 && (
          <p className="empty-movements">No hay tareas cargadas para hoy.</p>
        )}
      </article>

      <footer className="dashboard-footer">
        <span>Tierra Adentro · Administración</span>
        <span>
          {isLiveData
            ? "Conectado a MySQL · camping_manager"
            : "Demo interactiva · Sin conexión a datos reales"}
        </span>
      </footer>
    </>
  );
}