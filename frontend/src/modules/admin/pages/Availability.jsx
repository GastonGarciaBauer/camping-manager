function AccommodationIcon() {
  return (
    
    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="14" cy="8" r="3.2" stroke="currentColor" strokeWidth="3" />
          <path
            d="M5 39 L18 20 H34 L47 39 H5Z"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 20 L17 39 M18 20 L28 39"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M39 20 V3 M33.5 8.5 L39 3 L44.5 8.5 M33.5 14.5 L39 9 L44.5 14.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
    </svg>
  );
}

const STATUS_CLASS = {
  Ocupada: "is-occupied",
  Disponible: "is-available",
  Mantenimiento: "is-maintenance",
};

export function Availability({ items, onShowToast }) {
  const availableCount = items.filter((item) => item.status === "Disponible").length;
  const occupiedCount = items.filter((item) => item.status === "Ocupada").length;
  const maintenanceCount = items.filter(
    (item) => item.status === "Mantenimiento"
  ).length;

  const handleCardClick = (item) => {
    if (onShowToast) {
      onShowToast(`${item.name}: ${item.status}.`);
    }
  };

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

      <section className="availability-section" aria-label="Estado de los alojamientos">
        <div className="availability-header">
          <h2>Estado de los alojamientos</h2>
          <p className="availability-summary">
            {availableCount} disponibles · {occupiedCount} ocupados · {maintenanceCount} en
            mantenimiento. Estado operativo actual, no calendario futuro.
          </p>
        </div>

        <div className="availability-grid">
          {items.map((item) => {
            const stateClass = STATUS_CLASS[item.status] || "is-available";
            return (
              <article
                key={item.id}
                className={`unit-card ${stateClass}`}
                onClick={() => handleCardClick(item)}
              >
                <div className="unit-card__icon">
                  <AccommodationIcon />
                </div>

                <h3 className="unit-card__title">{item.name}</h3>
                <span className="unit-card__status">{item.status}</span>

                {item.status === "Ocupada" ? (
                  <div className="unit-card__meta">
                    <strong>{item.guest}</strong>
                    <span>{item.checkout}</span>
                  </div>
                ) : (
                  <div className="unit-card__meta">
                    <span>{item.note}</span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <footer className="dashboard-footer">
        <span>Tierra Adentro · Administración</span>
        <span>Datos ilustrativos de demostración</span>
      </footer>
    </>
  );
}