import { useEffect, useRef, useState } from "react";
import "./styles/admin.css";
import { INITIAL_MOVEMENTS, INITIAL_TASKS } from "./data/mockResumen";
import { INITIAL_ACCOMMODATIONS } from "./data/mockDisponibilidad";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ReservationModal } from "./components/common/ReservationModal";
import { Toast } from "./components/common/Toast";
import { ResumenPage } from "./pages/ResumenPage";
import { Availability } from "./pages/Availability";
import { ReservationPage } from "./pages/ReservationPage";
import { SeccionDemoPage } from "./pages/SeccionDemoPage";

const SECTION_HEADERS = {
  Resumen: {
    overline: "TIERRA ADENTRO · PANEL DE CONTROL",
    title: "Tu camping, de un vistazo.",
    subtitle: "Lo que necesitas saber para que el día fluya.",
  },
  Reservas: {
    overline: "TIERRA ADENTRO · RESERVAS",
    title: "Reservas",
    subtitle: "Gestioná las operaciones de tu camping desde un solo lugar.",
  },
  Disponibilidad: {
    overline: "TIERRA ADENTRO · DISPONIBILIDAD",
    title: "Parcelas y cabañas.",
    subtitle: "Estado operativo de cada alojamiento del camping.",
  },
  Cobros: {
    overline: "TIERRA ADENTRO · COBROS",
    title: "Ingresos y saldos.",
    subtitle: "Seguimiento de pagos registrados y pendientes.",
  },
  Tareas: {
    overline: "TIERRA ADENTRO · TAREAS",
    title: "Pendientes del día.",
    subtitle: "Mantenimiento, limpieza y preparación de sectores.",
  },
};

export default function AdminApp() {
  const [activeSection, setActiveSection] = useState("Resumen");
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [accommodations] = useState(INITIAL_ACCOMMODATIONS);
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
    }, 2600);
  };

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const handleSelectSection = (sectionName, notifyDemo = true) => {
    setActiveSection(sectionName);
    if (notifyDemo && sectionName !== "Resumen") {
      showToast(`${sectionName}: sección de demostración`);
    }
  };

  const handleUpdateMovement = (id, patch) => {
    setMovements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        const nextDone = !task.done;
        if (nextDone) {
          showToast("Tarea marcada como resuelta.");
        }
        return { ...task, done: nextDone };
      })
    );
  };

  const pendingTasksCount = tasks.filter((task) => !task.done).length;
  const headerInfo = SECTION_HEADERS[activeSection] || SECTION_HEADERS.Resumen;

  return (
    <div className="admin-page">
      <AdminLayout
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        pendingTasksCount={pendingTasksCount}
        headerInfo={headerInfo}
        onOpenNewReservation={() => setModalOpen(true)}
        onShowToast={showToast}
        mobileMenuOpen={mobileMenuOpen}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      >
        {activeSection === "Resumen" && (
          <ResumenPage
            movements={movements}
            onUpdateMovement={handleUpdateMovement}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigateSection={(section) => handleSelectSection(section)}
            onShowToast={showToast}
          />
        )}

        {activeSection === "Reservas" && (
          <ReservationPage
            movements={movements}
            onUpdateMovement={handleUpdateMovement}
            onShowToast={showToast}
          />
        )}

        {activeSection === "Disponibilidad" && (
          <Availability items={accommodations} onShowToast={showToast} />
        )}

        {activeSection !== "Resumen" &&
          activeSection !== "Reservas" &&
          activeSection !== "Disponibilidad" && (
            <SeccionDemoPage section={activeSection} />
          )}
      </AdminLayout>

      <ReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onShowToast={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}