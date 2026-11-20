// frontend/src/pages/Landing.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, AlertCircle } from 'lucide-react';
import './Landing.css';

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    fecha_ingreso: '',
    fecha_salida: '',
    cantidad_personas: 2,
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

  // Efecto para animaciones de aparición por scroll
  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window) {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12 }
      );

      revealElements.forEach((el) => revealObserver.observe(el));
    } else {
      revealElements.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);

  // Función para forzar el scroll suave hacia cualquier sección por ID
  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 1. Consultar disponibilidad
  const verificarDisponibilidad = async (e) => {
    e.preventDefault();
    if (!formData.fecha_ingreso || !formData.fecha_salida) {
      alert('Por favor selecciona la fecha de ingreso y salida.');
      return;
    }

    setBuscandoDisponibilidad(true);
    setErrorMensaje('');
    
    try {
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

  const handleGuestChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      guest: { ...prev.guest, [name]: value }
    }));
  };

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
    <div className="landing-page">
      <main className="hero" id="inicio">
        <div className="hero__image" aria-hidden="true"></div>
        <div className="hero__shade" aria-hidden="true"></div>

        <header className="site-header">
          <a className="brand" href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')} aria-label="Tierra Adentro, inicio">
            <svg className="brand__mark" viewBox="0 0 54 54" fill="none" aria-hidden="true">
              <path d="M27 4 5 39h44L27 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="m27 4 0 35M16 21h22M11 30h32M20 39l7-12 7 12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="m5 39 9-8 7 8M49 39l-9-8-7 8" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
            <span className="brand__copy">
              <strong>Tierra Adentro</strong>
              <small>CAMPING · NATURALEZA · ENCUENTRO</small>
            </span>
          </a>

          <button 
            className="menu-toggle" 
            aria-label="Abrir menú" 
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span><span></span>
          </button>

          <nav className={`navigation ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación principal">
            <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')}>Inicio</a>
            <a href="#camping" onClick={(e) => scrollToSection(e, 'camping')}>El camping</a>
            <a href="#instalaciones" onClick={(e) => scrollToSection(e, 'instalaciones')}>Instalaciones</a>
            <a href="#experiencias" onClick={(e) => scrollToSection(e, 'experiencias')}>Experiencias</a>
            <a href="#galeria" onClick={(e) => scrollToSection(e, 'galeria')}>Galería</a>
            <a href="#contacto" onClick={(e) => scrollToSection(e, 'contacto')}>Contacto</a>
            <a className="nav-cta" href="#contacto" onClick={(e) => scrollToSection(e, 'contacto')}>Consultar disponibilidad <span>↗</span></a>
          </nav>
        </header>

        <div className="hero__content">
          <p className="eyebrow"><span></span> UN RESPIRO. UN ENCUENTRO. UN LUGAR.</p>
          <h1>Desconectá<br/>del ruido.<br/>Conectá con<br/>la naturaleza.</h1>
          <p className="hero__description">Un refugio entre árboles, paisajes y momentos<br className="desktop-break"/> que merecen quedarse para siempre.</p>
          <div className="hero__actions">
            <a className="button button--gold" href="#camping" onClick={(e) => scrollToSection(e, 'camping')}>Descubrí el camping <span>↗</span></a>
            <a className="button button--text" href="#experiencias" onClick={(e) => scrollToSection(e, 'experiencias')}>Viví la experiencia <span>↗</span></a>
          </div>
        </div>

        <div className="side-note">MÁS NATURALEZA. MENOS PRISA.</div>
        <a className="scroll-cue" href="#camping" onClick={(e) => scrollToSection(e, 'camping')}><span>BAJÁ UN CAMBIO</span><b>↓</b></a>
        <div className="wave" aria-hidden="true">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,44 C150,8 235,18 360,48 C500,82 590,82 720,52 C850,20 925,10 1050,37 C1180,66 1300,88 1440,40 L1440,90 L0,90 Z"/>
          </svg>
        </div>
      </main>

      {/* Sección 2: El camping */}
      <section className="camping-section" id="camping">
        <div className="camping-container">
          <div className="camping-header reveal">
            <div className="camping-header__text">
              <p className="eyebrow eyebrow--camping"><span></span> BIENVENIDOS A TIERRA ADENTRO</p>
              <h2>Un lugar para volver<br/>a lo <em>esencial.</em></h2>
            </div>
            <div className="camping-header__deco" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M23 47V34" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M23 35c-5.5 0-9.5-3.8-9.5-8.8 0-4.2 3-7.7 7-8.5 1.3-2.5 4-4.2 7-4.2 3.6 0 6.7 2.4 7.6 5.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M40 47v-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                <path d="M40 12 28 28h7l-6 14h22l-6-14h7L40 12Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="camping-grid">
            <div className="camping-media reveal">
              <div className="camping-media__stack">
                <figure className="camping-photo camping-photo--main">
                  <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=85" alt="Carpas iluminadas entre pinos al atardecer en Tierra Adentro" loading="lazy"/>
                </figure>
                <figure className="camping-photo camping-photo--secondary">
                  <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=85" alt="Mesa preparada al aire libre en medio del bosque" loading="lazy"/>
                </figure>
              </div>
              <p className="camping-caption">AIRE PURO.<br/>ALMA TRANQUILA.</p>
            </div>

            <div className="camping-content reveal">
              <span className="camping-kicker">EL CAMPING</span>
              <h3>Lejos del ruido.<br/>Cerca de lo que importa.</h3>
              <p className="camping-paragraph">Entre senderos, noches estrelladas y mañanas llenas de aire puro, Tierra Adentro te invita a vivir una experiencia diferente.</p>
              <p className="camping-paragraph">Ya sea que vengas en familia, con amigos o buscando tranquilidad, tenemos un lugar para vos.</p>
              <a className="button button--outline" href="#instalaciones" onClick={(e) => scrollToSection(e, 'instalaciones')}>
                Conocé nuestro lugar <span>↗</span>
              </a>
              <hr className="camping-divider"/>
              <ul className="camping-pillars">
                <li>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Naturaleza</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span>Tranquilidad</span>
                </li>
                <li>
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M3 20h18L12 4 3 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    <path d="M12 4v16M9 20l3-6 3 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                  <span>Aventura</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 3: Instalaciones */}
      <section className="facilities-section" id="instalaciones">
        <div className="facilities-container">
          <div className="facilities-header reveal">
            <div className="facilities-header__text">
              <p className="eyebrow eyebrow--facilities"><span></span> SIMPLE, CÓMODO, NATURAL</p>
              <h2>Todo lo que necesitás<br/>para disfrutar.</h2>
            </div>
            <div className="facilities-header__note" aria-hidden="true">
              <span>El encanto de estar al aire libre.</span>
              <span>La comodidad de sentirte en tu lugar.</span>
            </div>
          </div>

          <div className="facilities-grid">
            <article className="facility-card reveal">
              <div className="facility-card__media">
                <span className="facility-badge">01</span>
                <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=85" alt="Zona de acampe" loading="lazy"/>
              </div>
              <div className="facility-card__footer">
                <div>
                  <h3>Zona de acampe</h3>
                  <p>Entre árboles, con aire puro y espacio para desconectar.</p>
                </div>
                <span className="facility-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M3 20h18L12 4 3 20Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
                </span>
              </div>
            </article>

            <article className="facility-card reveal">
              <div className="facility-card__media">
                <span className="facility-badge">02</span>
                <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85" alt="Baños y duchas" loading="lazy"/>
              </div>
              <div className="facility-card__footer">
                <div>
                  <h3>Baños y duchas</h3>
                  <p>La comodidad de lo esencial, también al aire libre.</p>
                </div>
                <span className="facility-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M4 12h16M12 4v16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </span>
              </div>
            </article>

            <article className="facility-card reveal">
              <div className="facility-card__media">
                <span className="facility-badge">03</span>
                <img src="https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=85" alt="Parrillas" loading="lazy"/>
              </div>
              <div className="facility-card__footer">
                <div>
                  <h3>Parrillas</h3>
                  <p>El encuentro empieza cuando compartimos la mesa.</p>
                </div>
                <span className="facility-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4"/></svg>
                </span>
              </div>
            </article>

            <article className="facility-card reveal">
              <div className="facility-card__media">
                <span className="facility-badge">04</span>
                <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=85" alt="Espacios recreativos" loading="lazy"/>
              </div>
              <div className="facility-card__footer">
                <div>
                  <h3>Espacios recreativos</h3>
                  <p>Tiempo para jugar, charlar y disfrutar sin apuro.</p>
                </div>
                <span className="facility-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </span>
              </div>
            </article>

            <article className="facility-card reveal">
              <div className="facility-card__media">
                <span className="facility-badge">05</span>
                <img src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=85" alt="Sector de fogones" loading="lazy"/>
              </div>
              <div className="facility-card__footer">
                <div>
                  <h3>Sector de fogones</h3>
                  <p>Historias, buena compañía y el calor de una fogata.</p>
                </div>
                <span className="facility-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </span>
              </div>
            </article>

            <article className="facility-card reveal">
              <div className="facility-card__media">
                <span className="facility-badge">06</span>
                <img src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=85" alt="Estacionamiento" loading="lazy"/>
              </div>
              <div className="facility-card__footer">
                <div>
                  <h3>Estacionamiento</h3>
                  <p>Llegá, dejá el auto y empezá a bajar un cambio.</p>
                </div>
                <span className="facility-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.4"/></svg>
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Sección 4: Experiencias */}
      <section className="experiences-section" id="experiencias">
        <div className="experiences-container">
          <div className="experiences-header reveal">
            <div className="experiences-header__text">
              <p className="eyebrow eyebrow--experiences"><span></span> COLECCIONÁ MOMENTOS, NO COSAS</p>
              <h2>Mucho más que una noche<br/>bajo las <em>estrellas.</em></h2>
            </div>
            <div className="experiences-header__note">
              <span>Acá, los mejores planes</span>
              <span>son los más simples.</span>
            </div>
          </div>

          <div className="experiences-grid">
            <article className="experience-card experience-card--wide reveal">
              <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=85" alt="Caminatas por bosques" loading="lazy"/>
              <div className="experience-card__shade"></div>
              <div className="experience-card__content">
                <span className="experience-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 3v18M8 9l4-6 4 6M6 15l6-8 6 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <h3>Caminatas por bosques</h3>
                <p>Seguí el ritmo de la naturaleza.</p>
              </div>
            </article>

            <article className="experience-card reveal">
              <img src="https://images.unsplash.com/photo-1504851149312-7a075b496cc7?auto=format&fit=crop&w=800&q=85" alt="Atardeceres" loading="lazy"/>
              <div className="experience-card__shade"></div>
              <div className="experience-card__content">
                <span className="experience-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </span>
                <h3>Atardeceres</h3>
                <p>El día se despide distinto acá.</p>
              </div>
            </article>

            <article className="experience-card reveal">
              <img src="https://images.unsplash.com/photo-1475483768296-6163e08872a1?auto=format&fit=crop&w=800&q=85" alt="Noches de fogata" loading="lazy"/>
              <div className="experience-card__shade"></div>
              <div className="experience-card__content">
                <span className="experience-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 2c.5 3.5-2 5.5-2 8.5a4 4 0 0 0 8 0c0-2.5-1.5-4.5-3-6.5-.5 2-1.5 3-3 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <h3>Noches de fogata</h3>
                <p>Historias que abrigan.</p>
              </div>
            </article>

            <article className="experience-card experience-card--wide reveal">
              <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=85" alt="Observación de estrellas" loading="lazy"/>
              <div className="experience-card__shade"></div>
              <div className="experience-card__content">
                <span className="experience-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3ZM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
                </span>
                <h3>Observación de estrellas</h3>
                <p>Mirar arriba y olvidar todo lo demás.</p>
              </div>
            </article>

            <article className="experience-card reveal">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85" alt="Desayunos al aire libre" loading="lazy"/>
              <div className="experience-card__shade"></div>
              <div className="experience-card__content">
                <span className="experience-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <h3>Desayunos al aire libre</h3>
                <p>Las mañanas, sin prisa.</p>
              </div>
            </article>

            <article className="experience-card reveal">
              <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=85" alt="Momentos de relax" loading="lazy"/>
              <div className="experience-card__shade"></div>
              <div className="experience-card__content">
                <span className="experience-card__icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <h3>Momentos de relax</h3>
                <p>No hacer nada también es un plan.</p>
              </div>
            </article>
          </div>
        </div>

        <div className="experiences-wave" aria-hidden="true">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C180,12 310,65 510,55 C710,45 840,12 1040,38 C1240,64 1350,48 1440,35 L1440,90 L0,90 Z"/>
          </svg>
        </div>
      </section>

      {/* Cinta dorada de valores */}
      <div className="experiences-ribbon" aria-label="Valores de Tierra Adentro">
        <div className="experiences-ribbon__track">
          
          <span>AIRE PURO</span>
          <b>✳</b>
          <span>BUENA COMPAÑÍA</span>
          <b>✳</b>
          <span>NOCHES ESTRELLADAS</span>
          <b>✳</b>
          <span>TIEMPO PARA VOS</span>
          
        </div>
      </div>

      {/* Sección 5: Galería */}
      <section className="gallery-section" id="galeria">
        <div className="gallery-container">
          <div className="gallery-header reveal">
            <div className="gallery-header__text">
              <p className="eyebrow eyebrow--gallery"><span></span> UN POQUITO DE LO QUE TE ESPERA</p>
              <h2>Postales de<br/><em>Tierra Adentro.</em></h2>
            </div>
            <div className="gallery-header__note">
              <span>Hay lugares que se sienten.</span>
              <span>Estas imágenes te acercan un poquito.</span>
            </div>
          </div>

          <div className="gallery-grid">
            <figure className="gallery-item gallery-item--top-left reveal">
              <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1000&q=85" alt="Carpas iluminadas entre pinos al atardecer" loading="lazy"/>
            </figure>

            <figure className="gallery-item gallery-item--tall-center reveal">
              <img src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=85" alt="Bosques frondosos y mesa al aire libre" loading="lazy"/>
              <figcaption className="gallery-item__label">
                <span>Bosques frondosos</span>
                <b>↗</b>
              </figcaption>
            </figure>

            <figure className="gallery-item gallery-item--top-right reveal">
              <img src="https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=85" alt="Fogata nocturna en el camping" loading="lazy"/>
            </figure>

            <figure className="gallery-item gallery-item--tall-left reveal">
              <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=85" alt="Carpas bajo el cielo estrellado" loading="lazy"/>
            </figure>

            <figure className="gallery-item gallery-item--mid-center reveal">
              <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=85" alt="Sector de mesas y descanso entre árboles" loading="lazy"/>
            </figure>

            <figure className="gallery-item gallery-item--mid-right reveal">
              <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=85" alt="Sendero verde en medio del bosque" loading="lazy"/>
            </figure>

            <figure className="gallery-item gallery-item--bottom-center reveal">
              <img src="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1000&q=85" alt="Carpa frente al amanecer en la montaña" loading="lazy"/>
            </figure>

            <figure className="gallery-item gallery-item--bottom-right reveal">
              <img src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=85" alt="Encuentro y picnic al aire libre" loading="lazy"/>
            </figure>
          </div>

          <div className="gallery-footer reveal">
            <span>Una invitación a imaginar tu próxima escapada.</span>
            <span className="gallery-footer__tag">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v18M8 9l4-6 4 6M6 15l6-8 6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Fotografías ilustrativas
            </span>
          </div>
        </div>
      </section>

      {/* Banner cierre nocturno previo a Contacto */}
      <section className="offline-banner">
        <div className="offline-banner__image" aria-hidden="true"></div>
        <div className="offline-banner__shade" aria-hidden="true"></div>
        <div className="offline-banner__content reveal">
          <p className="eyebrow eyebrow--offline"><span></span> LOS MEJORES MOMENTOS SON OFFLINE</p>
          <h2>El mejor recuerdo<br/>no necesita <em>WiFi.</em></h2>
          <p className="offline-banner__sub">Solo buena compañía, naturaleza y tiempo para disfrutar.</p>
          <a className="button button--gold button--sm" href="#contacto-form" onClick={(e) => scrollToSection(e, 'contacto-form')}>Quiero vivirlo <span>↗</span></a>
        </div>
        <div className="offline-banner__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C220,10 380,68 620,52 C860,36 1080,10 1440,42 L1440,90 L0,90 Z"/>
          </svg>
        </div>
      </section>

      {/* Sección 6: Contacto y Motor de Reserva */}
      <section className="contact-section" id="contacto">
        <div className="contact-container" id="contacto-form">
          
          {/* Columna izquierda */}
          <div className="contact-info reveal">
            <p className="eyebrow eyebrow--contact"><span></span> HAGAMOS LUGAR PARA TU ESCAPADA</p>
            <h2>Tu próxima<br/>aventura<br/>empieza <em>acá.</em></h2>
            <p className="contact-info__desc">
              ¿Estás pensando en visitarnos? Consultá la disponibilidad de nuestras parcelas o cabañas e iniciá tu reserva.
            </p>

            <a className="whatsapp-link" href="https://wa.me/5491100000000" target="_blank" rel="noopener noreferrer">
              <span className="whatsapp-link__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="whatsapp-link__text">
                <strong>¿Preferís hablar por WhatsApp?</strong>
                <small>Atención personalizada</small>
              </span>
            </a>

            <div className="contact-info__deco" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <path d="M24 54C16 42 18 22 44 10c4 24-4 38-20 44Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                <path d="M16 58c8-14 16-28 28-48" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {/* Columna derecha: Motor de Reserva Integrado */}
          <div className="reveal" style={{ width: '100%' }}>
            {!resultadoReserva ? (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#1b382e', fontFamily: 'Manrope, sans-serif', fontSize: '1.6rem' }}>
                  Solicita tu Reserva
                </h3>

                {errorMensaje && (
                  <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '5px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                    <AlertCircle size={20} /> {errorMensaje}
                  </div>
                )}

                {/* Paso 1: Fechas y Personas */}
                <form onSubmit={verificarDisponibilidad} className="availability-step" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '25px' }}>
                  <div className="form-row">
                    <div className="form-field">
                      <label>Fecha de Ingreso *</label>
                      <input 
                        type="date" 
                        required 
                        value={formData.fecha_ingreso} 
                        onChange={e => setFormData({...formData, fecha_ingreso: e.target.value})} 
                      />
                    </div>
                    <div className="form-field">
                      <label>Fecha de Salida *</label>
                      <input 
                        type="date" 
                        required 
                        value={formData.fecha_salida} 
                        onChange={e => setFormData({...formData, fecha_salida: e.target.value})} 
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Cantidad de Personas *</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      required 
                      value={formData.cantidad_personas} 
                      onChange={e => setFormData({...formData, cantidad_personas: e.target.value})} 
                    />
                  </div>

                  <button type="submit" disabled={buscandoDisponibilidad} className="button button--gold button--submit" style={{ width: '100%', marginTop: '5px' }}>
                    {buscandoDisponibilidad ? 'Buscando...' : 'Ver Disponibilidad ↗'}
                  </button>
                </form>

                {/* Paso 2: Formulario Completo al encontrar alojamiento */}
                {tiposDisponibles.length > 0 && (
                  <form onSubmit={handleSubmitReserva} className="contact-form" style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
                    
                    <div className="form-field">
                      <label>Selecciona Tipo de Alojamiento Disponible *</label>
                      <select 
                        required 
                        value={formData.tipo_alojamiento} 
                        onChange={e => setFormData({...formData, tipo_alojamiento: e.target.value})}
                      >
                        <option value="">-- Elige una opción con disponibilidad --</option>
                        {tiposDisponibles.includes('parcela_comun') && <option value="parcela_comun">Parcela Común (Para carpa familiar)</option>}
                        {tiposDisponibles.includes('cabana_1_ambiente') && <option value="cabana_1_ambiente">Cabaña de 1 Ambiente</option>}
                        {tiposDisponibles.includes('cabana_2_ambientes') && <option value="cabana_2_ambientes">Cabaña de 2 Ambientes</option>}
                      </select>
                    </div>

                    <h4 style={{ margin: '10px 0 0 0', color: '#1b382e', fontFamily: 'Manrope, sans-serif' }}>Datos del Titular</h4>
                    
                    <div className="form-row">
                      <div className="form-field">
                        <label>Nombre *</label>
                        <input type="text" name="nombre" required value={formData.guest.nombre} onChange={handleGuestChange} placeholder="Nombre" />
                      </div>
                      <div className="form-field">
                        <label>Apellido *</label>
                        <input type="text" name="apellido" required value={formData.guest.apellido} onChange={handleGuestChange} placeholder="Apellido" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label>DNI o Pasaporte *</label>
                        <input type="text" name="dni" required value={formData.guest.dni} onChange={handleGuestChange} placeholder="DNI o Pasaporte" />
                      </div>
                      <div className="form-field">
                        <label>Teléfono *</label>
                        <input type="text" name="telefono" required value={formData.guest.telefono} onChange={handleGuestChange} placeholder="Teléfono" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-field">
                        <label>Correo Electrónico *</label>
                        <input type="email" name="email" required value={formData.guest.email} onChange={handleGuestChange} placeholder="tu@email.com" />
                      </div>
                      <div className="form-field">
                        <label>País o Localidad *</label>
                        <input type="text" name="pais_localidad" required value={formData.guest.pais_localidad} onChange={handleGuestChange} placeholder="Localidad" />
                      </div>
                    </div>

                    <h4 style={{ margin: '10px 0 0 0', color: '#1b382e', fontFamily: 'Manrope, sans-serif' }}>Adicionales Diarios (Opcionales)</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" onChange={() => handleAdicionalChange('estacionamiento', 1500)} />
                        Espacio para Estacionamiento de Auto ($1,500/día)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" onChange={() => handleAdicionalChange('alquiler_carpa', 3000)} />
                        Alquiler de Carpa del Camping ($3,000/día)
                      </label>
                    </div>

                    <div className="form-footer" style={{ marginTop: '15px' }}>
                      <p className="form-note">* Campos obligatorios.</p>
                      <button type="submit" disabled={cargandoEnvio} className="button button--gold button--submit">
                        {cargandoEnvio ? 'Generando...' : 'Confirmar Reserva ↗'}
                      </button>
                    </div>

                  </form>
                )}

              </div>
            ) : (
              /* Pantalla de éxito al generar solicitud */
              <div className="success-box">
                <CheckCircle size={55} color="#2e7d32" style={{ marginBottom: '10px' }} />
                <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0', fontFamily: 'Manrope, sans-serif' }}>¡Solicitud Creada con Éxito!</h3>
                <p style={{ fontSize: '0.95rem', color: '#333', margin: '0 0 15px 0' }}>Hemos registrado tu solicitud. Tu código privado de acceso es:</p>
                
                <div style={{ background: '#fff', border: '2px dashed #2e7d32', padding: '12px 20px', fontSize: '1.6rem', fontWeight: 'bold', color: '#1b5e20', display: 'inline-block', margin: '10px 0', borderRadius: '6px', letterSpacing: '2px' }}>
                  {resultadoReserva.codigo_privado}
                </div>

                <p style={{ fontSize: '0.9rem', color: '#555', maxWidth: '400px', margin: '15px auto' }}>
                  Te lo hemos enviado por correo electrónico. Podés ingresar directamente al portal del huésped haciendo clic abajo para ver el estado o realizar el pago.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
                  <Link to={`/portal/${resultadoReserva.codigo_privado}`} className="button button--gold button--sm" style={{ textDecoration: 'none' }}>
                    Ir al Portal del Huésped ↗
                  </Link>
                  <button onClick={() => window.location.reload()} className="button button--outline" style={{ color: '#2e7d32', borderColor: '#2e7d32' }}>
                    Nueva Solicitud
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}