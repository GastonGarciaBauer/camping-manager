// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import api from './services/api';

function App() {
  const [mensajeBackend, setMensajeBackend] = useState('Conectando con el backend...');

  useEffect(() => {
    // Llamamos al endpoint de prueba que configuramos en el index.php del backend
    api.get('/index.php?endpoint=test') // O directamente a tu ruta si ya la tienes mapeada
       .then(response => {
          setMensajeBackend(response.data.message);
       })
       .catch(error => {
          console.error('Error de conexión:', error);
          setMensajeBackend('No se pudo conectar con el servidor PHP.');
       });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', marginTop: '50px' }}>
      <h1>Camping Manager - Frontend Activo</h1>
      <div style={{ padding: '20px', background: '#f0f0f0', display: 'inline-block', borderRadius: '8px' }}>
        <h3>Estado de la conexión:</h3>
        <p style={{ color: '#0070f3', fontWeight: 'bold' }}>{mensajeBackend}</p>
      </div>
    </div>
  );
}

export default App;