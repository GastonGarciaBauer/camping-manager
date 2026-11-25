import { useEffect, useState } from "react";

export function TaskModal({ isOpen, onClose, onAddTask, onShowToast }) {
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("");
  const [priority, setPriority] = useState("Media");

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanSector = sector.trim() || "Sector común";

    if (!cleanTitle) {
      if (onShowToast) {
        onShowToast("Escribí el nombre de la tarea.");
      }
      return;
    }

    onAddTask({
      title: cleanTitle,
      sector: cleanSector,
      priority,
    });

    setTitle("");
    setSector("");
    setPriority("Media");
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modal task-modal-card">
        <button
          type="button"
          className="modal-close"
          aria-label="Cerrar modal"
          onClick={onClose}
        >
          ×
        </button>

        <h2 id="task-modal-title">Nueva tarea</h2>

        <form onSubmit={handleSubmit}>
          <label>
            <span>Tarea</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Revisar iluminación"
              required
            />
          </label>

          <label>
            <span>Sector o alojamiento</span>
            <input
              type="text"
              value={sector}
              onChange={(event) => setSector(event.target.value)}
              placeholder="P07 o sector común"
            />
          </label>

          <label>
            <span>Prioridad</span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
          </label>

          <p className="task-modal-note">
            Datos de ejemplo · se guarda en este navegador.
          </p>

          <button type="submit" className="primary-button task-modal-submit">
            <span>✓ Guardar tarea</span>
          </button>
        </form>
      </div>
    </div>
  );
}