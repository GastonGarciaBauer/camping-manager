import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import "../styles/admin.css";
import "../styles/admin-login.css";

export function AdminLoginPage({ onLoginSuccess, onShowToast }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submittingLogin, setSubmittingLogin] = useState(false);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRepeatPassword, setNewAdminRepeatPassword] = useState("");
  const [submittingRegister, setSubmittingRegister] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [registerMsg, setRegisterMsg] = useState("");

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg("");
    setSubmittingLogin(true);

    try {
      const response = await api.post("/index.php?endpoint=admin", {
        action: "login",
        email: email.trim(),
        password,
      });

      const data = response.data || {};
      if (data.status === "success") {
        localStorage.setItem(
          "tierra_adentro_admin",
          JSON.stringify(data.user || { email: email.trim() })
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
      setSubmittingLogin(false);
    }
  };

  const handleRegisterAdmin = async (event) => {
    event.preventDefault();
    setRegisterMsg("");
    setErrorMsg("");

    if (newAdminPassword !== newAdminRepeatPassword) {
      setRegisterMsg("Las contraseñas no coinciden.");
      return;
    }

    setSubmittingRegister(true);
    try {
      const response = await api.post("/index.php?endpoint=admin", {
        action: "register_admin",
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        repeat_password: newAdminRepeatPassword,
      });

      const data = response.data || {};
      if (data.status === "success") {
        setNewAdminEmail("");
        setNewAdminPassword("");
        setNewAdminRepeatPassword("");
        setRegisterMsg("Administrador guardado correctamente en la base de datos.");
        if (onShowToast) {
          onShowToast("Nuevo administrador agregado.");
        }
      } else {
        setRegisterMsg(data.error || "No se pudo agregar el administrador.");
      }
    } catch (error) {
      const apiError = error.response?.data?.error;
      setRegisterMsg(apiError || "Error al guardar el administrador.");
    } finally {
      setSubmittingRegister(false);
    }
  };

  return (
    <div className="admin-page admin-login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <span className="login-overline">TIERRA ADENTRO · ADMINISTRACIÓN</span>
          <h1>Ingresar al panel</h1>
          <p>Accedé con tus credenciales para gestionar el camping.</p>
        </div>

        <form className="login-form" onSubmit={handleLoginSubmit}>
          <label className="login-field">
            <span>Email</span>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin o correo@ejemplo.com"
              autoComplete="username"
              required
            />
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>

          {errorMsg && <p className="login-alert is-error">{errorMsg}</p>}

          <button
            type="submit"
            className="login-primary-btn"
            disabled={submittingLogin}
          >
            {submittingLogin ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="login-demo-hint">
          <span>
            Usuario de prueba: <strong>admin</strong> · Contraseña: <strong>admin</strong>
          </span>
        </div>

        <div className="login-divider" />

        <div className="add-admin-section">
          <button
            type="button"
            className="login-secondary-btn"
            onClick={() => {
              setShowAddAdmin((prev) => !prev);
              setRegisterMsg("");
            }}
          >
            {showAddAdmin ? "Ocultar formulario" : "+ Agregar administrador"}
          </button>

          {showAddAdmin && (
            <form className="add-admin-form" onSubmit={handleRegisterAdmin}>
              <label className="login-field">
                <span>Email</span>
                <input
                  type="text"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="nuevo.admin@ejemplo.com"
                  required
                />
              </label>

              <label className="login-field">
                <span>Contraseña</span>
                <input
                  type="password"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                />
              </label>

              <label className="login-field">
                <span>Repetir contraseña</span>
                <input
                  type="password"
                  value={newAdminRepeatPassword}
                  onChange={(e) => setNewAdminRepeatPassword(e.target.value)}
                  placeholder="Repetir contraseña"
                  required
                />
              </label>

              {registerMsg && (
                <p
                  className={`login-alert ${
                    registerMsg.includes("correctamente") ? "is-success" : "is-error"
                  }`}
                >
                  {registerMsg}
                </p>
              )}

              <button
                type="submit"
                className="login-save-btn"
                disabled={submittingRegister}
              >
                {submittingRegister ? "Guardando..." : "Guardar administrador"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}