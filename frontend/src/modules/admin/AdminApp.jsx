import { useEffect, useRef, useState } from "react";
import "./styles/admin.css";
import { INITIAL_MOVEMENTS, INITIAL_TASKS } from "./data/mockResumen";
import { INITIAL_ACCOMMODATIONS } from "./data/mockDisponibilidad";
import { INITIAL_PAYMENTS } from "./data/mockCobros";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ReservationModal } from "./components/common/ReservationModal";
import { TaskModal } from "./components/common/TaskModal";
import { Toast } from "./components/common/Toast";
import { ResumenPage } from "./pages/ResumenPage";
import { Availability } from "./pages/Availability";
import { ReservationPage } from "./pages/ReservationPage";
import { Incomings } from "./pages/Incomings";
import { TasksPage } from "./pages/TasksPage";

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
    overline: "TIERRA ADENTRO · PANEL DE CONTROL",
    title: "Cobros",
    subtitle: "Gestiona la operación de tu camping desde un solo lugar.",
  },
  Tareas: {
    overline: "TIERRA ADENTRO · PANEL DE CONTROL",
    title: "Tareas",
    subtitle: "Gestiona la operación de tu camping desde un solo lugar.",
  },
};

export default function AdminApp() {
  const [activeSection, setActiveSection] = useState("Resumen");
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [accommodations, setAccommodations] = useState(INITIAL_ACCOMMODATIONS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
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
    if (
      notifyDemo &&
      sectionName !== "Resumen" &&
      sectionName !== "Reservas" &&
      sectionName !== "Disponibilidad" &&
      sectionName !== "Cobros" &&
      sectionName !== "Tareas"
    ) {
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

  const handleAddTask = ({ title, sector, priority }) => {
    const newTask = {
      id: Date.now(),
      title,
      sector,
      priority,
      done: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    showToast(`Tarea "${title}" agregada.`);
  };

  const handleUpdateAccommodationStatus = (id, newStatus) => {
    const target = accommodations.find((unit) => unit.id === id);

    setAccommodations((prev) =>
      prev.map((unit) => {
        if (unit.id !== id) return unit;

        if (newStatus === "Disponible") {
          return {
            ...unit,
            status: "Disponible",
            note: "Lista para recibir huéspedes",
          };
        }

        if (newStatus === "Mantenimiento") {
          return {
            ...unit,
            status: "Mantenimiento",
            note: "En revisión / mantenimiento",
          };
        }

        return {
          ...unit,
          status: "Ocupada",
          guest: unit.guest || "Huésped asignado",
          checkout: unit.checkout || "Estadía en curso",
        };
      })
    );

    if (target) {
      showToast(`${target.name} actualizada a "${newStatus}".`);
    }
  };

  const handleCollectPayment = (id) => {
    setPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paid: true } : item))
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
          <Availability
            items={accommodations}
            onUpdateStatus={handleUpdateAccommodationStatus}
          />
        )}

        {activeSection === "Cobros" && (
          <Incomings
            payments={payments}
            onCollectPayment={handleCollectPayment}
            onShowToast={showToast}
          />
        )}

        {activeSection === "Tareas" && (
          <TasksPage
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onOpenNewTask={() => setTaskModalOpen(true)}
            onShowToast={showToast}
          />
        )}

        {activeSection !== "Resumen" &&
          activeSection !== "Reservas" &&
          activeSection !== "Disponibilidad" &&
          activeSection !== "Cobros" &&
          activeSection !== "Tareas"}
      </AdminLayout>

      <ReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onShowToast={showToast}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onAddTask={handleAddTask}
        onShowToast={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}