export function OccupancyCard({ onNavigateAvailability }) {
  return (
    <article className="panel occupancy-panel">
      <div className="panel-heading">
        <div>
          <h2>Ocupación actual</h2>
          <p>Parcelas y cabañas</p>
        </div>
        <span className="occupancy-icon">♧</span>
      </div>

      <div className="occupancy-content">
        <div className="donut" role="img" aria-label="31 por ciento de ocupación">
          <div>
            <strong>
              31<small>%</small>
            </strong>
            <span>ocupación</span>
          </div>
        </div>

        <div className="legend">
          <div>
            <i className="legend-dot occupied" />
            <span>Ocupados</span>
            <b>5</b>
          </div>
          <div>
            <i className="legend-dot available" />
            <span>Disponibles</span>
            <b>10</b>
          </div>
          <div>
            <i className="legend-dot maintenance" />
            <span>Mantenimiento</span>
            <b>1</b>
          </div>
        </div>
      </div>

      <button
        className="availability-link"
        type="button"
        onClick={onNavigateAvailability}
      >
        Ver disponibilidad <span>↗</span>
      </button>
    </article>
  );
}