// frontend/src/App.jsx
import { useState } from 'react';
import Landing from './pages/Landing';
import ReservationLookup from './pages/ReservationLookup';

function App() {
  const [vistaActual, setVistaActual] = useState('landing'); // 'landing' o 'lookup'

  return (
    <div>
      {/* Barra de navegación superior temporal para alternar vistas */}
      <nav style={{ background: '#2c3e50', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' }}>
        <h3 style={{ margin: 0, cursor: 'pointer' }} onClick={() => setVistaActual('landing')}>Camping Manager</h3>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => setVistaActual('landing')} 
            style={{ background: vistaActual === 'landing' ? '#34495e' : 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Nueva Reserva (Landing)
          </button>
          <button 
            onClick={() => setVistaActual('lookup')} 
            style={{ background: vistaActual === 'lookup' ? '#34495e' : 'transparent', color: '#fff', border: '1px solid #fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Consultar con Código Privado
          </button>
        </div>
      </nav>

      {/* Renderizado condicional de vistas */}
      {vistaActual === 'landing' ? <Landing /> : <ReservationLookup />}
    </div>
  );
}

export default App;