import { useEffect, useState } from "react";
import { INCOME_PERIODS } from "../../data/mockResumen";

const PERIOD_OPTIONS = Object.keys(INCOME_PERIODS);

export function IncomeChart({ onShowToast }) {
  const [selectedPeriod, setSelectedPeriod] = useState("Últimos 7 días");
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

  const currentData = INCOME_PERIODS[selectedPeriod];

  const handleSelectPeriod = (period) => {
    setSelectedPeriod(period);
    setMenuOpen(false);
    onShowToast(`Período seleccionado: ${period}. Datos ilustrativos.`);
  };

  return (
    <article className="panel income-panel">
      <div className="panel-heading">
        <div>
          <h2>Ingresos del camping</h2>
          <p>Cobros registrados en los últimos 7 días</p>
        </div>
        <button
          className="period-button"
          id="periodButton"
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {selectedPeriod} <span>⌄</span>
        </button>

        {menuOpen && (
          <div className="period-menu" id="periodMenu">
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => handleSelectPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="income-total">
        {currentData.total} <small>ARS ·</small>
      </div>

      <div className="chart-wrap">
        <div className="y-labels">
          <span>$ 600 mil</span>
          <span>$ 400 mil</span>
          <span>$ 200 mil</span>
          <span>$ 0</span>
        </div>
        <div
          className="bar-chart"
          role="img"
          aria-label="Gráfico de ingresos: domingo, lunes y martes casi sin ingresos; miércoles 100 mil, jueves 230 mil, viernes 150 mil y sábado 570 mil pesos."
        >
          <div className="grid-lines">
            <i />
            <i />
            <i />
            <i />
          </div>
          {currentData.bars.map((bar) => (
            <div className="bar-item" key={bar.day}>
              <div
                className={`bar ${bar.isToday ? "bar-today" : ""}`}
                style={{ height: `${bar.height}%` }}
              />
              <span>{bar.day}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}