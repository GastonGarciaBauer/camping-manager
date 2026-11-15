// frontend/src/pages/Landing.jsx
import { useState } from 'react';
import api from '../services/api';
import { Tent, Car, Users, Calendar, MapPin, CheckCircle, AlertCircle } from 'lucide-react';

export default function Landing() {
  // Estados para las fechas y pasajeros (paso 1 del form de disponibilidad)
  searchDates: {
    // Definimos el estado inicial
  }
  const [formData, setFormData] = useState({
    fecha_ingreso: '',
    fecha_salida: '',
    cantidad_personas: 1,
    tipo_alojamiento: '',
    guest: {
      nombre: '',
      apellido: '',
      dni: '',
      telefono: '',
      email: '',
      pais_localidad: '',
      observaciones: ''
    },
    adicionales: []
  });

  const [tiposDisponibles, setTiposDisponibles] = useState([]);
  const [buscandoDisponibilidad, setBuscandoDisponibilidad] = useState(false);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [resultadoReserva, setResultadoReserva] = useState(null);
  const [errorMensaje, setErrorMensaje] = useState('');

  // 1. Consultar disponibilidad al cambiar fechas o cantidad de personas
  const verificarDisponibilidad = async (e) => {
    e.preventDefault();
    if (!formData.fecha_ingreso || !formData.fecha_salida) {
      alert('Por favor selecciona la fecha de ingreso y salida.');
      return;
    }

    setBuscandoDisponibilidad(true);
    setErrorMensaje('');
    
    try {
      // Consultamos los 3 tipos posibles y filtramos cuáles tienen stock
      const tipos = ['parcela_comun', 'cabana_1_ambiente', 'cabana_2_ambientes'];
      const disponibles = [];

      for (const tipo of tipos) {
        const res = await api.get(`/index.php?endpoint=accommodations&tipo=${tipo}&ingreso=${formData.fecha_ingreso}&salida=${formData.fecha_salida}`);
        if (res.data.data && res.data.data.length > 0) {
          disponibles.push(tipo);
        }
      }

      setTiposDisponibles(disponibles);
      if (disponibles.length === 0) {
        setErrorMensaje('No hay alojamientos disponibles para el rango de fechas seleccionado.');
      }
    } catch (err) {
      console.error(err);
      setErrorMensaje('Error al consultar la disponibilidad con el servidor.');
    } finally {
      setBuscandoDisponibilidad(false);
    }
  };

  // 2. Manejar cambios en campos de texto del huésped
  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      guest: { ...prev.guest, [name]: value }
    }));
  };

  // 3. Manejar adicionales (Estacionamiento y Carpa provista)
  const handleAdicionalChange = (tipo, precio) => {
    setFormData(prev => {
      const existe = prev.adicionales.find(a => a.tipo === tipo);
      if (existe) {
        return { ...prev, adicionales: prev.adicionales.filter(a => a.tipo !== tipo) };
      } else {
        return { ...prev, adicionales: [...prev.adicionales, { tipo, precio_diario: precio }] };
      }
    });
  };

  // 4. Enviar formulario final de solicitud de reserva
  const handleSubmitReserva = async (e) => {
    e.preventDefault();
    setCargandoEnvio(true);
    setErrorMensaje('');

    try {
      const response = await api.post('/index.php?endpoint=reservations', formData);
      setResultadoReserva(response.data);
    } catch (err) {
      console.error(err);
      setErrorMensaje(err.response?.data?.error || 'Error al procesar la solicitud de reserva.');
    } finally {
      setCargandoEnvio(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', color: '#333', background: '#f9f9f9', minHeight: '100vh', paddingBottom: '50px' }}>
      
      {/* Header / Hero Section */}
      <header style={{ background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80") center/cover', color: '#fff', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>Camping & Cabañas Solares</h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>Disfruta de la naturaleza con la comodidad de nuestras parcelas y cabañas totalmente equipadas.</p>
      </header>

      <main style={{ maxWidth: '900px', margin: '40px auto', background: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        
        {!resultadoReserva ? (
          <div>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#2c3e50' }}>Solicita tu Reserva</h2>
            
            {errorMensaje && (
              <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '5px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={20} /> {errorMensaje}
              </div>
            )}

            {/* Paso 1: Fechas y Personas para ver disponibilidad */}
            <form onSubmit={verificarDisponibilidad} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px', background: '#f1f8e9', padding: '20px', borderRadius: '8px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Fecha de Ingreso:</label>
                <input type="date" required value={formData.fecha_ingreso} onChange={e => setFormData({...formData, fecha_ingreso: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Fecha de Salida:</label>
                <input type="date" required value={formData.fecha_salida} onChange={e => setFormData({...formData, fecha_salida: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Cantidad de Personas:</label>
                <input type="number" min="1" max="10" required value={formData.cantidad_personas} onChange={e => setFormData({...formData, cantidad_personas: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" disabled={buscandoDisponibilidad} style={{ width: '100%', padding: '10px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {buscandoDisponibilidad ? 'Buscando...' : 'Ver Disponibilidad'}
                </button>
              </div>
            </form>

            {/* Paso 2: Si hay disponibilidad, mostramos el formulario completo */}
            {tiposDisponibles.length > 0 && (
              <form onSubmit={handleSubmitReserva} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Selector dinámico de alojamiento */}
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Selecciona Tipo de Alojamiento Disponible:</label>
                  <select required value={formData.tipo_alojamiento} onChange={e => setFormData({...formData, tipo_alojamiento: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}>
                    <option value="">-- Elige una opción con disponibilidad --</option>
                    {tiposDisponibles.includes('parcela_comun') && <option value="parcela_comun">Parcela Común (Para carpa familiar)</option>}
                    {tiposDisponibles.includes('cabana_1_ambiente') && <option value="cabana_1_ambiente">Cabaña de 1 Ambiente</option>}
                    {tiposDisponibles.includes('cabana_2_ambientes') && <option value="cabana_2_ambientes">Cabaña de 2 Ambientes</option>}
                  </select>
                </div>

                {/* Datos del Huésped Titular */}
                <h3 style={{ margin: '10px 0 0 0', color: '#2c3e50' }}>Datos del Titular</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input type="text" name="nombre" placeholder="Nombre" required value={formData.guest.nombre} onChange={handleGuestChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="text" name="apellido" placeholder="Apellido" required value={formData.guest.apellido} onChange={handleGuestChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="text" name="dni" placeholder="DNI o Pasaporte" required value={formData.guest.dni} onChange={handleGuestChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="text" name="telefono" placeholder="Teléfono" required value={formData.guest.telefono} onChange={handleGuestChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="email" name="email" placeholder="Correo electrónico (para recibir el código)" required value={formData.guest.email} onChange={handleGuestChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                  <input type="text" name="pais_localidad" placeholder="País o Localidad" required value={formData.guest.pais_localidad} onChange={handleGuestChange} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>

                {/* Adicionales (Estacionamiento y Carpa) */}
                <h3 style={{ margin: '10px 0 0 0', color: '#2c3e50' }}>Adicionales Diarios (Opcionales)</h3>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" onChange={() => handleAdicionalChange('estacionamiento', 1500)} />
                    Espacio para Estacionamiento de Auto ($1,500/día)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" onChange={() => handleAdicionalChange('alquiler_carpa', 3000)} />
                    Alquiler de Carpa del Camping ($3,000/día)
                  </label>
                </div>

                <button type="submit" disabled={cargandoEnvio} style={{ padding: '12px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                  {cargandoEnvio ? 'Generando Solicitud...' : 'Confirmar y Enviar Solicitud de Reserva'}
                </button>

              </form>
            )}

          </div>
        ) : (
          /* Pantalla de éxito al generar solicitud */
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircle size={60} color="#2e7d32" style={{ marginBottom: '15px' }} />
            <h2 style={{ color: '#2e7d32' }}>¡Solicitud Creada con Éxito!</h2>
            <p>Hemos registrado tu solicitud de reserva en el sistema. Tu código privado de acceso es:</p>
            
            <div style={{ background: '#e8f5e9', border: '2px dashed #2e7d32', padding: '15px', fontSize: '1.8rem', fontWeight: 'bold', color: '#1b5e20', display: 'inline-block', margin: '20px 0', borderRadius: '8px' }}>
              {resultadoReserva.codigo_privado}
            </div>

            <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto 20px auto' }}>
              Guarda este código. Te lo hemos enviado por correo electrónico. Podrás usarlo en nuestra sección de consulta para ver el estado de tu reserva e iniciar el pago online.
            </p>

            <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Realizar Otra Solicitud
            </button>
          </div>
        )}

      </main>
    </div>
  );
}