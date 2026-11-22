import { StatsGrid } from "../components/resumen/StatsGrid";
import { IncomeChart } from "../components/resumen/IncomeChart";
import { OccupancyCard } from "../components/resumen/OccupancyCard";
import { MovementsTable } from "../components/resumen/MovementsTable";
import { TasksCard } from "../components/resumen/TasksCard";

export function ResumenPage({
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
          <span>Sábado, 21 de noviembre de 2026</span>
          <span className="today-pill">Hoy</span>
        </div>
      </div>

      <StatsGrid />

      <section className="analytics-grid">
        <IncomeChart onShowToast={onShowToast} />
        <OccupancyCard onNavigateAvailability={() => onNavigateSection("Disponibilidad")} />
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
        <span>Datos ilustrativos de demostración</span>
      </footer>
    </>
  );
}