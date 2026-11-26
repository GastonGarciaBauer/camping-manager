export function OccupancyCard({ occupancy, onNavigateAvailability }) {
  const occupied = Number(occupancy?.occupied || 0);
  const available = Number(occupancy?.available || 0);
  const maintenance = Number(occupancy?.maintenance || 0);
  const total = Math.max(occupied + available + maintenance, 1);

  const pct =
    occupancy?.occupancy_pct !== undefined
      ? Number(occupancy.occupancy_pct)
      : Math.round((occupied / total) * 100);

  const occupiedDeg = Math.round((occupied / total) * 360);
  const maintenanceDeg = Math.round((maintenance / total) * 360);

  const donutStyle = {
    background: `conic-gradient(
      #3f6054 0deg ${occupiedDeg}deg,
      #e9bd59 ${occupiedDeg}deg ${occupiedDeg + maintenanceDeg}deg,
      #e9e9dc ${occupiedDeg + maintenanceDeg}deg 360deg
    )`,
  };

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
        <div
          className="donut"
          style={donutStyle}
          role="img"
          aria-label={`${pct} por ciento de ocupación`}
        >
          <div>
            <strong>
              {pct}
              <small>%</small>
            </strong>
            <span>ocupación</span>
          </div>
        </div>

        <div className="legend">
          <div>
            <i className="legend-dot occupied" />
            <span>Ocupados</span>
            <b>{occupied}</b>
          </div>
          <div>
            <i className="legend-dot available" />
            <span>Disponibles</span>
            <b>{available}</b>
          </div>
          <div>
            <i className="legend-dot maintenance" />
            <span>Mantenimiento</span>
            <b>{maintenance}</b>
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