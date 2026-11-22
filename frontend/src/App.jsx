import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./modules/landing/pages/Landing";
import GuestPortal from "./modules/guest/GuestPortal";
import AdminApp from "./modules/admin/AdminApp";

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Principal: La Landing Page comercial con el motor de reservas integrado */}
        <Route path="/" element={<Landing />} />

        {/* Ruta del Portal del Huésped (soporta parámetro opcional en URL ej: /portal o /portal/CMP-8F3K9A) */}
        <Route path="/portal" element={<GuestPortal />} />
        <Route path="/portal/:codigo" element={<GuestPortal />} />

        {/* Ruta del Panel de Administración / Backoffice */}
        <Route path="/admin" element={<AdminApp />} />
      </Routes>
    </Router>
  );
}

export default App;