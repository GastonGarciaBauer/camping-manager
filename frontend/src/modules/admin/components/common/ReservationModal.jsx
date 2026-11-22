import { useEffect, useState } from "react";

const EMPTY_FORM = {
  guest: "",
  arrival: "",
  departure: "",
  guests: 2,
  stay: "Parcela",
};

export function ReservationModal({ isOpen, onClose, onShowToast }) {
  const [form, setForm] = useState(EMPTY_FORM);

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

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onClose();
    setForm(EMPTY_FORM);
    onShowToast("Formulario de ejemplo completado. No se guardaron datos.");
  };

  return (
    <div
      className="modal-backdrop"
      id="modalBackdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <button
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <p className="overline">TIERRA ADENTRO · ADMINISTRACIÓN</p>
        <h2 id="modalTitle">Nueva reserva</h2>
        <p className="modal-description">
          Cargá los datos principales para registrar una reserva.
        </p>
        <form onSubmit={handleSubmit}>
          <label>
            Nombre y apellido
            <input
              required
              name="guest"
              value={form.guest}
              onChange={handleChange}
              placeholder="Ej. Martina Pérez"
            />
          </label>
          <div className="form-row">
            <label>
              Fecha de llegada
              <input
                required
                type="date"
                name="arrival"
                value={form.arrival}
                onChange={handleChange}
              />
            </label>
            <label>
              Fecha de salida
              <input
                required
                type="date"
                name="departure"
                value={form.departure}
                onChange={handleChange}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Personas
              <input
                required
                type="number"
                min="1"
                name="guests"
                value={form.guests}
                onChange={handleChange}
              />
            </label>
            <label>
              Alojamiento
              <select name="stay" value={form.stay} onChange={handleChange}>
                <option value="Parcela">Parcela</option>
                <option value="Cabaña">Cabaña</option>
              </select>
            </label>
          </div>
          <button className="primary-button form-submit" type="submit">
            Guardar reserva
          </button>
        </form>
        <p className="form-note">
          Demo visual: el formulario no guarda datos en una base de datos.
        </p>
      </section>
    </div>
  );
}