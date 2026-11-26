import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "../styles/admin.css";
import "../styles/admin-login.css";

export function AdminLoginPage({ onLoginSuccess, onShowToast }) {
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    try {
      const response = await api.post("/index.php?endpoint=admin", {
        action: "login",
        user: user.trim(),
        password,
      });

      const data = response.data || {};
      if (data.status === "success") {
        localStorage.setItem(
          "tierra_adentro_admin",
          JSON.stringify(data.user || { user: user.trim() })
        );
        if (onShowToast) {
          onShowToast("Bienvenido a Tierra Adentro.");
        }
        if (onLoginSuccess) {
          onLoginSuccess(data.user);
        }
        navigate("/admin", { replace: true });
      } else {
        setErrorMsg(data.error || "No se pudo iniciar sesión.");
      }
    } catch (error) {
      const apiError = error.response?.data?.error;
      setErrorMsg(apiError || "Error de conexión con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page admin-login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <span className="login-overline">TIERRA ADENTRO · ADMINISTRACIÓN</span>
          <h1>Ingresar al panel</h1>
          <p>Ingresá con usuario y contraseña para acceder.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Usuario</span>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="tu usuario"
              autoComplete="username"
              required
            />
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <div className="password-input-wrap">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="tu contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Ver contraseña"
                }
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.94 10.94 0 0 1 12 4.9c5 0 9.27 3.11 11 7.1a11.77 11.77 0 0 1-3.17 4.37M6.61 6.61A11.84 11.84 0 0 0 1 12c1.73 3.99 6 7.1 11 7.1 1.61 0 3.14-.33 4.53-.92"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M1 12s4-7.1 11-7.1S23 12 23 12s-4 7.1-11 7.1S1 12 1 12Z"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {errorMsg && <p className="login-alert is-error">{errorMsg}</p>}

          <button
            type="submit"
            className="login-primary-btn"
            disabled={submitting}
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}