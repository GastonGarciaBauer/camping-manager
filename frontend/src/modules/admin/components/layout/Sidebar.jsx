const NAV_ITEMS = [
  { id: "Resumen", label: "Resumen" },
  { id: "Reservas", label: "Reservas" },
  { id: "Disponibilidad", label: "Disponibilidad" },
  { id: "Cobros", label: "Cobros" },
  { id: "Tareas", label: "Tareas" },
];

function NavIcon({ section }) {
  switch (section) {
    case "Resumen":
      return (
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      );
    case "Reservas":
      return (
        <svg viewBox="0 0 22 22" fill="none">
          <path d="M3 20 12 5l9 15H3Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 5v15M3 20l9-8 9 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Disponibilidad":
      return (
        <svg viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
          <path d="M16 2v4M8 2v4M3 9h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="m8 14 2 2 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Cobros":
      return (
        <svg viewBox="0 0 22 22" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M15 8.5c-.7-.8-1.7-1.2-3-1.2-1.7 0-3 .9-3 2.2s1.3 2 3 2.4 3 1 3 2.4-1.3 2.2-3 2.2c-1.3 0-2.4-.5-3.1-1.3M12 5v14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 23 23" fill="none">
          <path d="M9 6h11M9 12h11M9 18h11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <path d="m3 6 1.5 1.5L7 5M3 12l1.5 1.5L7 11M3 18l1.5 1.5L7 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function Sidebar({
  activeSection,
  onSelectSection,
  pendingTasksCount,
  isOpen,
  onCloseMobile,
  onShowToast,
}) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} id="sidebar">
      <a
        className="brand"
        href="#"
        aria-label="Tierra Adentro, panel principal"
        onClick={(event) => {
          event.preventDefault();
          onSelectSection("Resumen", false);
          onCloseMobile();
        }}
      >
        <svg className="brand-mark" viewBox="0 0 48 48" fill="none" aria-hidden="true">
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
        <span className="brand-copy">
          <strong>Tierra Adentro</strong>
          <small>CAMPING &amp; NATURALEZA</small>
        </span>
      </a>

      <div className="side-label">ADMINISTRACIÓN</div>

      <nav className="side-nav" aria-label="Menú de administración">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`side-link ${isActive ? "active" : ""}`}
              onClick={() => {
                onSelectSection(item.id);
                onCloseMobile();
              }}
            >
              <span className="nav-icon">
                <NavIcon section={item.id} />
              </span>
              <span>{item.label}</span>
              {item.id === "Tareas" && (
                <span className="task-count">{pendingTasksCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-promo">
        <svg viewBox="0 0 50 50" fill="none" aria-hidden="true">
          <path d="M23 47V34" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path
            d="M23 35c-5.5 0-9.5-3.8-9.5-8.8 0-4.2 3-7.7 7-8.5 1.3-2.5 4-4.2 7-4.2 3.6 0 6.7 2.4 7.6 5.7"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M40 47v-5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
          <path
            d="M40 12 28 28h7l-6 14h22l-6-14h7L40 12Z"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
        </svg>
        <h2>
          Más naturaleza.<br />Menos pendientes.
        </h2>
        <p>Todo tu camping, en un solo lugar.</p>
      </div>

      <div className="sidebar-bottom">
        <button
          className="help-link"
          type="button"
          onClick={() => onShowToast("Panel de ayuda de Tierra Adentro.")}
        >
          <span>ⓘ</span> Ayuda y detalles
        </button>
        <div className="profile">
          <div className="profile-avatar">TA</div>
          <div>
            <strong>Administración</strong>
            <small>Tierra Adentro</small>
          </div>
        </div>
      </div>
    </aside>
  );
}