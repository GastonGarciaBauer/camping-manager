import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AdminLayout({
  activeSection,
  onSelectSection,
  pendingTasksCount,
  headerInfo,
  onOpenNewReservation,
  onShowToast,
  mobileMenuOpen,
  onCloseMobileMenu,
  children,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        pendingTasksCount={pendingTasksCount}
        isOpen={mobileMenuOpen}
        onCloseMobile={onCloseMobileMenu}
        onShowToast={onShowToast}
      />

      <div className="main-column">
        <div className="fixed-header">
          <Topbar activeSection={activeSection} />

          <div className="page-heading">
            <div>
              <p className="overline">{headerInfo.overline}</p>
              <h1>{headerInfo.title}</h1>
              <p className="subtitle">{headerInfo.subtitle}</p>
            </div>
            <button
              className="primary-button"
              id="newReservationButton"
              type="button"
              onClick={onOpenNewReservation}
            >
              <span>+</span>
              Nueva reserva
            </button>
          </div>
        </div>

        <main className="dashboard">{children}</main>
      </div>
    </div>
  );
}