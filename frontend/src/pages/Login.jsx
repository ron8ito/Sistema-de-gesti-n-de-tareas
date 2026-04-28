// =========================================================
// COMPONENTE LOGIN (REACT)
// =========================================================
// Este componente permite al usuario:
// - Iniciar sesión con usuario y contraseña
// - Iniciar sesión con Google (OAuth)
// - Guardar el token JWT en el navegador
// - Navegar entre vistas (login / tareas / registro)
// =========================================================

// =========================
// IMPORTACIONES
// =========================

// Hook para manejar estados en React
import { useState } from "react";

// Función para hacer login al backend
import { loginUser } from "../Services/api";

// Componente oficial de login con Google
import { GoogleLogin } from "@react-oauth/google";

// 🔔 Librería para notificaciones
import toast from 'react-hot-toast';

// =========================
// COMPONENTE PRINCIPAL
// =========================

// Recibe como prop "cambiarVista" para navegar entre pantallas
function Login({ cambiarVista }) {

  // =========================
  // ESTADOS
  // =========================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // LOGIN NORMAL
  // =========================

  const handleLogin = async () => {
    try {

      const data = await loginUser(username, password);

      localStorage.setItem("token", data.access_token);

      cambiarVista("tareas");

      // ✅ Reemplazo de alert por toast
      toast.success("Login exitoso");

    } catch (error) {

      console.error("Error login:", error);

      // ✅ Reemplazo de alert por toast
      toast.error("Credenciales incorrectas");
    }
  };

  // =========================
  // LOGIN CON GOOGLE
  // =========================

  const handleGoogleLogin = async (credentialResponse) => {
    try {

      if (!credentialResponse?.credential) {
        throw new Error("No se recibió credential de Google");
      }

      const res = await fetch(
        "https://sistema-de-gesti-n-de-tareas-bgsu.onrender.com/google-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error en Google login");
      }

      localStorage.setItem("token", data.access_token);

      cambiarVista("tareas");

      // ✅ Notificación de éxito
      toast.success("Login exitoso");

    } catch (error) {

      console.error("Error Google login:", error);

      toast.error("Error al iniciar con Google");
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h2>Iniciar sesión</h2>

        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={handleLogin}>
          Ingresar
        </button>

        {/* 🔥 GOOGLE LOGIN */}
        <div style={{ marginTop: "15px" }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log("Error con Google");
              toast.error("Error con Google");
            }}
            useOneTap={false} // 🔥 Desactiva login automático problemático
            prompt="select_account" // 🔥 Fuerza selección de cuenta
          />
        </div>

        <button
          className="secondary"
          onClick={() => cambiarVista("registro")}
        >
          Ir a registro
        </button>

      </div>
    </div>
  );
}

// =========================
// EXPORTACIÓN
// =========================

export default Login;