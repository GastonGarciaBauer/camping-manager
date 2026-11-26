import { useEffect, useState } from "react";

const PERIOD_OPTIONS = [
  { key: "7d", label: "Últimos 7 días" },
  { key: "30d", label: "Últimos 30 días" },
  { key: "month", label: "Este mes" },
];

function formatMoney(amount) {
  return `$ ${Number(amount || 0).toLocaleString("es-AR")}`;
}

export function IncomeChart({ chartData, period, onChangePeriod, onShowToast }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest("#periodMenu, #periodButton")) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [menuOpen]);

  const currentOption =
    PERIOD_OPTIONS.find((opt) => opt.key === period) || PERIOD_OPTIONS[0];

  const days = Array.isArray(chartData?.days) ? chartData.days : [];
  const total = Number(chartData?.total || 0);
  const maxAmount = Math.max(...days.map((d) => Number(d.amount || 0)), 1);

  // Para que en 30d o "Este mes" las barras no se aprieten demasiado, mostramos hasta los últimos 14 días si hay muchos
  const visibleBars = days.length > 14 ? days.slice(-14) : days;

  const handleSelectPeriod = (option) => {
    setMenuOpen(false);
    if (onChangePeriod) {
      onChangePeriod(option.key);
    }
    if (onShowToast) {
      onShowToast(`Período seleccionado: ${option.label}.`);
    }
  };

  return (
    <article className="panel income-panel">
      <div className="panel-heading">
        <div>
          <h2>Ingresos del camping</h2>
          <p>Cobros aprobados · {chartData?.label || currentOption.label}</p>
        </div>
        <button
          className="period-button"
          id="periodButton"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {currentOption.label} <span>⌄</span>
        </button>

        {menuOpen && (
          <div className="period-menu" id="periodMenu">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelectPeriod(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="income-total">
        {formatMoney(total)} <small>ARS ·</small>
      </div>

      <div className="chart-wrap">
        <div className="y-labels">
          <span>{formatMoney(maxAmount)}</span>
          <span>{formatMoney(Math.round(maxAmount * 0.66))}</span>
          <span>{formatMoney(Math.round(maxAmount * 0.33))}</span>
          <span>$ 0</span>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label="Gráfico de ingresos diarios del período seleccionado"
        >
          <div className="grid-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
          {visibleBars.map((bar) => {
            const pct =
              Number(bar.amount || 0) > 0
                ? Math.max(6, Math.round((Number(bar.amount) / maxAmount) * 100))
                : 0;

            return (
              <div className="bar-item" key={bar.date}>
                <div
                  className={`bar ${bar.is_today ? "bar-today" : ""}`}
                  style={{ height: `${pct}%` }}
                  title={`${bar.label}: ${formatMoney(bar.amount)}`}
                />
                <span>{bar.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}