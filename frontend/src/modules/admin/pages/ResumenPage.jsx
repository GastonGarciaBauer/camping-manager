import { StatsGrid } from "../components/resumen/StatsGrid";
import { IncomeChart } from "../components/resumen/IncomeChart";
import { OccupancyCard } from "../components/resumen/OccupancyCard";
import { MovementsTable } from "../components/resumen/MovementsTable";
import { TasksCard } from "../components/resumen/TasksCard";

function formatTodayDate() {
  const formatted = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date());

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function ResumenPage({
  resumenData,
  incomePeriod,
  onChangeIncomePeriod,
  isLiveData,
  movements,
  onUpdateMovement,
  tasks,
  onToggleTask,
  onNavigateSection,
  onShowToast,
}) {
  return (
    <>
      <div className="date-row">
        <div className="date-display">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7.5 3v4M16.5 3v4M4 9h16M8 13h2M13 13h2M8 17h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>{formatTodayDate()}</span>
          <span className="today-pill">Hoy</span>
        </div>
      </div>

      <StatsGrid kpis={resumenData?.kpis} />

      <section className="analytics-grid">
        <IncomeChart
          chartData={resumenData?.income_chart}
          period={incomePeriod}
          onChangePeriod={onChangeIncomePeriod}
          onShowToast={onShowToast}
        />
        <OccupancyCard
          occupancy={resumenData?.occupancy}
          onNavigateAvailability={() => onNavigateSection("Disponibilidad")}
        />
      </section>

      <section className="operations-grid">
        <MovementsTable
          movements={movements}
          onUpdateMovement={onUpdateMovement}
          onNavigateReservations={() => onNavigateSection("Reservas")}
          onShowToast={onShowToast}
        />
        <TasksCard
          tasks={tasks}
          onToggleTask={onToggleTask}
          onNavigateTasks={() => onNavigateSection("Tareas")}
        />
      </section>

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