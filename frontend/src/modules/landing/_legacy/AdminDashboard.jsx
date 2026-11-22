// frontend/src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Calendar, DollarSign, CheckCircle, Clock, XCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_reservations: 0, approved_reservations: 0, pending_reservations: 0, total_revenue: 0 });
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatosAdmin = async () => {
    setCargando(true);
    try {
      const resStats = await api.get('/index.php?endpoint=admin&action=stats');
      // Aseguramos que stats sea un objeto válido
      const statsData = resStats.data?.data || resStats.data || {};
      setStats(statsData);

      const resReservas = await api.get('/index.php?endpoint=admin&action=reservations');
      
      // BLINDAJE TOTAL: Verificamos de forma segura si viene como array o envuelto en .data
      const rawData = resReservas.data;
      let arrayFinal = [];
      if (Array.isArray(rawData)) {
        arrayFinal = rawData;
      } else if (rawData && Array.isArray(rawData.data)) {
        arrayFinal = rawData.data;
      }
      setReservas(arrayFinal);

    } catch (err) {
      console.error("Error al cargar datos del backoffice:", err);
      setReservas([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  // Cambiar estado manualmente desde el panel
  const cambiarEstado = async (reservationId, nuevoEstado) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a "${nuevoEstado}"?`)) return;

    try {
      await api.post('/index.php?endpoint=admin', {
        reservation_id: reservationId,
        estado: nuevoEstado
      });
      cargarDatosAdmin(); // Recargar datos
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado');
    }
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f4f6f9', minHeight: '100vh', padding: '30px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>Panel de Administración - Camping Manager</h1>
          <button onClick={cargarDatosAdmin} style={{ background: '#34495e', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={16} /> Actualizar
          </button>
        </div>

        {/* Tarjetas de KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '35px' }}>
          
          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '50%', color: '#1976d2' }}><Calendar size={28} /></div>
            <div>
              <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>Total Reservas</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{stats?.total_reservations ?? 0}</h2>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '50%', color: '#2e7d32' }}><CheckCircle size={28} /></div>
            <div>
              <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>Aprobadas</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{stats?.approved_reservations ?? 0}</h2>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: '#fff8e1', padding: '15px', borderRadius: '50%', color: '#f57f17' }}><Clock size={28} /></div>
            <div>
              <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>Pendientes</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>{stats?.pending_reservations ?? stats?.pending_payments ?? 0}</h2>
            </div>
          </div>

          <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: '#ede7f6', padding: '15px', borderRadius: '50%', color: '#512da8' }}><DollarSign size={28} /></div>
            <div>
              <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>Ingresos Totales</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#2c3e50' }}>${(stats?.total_revenue ?? 0).toLocaleString()}</h2>
            </div>
          </div>

        </div>

        {/* Tabla de Reservas */}
        <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', padding: '25px', overflowX: 'auto' }}>
          <h2 style={{ margin: '0 0 20px 0', color: '#2c3e50', fontSize: '1.2rem' }}>Listado General de Reservas</h2>
          
          {cargando ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>Cargando datos del backoffice...</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #eee', color: '#555' }}>
                  <th style={{ padding: '12px' }}>Código</th>
                  <th style={{ padding: '12px' }}>Huésped</th>
                  <th style={{ padding: '12px' }}>Unidad</th>
                  <th style={{ padding: '12px' }}>Fechas</th>
                  <th style={{ padding: '12px' }}>Estado</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {!Array.isArray(reservas) || reservas.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No hay reservas registradas aún.</td>
                  </tr>
                ) : (
                  reservas.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#0070f3' }}>{r.codigo_privado}</td>
                      <td style={{ padding: '12px' }}>{r.guest_nombre} {r.guest_apellido}</td>
                      <td style={{ padding: '12px' }}>{r.tipo_alojamiento ? r.tipo_alojamiento.replace(/_/g, ' ') : ''} <br/><small style={{color:'#888'}}>({r.codigo_unidad})</small></td>
                      <td style={{ padding: '12px' }}>{r.fecha_ingreso} al {r.fecha_salida}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          background: r.estado_reserva === 'aprobado' ? '#d4edda' : r.estado_reserva === 'pendiente_pago' ? '#fff3cd' : '#f8d7da',
                          color: r.estado_reserva === 'aprobado' ? '#155724' : r.estado_reserva === 'pendiente_pago' ? '#856404' : '#721c24'
                        }}>
                          {r.estado_reserva}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {r.estado_reserva !== 'aprobado' && (
                            <button onClick={() => cambiarEstado(r.id, 'aprobado')} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }} title="Aprobar manualmente">
                              Aprobar
                            </button>
                          )}
                          {r.estado_reserva !== 'cancelado' && (
                            <button onClick={() => cambiarEstado(r.id, 'cancelado')} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }} title="Cancelar">
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}