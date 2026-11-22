import { STATS_DATA } from "../../data/mockResumen";

export function StatsGrid() {
  return (
    <section className="stats-grid" aria-label="Indicadores del día">
      {STATS_DATA.map((stat) => (
        <article className="stat-card" key={stat.label}>
          <div className="stat-top">
            <span>{stat.label}</span>
            <span className="stat-icon">{stat.icon}</span>
          </div>
          <strong className="stat-value">{stat.value}</strong>
          <p>{stat.detail}</p>
          <small className={`status status-${stat.tone}`}>{stat.status}</small>
        </article>
      ))}
    </section>
  );
}