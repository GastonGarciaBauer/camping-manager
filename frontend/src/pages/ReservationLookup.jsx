// frontend/src/pages/ReservationLookup.jsx
import { useState } from 'react';
import api from '../services/api';
import { Search, CreditCard, Calendar, Users, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function ReservationLookup() {
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoPago, setCargandoPago] = useState(false);
  const [error, setError] = useState('');

  // 1. Buscar la reserva por código privado
  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!codigo.trim()) return;

    setCargando(true);
    setError('');
    setReserva(null);

    try {
      const response = await api.get(`/index.php?endpoint=reservations&codigo=${codigo.trim()}`);
      setReserva(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'No se encontró ninguna reserva con ese código.');
    } finally {
      setCargando(false);
    }
  };

  // 2. Iniciar el pago (Bloqueo temporal de 15 min + Preferencia Mercado Pago)
  const handlePagar = async () => {
    setCargandoPago(true);
    try {
      // Calculamos el monto total aproximado (Tarifa base * noches + adicionales)
      const noches = (new Date(reserva.fecha_salida) - new Date(reserva.fecha_ingreso)) / (1000 * 60 * 60 * 24);
      const subtotalBase = reserva.tarifa_base_diaria * noches;
      const subtotalAdicionales = reserva.adicionales.reduce((acc, curr) => acc + parseFloat(curr.subtotal), 0);
      const montoTotal = subtotalBase + subtotalAdicionales;

      const response = await api.post('/index.php?endpoint=payments', {
        reservation_id: reserva.id,
        monto: montoTotal
      });

      if (response.data.mp_init_point) {
        // Redirigir al checkout simulado o real de Mercado Pago
        window.location.href = response.data.mp_init_point;
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Error al iniciar el proceso de pago.');
      setCargandoPago(false);
    }
  };

  // Función auxiliar para formatear estados con colores bonitos
  const renderBadgeEstado = (estado) => {
    switch (estado) {
      case 'pendiente_pago':
        return <span style={{ background: '#fff3cd', color: '#856404', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>Pendiente de Pago</span>;
      case 'pago_en_proceso':
        return <span style={{ background: '#cce5ff', color: '#004085', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>Pago en Proceso (Bloqueo 15m)</span>;
      case 'aprobado':
        return <span style={{ background: '#d4edda', color: '#155724', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>Aprobado / Confirmado</span>;
      case 'cancelado':
        return <span style={{ background: '#f8d7da', color: '#721c24', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>Cancelado</span>;
      default:
        return <span style={{ background: '#e2e3e5', color: '#383d41', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', fontSize: '0.9rem' }}>{estado}</span>;
    }
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#333', background: '#f4f6f8', minHeight: '100vh', padding: '40px 20px' }}>
      
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>Portal del Huésped</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Ingresa tu código privado para consultar tu reserva o realizar el pago.</p>

        {/* Formulario de Búsqueda */}
        <form onSubmit={handleBuscar} style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} color="#888" style={{ position: 'absolute', left: '12px', top: '13px' }} />
            <input 
              type="text" 
              placeholder="Ej. CMP-8F3K9A" 
              value={codigo} 
              onChange={e => setCodigo(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', textTransform: 'uppercase' }}
            />
          </div>
          <button type="submit" disabled={cargando} style={{ padding: '10px 25px', background: '#2c3e50', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {cargando ? 'Buscando...' : 'Consultar'}
          </button>
        </form>

        {error && (
          <div style={{ background: '#ffebee', color: '#c62828', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {/* Detalle de la Reserva Encontrada */}
        {reserva && (
          <div style={{ background: '#fff', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', padding: '30px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>Código Privado</span>
                <h2 style={{ margin: '0', color: '#2c3e50' }}>{reserva.codigo_privado}</h2>
              </div>
              <div>
                {renderBadgeEstado(reserva.estado_reserva)}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px', background: '#fafafa', padding: '15px', borderRadius: '8px' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}><strong>Titular:</strong> {reserva.guest_nombre} {reserva.guest_apellido}</p>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}><strong>Email:</strong> {reserva.guest_email}</p>
                <p style={{ margin: '0', color: '#666' }}><strong>Teléfono:</strong> {reserva.guest_telefono}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}><strong>Ingreso:</strong> {reserva.fecha_ingreso}</p>
                <p style={{ margin: '0 0 5px 0', color: '#666' }}><strong>Salida:</strong> {reserva.fecha_salida}</p>
                <p style={{ margin: '0', color: '#666' }}><strong>Pasajeros:</strong> {reserva.cantidad_personas}</p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', color: '#2c3e50', marginBottom: '10px' }}>Alojamiento Solicitado / Asignado</h3>
            <p style={{ background: '#e8f5e9', color: '#2e7d32', padding: '12px', borderRadius: '6px', margin: '0 0 20px 0', fontWeight: '500' }}>
              Tipo: <strong>{reserva.tipo_alojamiento.replace(/_/g, ' ').toUpperCase()}</strong> (Tarifa base diaria: ${reserva.tarifa_base_diaria})
            </p>

            {/* Adicionales contratados si los hay */}
{reserva.adicionales && reserva.adicionales.length > 0 && (
  <div style={{ marginBottom: '20px' }}>
    <h4 style={{ margin: '0 0 8px 0', color: '#555' }}>Adicionales Contratados:</h4>
    <ul style={{ margin: '0', paddingLeft: '20px', color: '#666' }}>
      {reserva.adicionales.map((add, idx) => {
        // Nos aseguramos de que add.tipo exista antes de aplicar replace
        const tipoTexto = add.tipo ? add.tipo.replace(/_/g, ' ').toUpperCase() : 'ADICIONAL';
        return (
          <li key={idx}>
            {tipoTexto} — {add.cantidad_dias} días (Subtotal: ${add.subtotal})
          </li>
        );
      })}
    </ul>
  </div>
)}

            {/* Botón de Pago si está Pendiente */}
            {reserva.estado_reserva === 'pendiente_pago' && (
              <div style={{ textAlign: 'center', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <p style={{ color: '#d9534f', fontSize: '0.9rem', marginBottom: '15px' }}>
                  <Clock size={16} style={{ verticalAlign: 'middle' }} /> Tu solicitud vence el {reserva.vigencia_solicitud_hasta}. Realiza el pago para asegurar tu lugar.
                </p>
                <button 
                  onClick={handlePagar} 
                  disabled={cargandoPago}
                  style={{ background: '#009ee3', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: '6px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(0,158,227,0.3)' }}
                >
                  <CreditCard size={22} />
                  {cargandoPago ? 'Generando Pago...' : 'Pagar con Mercado Pago'}
                </button>
              </div>
            )}

            {reserva.estado_reserva === 'aprobado' && (
              <div style={{ textAlign: 'center', marginTop: '20px', background: '#d4edda', color: '#155724', padding: '15px', borderRadius: '6px' }}>
                <CheckCircle size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                ¡Tu reserva se encuentra confirmada y aprobada! Te esperamos en el camping.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}