import { useState } from "react";

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "llegadas", label: "Llegadas" },
  { id: "salidas", label: "Salidas" },
  { id: "alojados", label: "Alojados" },
];

export function MovementsTable({
  movements,
  onUpdateMovement,
  onNavigateReservations,
  onShowToast,
}) {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filteredMovements = movements.filter((item) => {
    const matchesTab = filter === "todos" || item.categories.includes(filter);
    const matchesSearch =
      !query ||
      item.guest.toLowerCase().includes(query) ||
      item.stay.toLowerCase().includes(query) ||
      item.code.toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const handleActionClick = (item) => {
    if (item.action === "checkin") {
      onUpdateMovement(item.id, {
        status: "Alojada",
        statusType: "hosted",
        categories: ["alojados"],
        action: "checkout",
      });
      onShowToast(`Check-in registrado para ${item.guest}.`);
    } else if (item.action === "checkout") {
      onUpdateMovement(item.id, {
        status: "Finalizada",
        statusType: "done",
        categories: ["salidas"],
        action: "done",
      });
      onShowToast(`Check-out registrado para ${item.guest}.`);
    }
  };

  return (
    <article className="panel movements-panel">
      <div className="panel-heading">
        <div>
          <h2>Movimientos del día</h2>
          <p>Llegadas, salidas y huéspedes alojados</p>
        </div>
        <button
          className="export-button"
          type="button"
          onClick={() =>
            onShowToast("Exportando movimientos del día (CSV de demostración)...")
          }
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Exportar</span>
        </button>
      </div>

      <div className="movements-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Filtrar movimientos">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${filter === tab.id ? "active" : ""}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="search-box">
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar huésped..."
          />
        </label>
      </div>

      <div className="movements-table-wrap">
        <table className="movements-table">
          <thead>
            <tr>
              <th>HUÉSPED</th>
              <th>ALOJAMIENTO</th>
              <th>ESTADO</th>
              <th>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovements.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="guest-cell">
                    <span className="guest-avatar">{item.initials}</span>
                    <div>
                      <strong>{item.guest}</strong>
                      <small>{item.code}</small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="stay-cell">
                    <strong>{item.stay}</strong>
                    <small>{item.dates}</small>
                  </div>
                </td>
                <td>
                  <span className={`status-badge badge-${item.statusType}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="action-btn"
                    disabled={item.action === "done"}
                    onClick={() => handleActionClick(item)}
                  >
                    {item.action === "checkin" && (
                      <>
                        <span>Check-in</span>
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                    {item.action === "checkout" && (
                      <>
                        <span>Check-out</span>
                        <svg viewBox="0 0 24 24" fill="none">
                          <path
                            d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </>
                    )}
                    {item.action === "done" && <span>Completado</span>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMovements.length === 0 && (
          <p className="empty-movements">
            No se encontraron huéspedes para este filtro.
          </p>
        )}
      </div>

      <div className="panel-footer">
        <span>
          {filteredMovements.length}{" "}
          {filteredMovements.length === 1 ? "registro de hoy" : "registros de hoy"}
        </span>
        <button
          className="text-link-btn"
          type="button"
          onClick={onNavigateReservations}
        >
          Ver todas las reservas <span>›</span>
        </button>
      </div>
    </article>
  );
}