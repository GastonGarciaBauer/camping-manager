// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import ReservationLookup from './pages/ReservationLookup';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Principal: La Landing Page comercial con el motor de reservas integrado */}
        <Route path="/" element={<Landing />} />

        {/* Ruta del Portal del Huésped (soporta parámetro opcional en URL ej: /portal o /portal/CMP-8F3K9A) */}
        <Route path="/portal" element={<ReservationLookup />} />
        <Route path="/portal/:codigo" element={<ReservationLookup />} />

        {/* Ruta del Panel de Administración / Backoffice */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;