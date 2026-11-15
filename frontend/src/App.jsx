// frontend/src/App.jsx
import { useState } from 'react';
import Landing from './pages/Landing';
import ReservationLookup from './pages/ReservationLookup';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [vistaActual, setVistaActual] = useState('landing'); // 'landing', 'lookup' o 'admin'

  return (
    <div>
      {/* Barra de Navegación Superior */}
      <nav style={{ background: '#2c3e50', padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <h3 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setVistaActual('landing')}>Camping Manager</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setVistaActual('landing')} 
            style={{ background: vistaActual === 'landing' ? '#34495e' : 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Nueva Reserva
          </button>
          <button 
            onClick={() => setVistaActual('lookup')} 
            style={{ background: vistaActual === 'lookup' ? '#34495e' : 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Portal Huésped
          </button>
          <button 
            onClick={() => setVistaActual('admin')} 
            style={{ background: vistaActual === 'admin' ? '#34495e' : 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Backoffice (Admin)
          </button>
        </div>
      </nav>

      {/* Renderizado de Vistas */}
      {vistaActual === 'landing' && <Landing />}
      {vistaActual === 'lookup' && <ReservationLookup />}
      {vistaActual === 'admin' && <AdminDashboard />}
    </div>
  );
}

export default App;