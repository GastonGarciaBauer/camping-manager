import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function getStoredAdminEmail() {
  try {
    const raw = localStorage.getItem("tierra_adentro_admin");
    if (!raw) return "admin";
    const parsed = JSON.parse(raw);
    return parsed?.email || "admin";
  } catch {
    return "admin";
  }
}

export function Topbar({ activeSection }) {
  const navigate = useNavigate();
  const [popoverType, setPopoverType] = useState(null);

  useEffect(() => {
    if (!popoverType) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest("#topPopover, #notificationsButton, #userButton")) {
        setPopoverType(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [popoverType]);

  const togglePopover = (type) => {
    setPopoverType((prev) => (prev === type ? null : type));
  };

  const handleLogout = () => {
    localStorage.removeItem("tierra_adentro_admin");
    setPopoverType(null);
    navigate("/admin/login", { replace: true });
  };

  const adminEmail = getStoredAdminEmail();

  return (
    <header className="topbar">
      <div className="breadcrumbs">
        <span>Administración</span>
        <b>›</b>
        <strong>{activeSection}</strong>
      </div>

      <div className="top-actions">
        <button
          className="icon-button"
          id="notificationsButton"
          type="button"
          aria-label="Notificaciones"
          title="Notificaciones"
          onClick={() => togglePopover("notifications")}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <i />
        </button>

        <button
          className="user-chip"
          id="userButton"
          type="button"
          aria-label="Perfil de administración"
          onClick={() => togglePopover("profile")}
        >
          TA
        </button>

        {popoverType && (
          <div className="popover" id="topPopover">
            {popoverType === "notifications" ? (
              <>
                <strong>Notificaciones</strong>
                <p>No tenés notificaciones nuevas.</p>
              </>
            ) : (
              <>
                <strong>Administración</strong>
                <p>Camping Tierra Adentro</p>
                <p>Usuario: {adminEmail}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: "1px solid #dfddcf",
                    background: "#f3f0e7",
                    color: "#1d3e33",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}