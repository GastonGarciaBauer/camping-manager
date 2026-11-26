import { useState } from "react";

const TABS = [
  { id: "todos", label: "Todos" },
  { id: "llegadas", label: "Llegadas" },
  { id: "salidas", label: "Salidas" },
  { id: "alojados", label: "Alojados" },
];

function formatCurrency(amount) {
  return `$ ${Number(amount || 0).toLocaleString("es-AR")}`;
}

export function Incomings({
  payments,
  isLiveData,
  onCollectPayment,
  onShowToast,
}) {
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const pendingPayments = (Array.isArray(payments) ? payments : []).filter(
    (item) => !item.paid
  );
  const totalBalance = pendingPayments.reduce(
    (acc, item) => acc + Number(item.balance || 0),
    0
  );

  const filteredPayments = pendingPayments.filter((item) => {
    const categories = Array.isArray(item.categories)
      ? item.categories
      : ["todos"];
    const matchesTab = filter === "todos" || categories.includes(filter);
    const matchesSearch =
      !query ||
      (item.guest || "").toLowerCase().includes(query) ||
      (item.stay || "").toLowerCase().includes(query) ||
      (item.code || "").toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const handleCollectClick = (item) => {
    onCollectPayment(item.id, item.balance);
    if (onShowToast) {
      onShowToast(
        `Saldo cobrado a ${item.guest} (${formatCurrency(item.balance)}).`
      );
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

      <article className="panel movements-panel reservation-full-panel">
        <div className="panel-heading">
          <div>
            <h2>Cobros pendientes</h2>
            <p className="payments-total-sub">
              Saldo total: {formatCurrency(totalBalance)}
            </p>
          </div>

          <button
            className="export-button"
            type="button"
            onClick={() =>
              onShowToast &&
              onShowToast("Exportando cobros pendientes (CSV de demostración)...")
            }
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
          <div className="filter-tabs" role="tablist" aria-label="Filtrar cobros">
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
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
              <path
                d="m20 20-3.5-3.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
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
                <th>SALDO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="guest-cell">
                      <span className="guest-avatar">{item.initials}</span>
                      <div>
                        <strong>{item.guest}</strong>
                        <small>
                          {item.code} · {item.guestsCount}{" "}
                          {item.guestsCount === 1 ? "huésped" : "huéspedes"}
                        </small>
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
                    <span className="payment-balance">
                      {formatCurrency(item.balance)}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="action-btn collect-btn"
                      onClick={() => handleCollectClick(item)}
                    >
                      <span>Cobrar saldo</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPayments.length === 0 && (
            <p className="empty-movements">
              No hay cobros pendientes para este filtro.
            </p>
          )}
        </div>

        <div className="panel-footer">
          <span>
            {isLiveData
              ? "Sincronizado con MySQL · camping_manager"
              : "Cambios guardados en este navegador"}
          </span>
        </div>
      </article>

      <footer className="dashboard-footer">
        <span>Tierra Adentro · Administración</span>
        <span>
          {isLiveData
            ? "Conectado a MySQL · camping_manager"
            : "Datos ilustrativos de demostración"}
        </span>
      </footer>
    </>
  );
}