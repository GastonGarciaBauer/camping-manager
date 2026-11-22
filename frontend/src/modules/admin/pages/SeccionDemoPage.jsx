export function SeccionDemoPage({ section }) {
  return (
    <section className="panel section-placeholder">
      <h2>Sección {section}</h2>
      <p>
        El marco superior (Topbar + encabezado y botón Nueva reserva) y la barra lateral
        permanecen fijos; acá podés montar el contenido específico de {section}.
      </p>
    </section>
  );
}