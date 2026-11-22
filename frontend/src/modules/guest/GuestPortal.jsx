import { Link, useParams } from "react-router-dom";

export default function GuestPortal() {
  const { codigo } = useParams();

  return (
    <main style={{ padding: "40px 24px", maxWidth: 800, margin: "0 auto" }}>
      <p style={{ fontSize: 12, letterSpacing: "1.5px", textTransform: "uppercase" }}>
        Tierra Adentro · Portal del huésped
      </p>
      <h1>Consulta de reserva</h1>
      <p>
        {codigo
          ? `Código consultado desde la URL: ${codigo}`
          : "Ingresá tu código de reserva para ver los detalles de tu estadía."}
      </p>
      <Link to="/">Volver a la landing</Link>
    </main>
  );
}