import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./modules/landing/pages/Landing";
import GuestPortal from "./modules/guest/GuestPortal";
import AdminApp from "./modules/admin/AdminApp";
import { AdminLoginPage } from "./modules/admin/pages/AdminLoginPage";

function isAdminAuthenticated() {
  try {
    const raw = localStorage.getItem("tierra_adentro_admin");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed && (parsed.email || parsed.id));
  } catch {
    return false;
  }
}

function ProtectedAdminRoute({ children }) {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function PublicLoginRoute({ children }) {
  if (isAdminAuthenticated()) {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Principal: La Landing Page comercial con el motor de reservas integrado */}
        <Route path="/" element={<Landing />} />

        {/* Ruta del Portal del Huésped (soporta parámetro opcional en URL ej: /portal o /portal/CMP-8F3K9A) */}
        <Route path="/portal" element={<GuestPortal />} />
        <Route path="/portal/:codigo" element={<GuestPortal />} />

        {/* Login del Administrador */}
        <Route
          path="/admin/login"
          element={
            <PublicLoginRoute>
              <AdminLoginPage />
            </PublicLoginRoute>
          }
        />

        {/* Ruta del Panel de Administración / Backoffice */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminApp />
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;