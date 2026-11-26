import { useCallback, useEffect, useRef, useState } from "react";
import "./styles/admin.css";
import api from "../../services/api";
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
  const [incomePeriod, setIncomePeriod] = useState("7d");
  const [resumenData, setResumenData] = useState(null);
  const [isLiveData, setIsLiveData] = useState(false);
  const [movements, setMovements] = useState(INITIAL_MOVEMENTS);
  const [reservationsList, setReservationsList] = useState([]);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [accommodations, setAccommodations] = useState(INITIAL_ACCOMMODATIONS);
  const [payments, setPayments] = useState(INITIAL_PAYMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage("");
    }, 2600);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(toastTimerRef.current);
  }, []);

  const fetchResumen = useCallback(async (periodValue = "7d") => {
    try {
      const response = await api.get("/index.php", {
        params: {
          endpoint: "admin",
          action: "resumen",
          period: periodValue,
        },
      });

      const payload = response.data?.data || response.data;
      if (!payload || typeof payload !== "object") return;

      setResumenData(payload);
      setIsLiveData(true);

      if (Array.isArray(payload.movements)) {
        setMovements(payload.movements);
      }
      if (Array.isArray(payload.tasks)) {
        setTasks(payload.tasks);
      }
    } catch (error) {
      console.error("Error cargando resumen desde backend:", error);
      setIsLiveData(false);
    }
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      const response = await api.get("/index.php", {
        params: {
          endpoint: "admin",
          action: "reservations",
        },
      });

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      if (Array.isArray(rows)) {
        setReservationsList(rows);
        setIsLiveData(true);
      }
    } catch (error) {
      console.error("Error cargando reservas desde backend:", error);
    }
  }, []);

  const fetchAccommodations = useCallback(async () => {
    try {
      const response = await api.get("/index.php", {
        params: {
          endpoint: "admin",
          action: "accommodations",
        },
      });

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      if (Array.isArray(rows) && rows.length > 0) {
        setAccommodations(rows);
        setIsLiveData(true);
      }
    } catch (error) {
      console.error("Error cargando alojamientos desde backend:", error);
    }
  }, []);

  const fetchPendingPayments = useCallback(async () => {
    try {
      const response = await api.get("/index.php", {
        params: {
          endpoint: "admin",
          action: "pending_payments",
        },
      });

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      if (Array.isArray(rows)) {
        setPayments(rows);
        setIsLiveData(true);
      }
    } catch (error) {
      console.error("Error cargando cobros pendientes desde backend:", error);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await api.get("/index.php", {
        params: {
          endpoint: "admin",
          action: "tasks",
        },
      });

      const rows = Array.isArray(response.data)
        ? response.data
        : response.data?.data;

      if (Array.isArray(rows)) {
        setTasks(rows);
        setIsLiveData(true);
      }
    } catch (error) {
      console.error("Error cargando tareas desde backend:", error);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "Resumen") {
      fetchResumen(incomePeriod);
    } else if (activeSection === "Reservas") {
      fetchReservations();
    } else if (activeSection === "Disponibilidad") {
      fetchAccommodations();
    } else if (activeSection === "Cobros") {
      fetchPendingPayments();
    } else if (activeSection === "Tareas") {
      fetchTasks();
    }
  }, [
    activeSection,
    incomePeriod,
    fetchResumen,
    fetchReservations,
    fetchAccommodations,
    fetchPendingPayments,
    fetchTasks,
  ]);

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

  const handleUpdateMovement = async (id, patch, movementAction = null) => {
    setMovements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
    setReservationsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );

    const inferredAction =
      movementAction ||
      (patch.action === "checkout"
        ? "checkin"
        : patch.action === "done"
        ? "checkout"
        : null);

    if (!inferredAction) return;

    try {
      await api.post("/index.php?endpoint=admin", {
        action: "movement",
        reservation_id: id,
        movement_action: inferredAction,
      });

      if (activeSection === "Resumen") {
        await fetchResumen(incomePeriod);
      } else if (activeSection === "Reservas") {
        await fetchReservations();
      }
    } catch (error) {
      console.error("Error guardando movimiento en BD:", error);
      showToast("No se pudo sincronizar el movimiento con la BD.");
    }
  };

  const handleToggleTask = async (id) => {
    let nextDoneState = false;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        nextDoneState = !task.done;
        if (nextDoneState) {
          showToast("Tarea marcada como resuelta.");
        }
        return { ...task, done: nextDoneState };
      })
    );

    try {
      await api.post("/index.php?endpoint=admin", {
        action: "toggle_task",
        task_id: id,
      });
      if (activeSection === "Resumen") {
        await fetchResumen(incomePeriod);
      } else if (activeSection === "Tareas") {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Error actualizando tarea en BD:", error);
      showToast("No se pudo actualizar la tarea en la BD.");
    }
  };

  const handleAddTask = async ({ title, sector, priority }) => {
    const optimisticTask = {
      id: Date.now(),
      title,
      sector,
      zone: sector,
      priority,
      priorityLevel: priority.toLowerCase(),
      done: false,
    };

    setTasks((prev) => [optimisticTask, ...prev]);
    showToast(`Tarea "${title}" agregada.`);

    try {
      await api.post("/index.php?endpoint=admin", {
        action: "create_task",
        title,
        sector,
        priority,
      });

      if (activeSection === "Tareas") {
        await fetchTasks();
      } else if (activeSection === "Resumen") {
        await fetchResumen(incomePeriod);
      }
    } catch (error) {
      console.error("Error guardando nueva tarea en BD:", error);
      showToast("No se pudo guardar la tarea en la BD.");
    }
  };

  const handleUpdateAccommodationStatus = async (id, newStatus) => {
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

    if (newStatus === "Ocupada") {
      return;
    }

    try {
      await api.post("/index.php?endpoint=admin", {
        action: "update_accommodation",
        accommodation_id: id,
        status: newStatus,
      });
      await fetchAccommodations();
    } catch (error) {
      console.error("Error actualizando alojamiento en BD:", error);
      showToast("No se pudo guardar el estado del alojamiento en la BD.");
    }
  };

  const handleCollectPayment = async (id, balance = null) => {
    setPayments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, paid: true } : item))
    );

    try {
      await api.post("/index.php?endpoint=admin", {
        action: "collect_payment",
        reservation_id: id,
        monto: balance,
        metodo_pago: "efectivo",
      });
      await fetchPendingPayments();
    } catch (error) {
      console.error("Error registrando cobro en BD:", error);
      showToast("No se pudo registrar el cobro en la BD.");
    }
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
            resumenData={resumenData}
            incomePeriod={incomePeriod}
            onChangeIncomePeriod={setIncomePeriod}
            isLiveData={isLiveData}
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
            reservations={reservationsList}
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
            isLiveData={isLiveData}
            onCollectPayment={handleCollectPayment}
            onShowToast={showToast}
          />
        )}

        {activeSection === "Tareas" && (
          <TasksPage
            tasks={tasks}
            isLiveData={isLiveData}
            onToggleTask={handleToggleTask}
            onOpenNewTask={() => setTaskModalOpen(true)}
            onShowToast={showToast}
          />
        )}
      </AdminLayout>

      <ReservationModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          if (activeSection === "Reservas") {
            fetchReservations();
          } else if (activeSection === "Resumen") {
            fetchResumen(incomePeriod);
          } else if (activeSection === "Disponibilidad") {
            fetchAccommodations();
          } else if (activeSection === "Cobros") {
            fetchPendingPayments();
          } else if (activeSection === "Tareas") {
            fetchTasks();
          }
        }}
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