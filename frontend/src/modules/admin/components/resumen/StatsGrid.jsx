function formatMoney(amount) {
  return `$ ${Number(amount || 0).toLocaleString("es-AR")}`;
}

export function StatsGrid({ kpis }) {
  const data = kpis || {
    current_guests: 0,
    checkins_today: 0,
    checkouts_today: 0,
    income_today: 0,
    reservations_today: 0,
    pending_payments: 0,
  };

  const cards = [
    {
      label: "Huéspedes actuales",
      icon: "♙",
      value: data.current_guests,
      detail: "Personas alojadas hoy",
      status: "Estadías activas",
      tone: "green",
    },
    {
      label: "Check-ins de hoy",
      icon: "⇥",
      value: data.checkins_today,
      detail: "Ingresos programados",
      status: "Recepción activa",
      tone: "green",
    },
    {
      label: "Check-outs de hoy",
      icon: "⇤",
      value: data.checkouts_today,
      detail: "Salidas programadas",
      status: "Control de unidades",
      tone: "green",
    },
    {
      label: "Ingresos de hoy",
      icon: "$",
      value: formatMoney(data.income_today),
      detail: "Cobros aprobados hoy",
      status: "Caja al día",
      tone: "green",
    },
    {
      label: "Reservas de hoy",
      icon: "▣",
      value: data.reservations_today,
      detail: "Registradas en la fecha",
      status: "En seguimiento",
      tone: "gold",
    },
    {
      label: "Pagos pendientes",
      icon: "▱",
      value: data.pending_payments,
      detail: "Reservas por confirmar",
      status: data.pending_payments > 0 ? "Requiere atención" : "Sin pendientes",
      tone: "gold",
    },
  ];

  return (
    <section className="stats-grid" aria-label="Indicadores del día">
      {cards.map((stat) => (
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