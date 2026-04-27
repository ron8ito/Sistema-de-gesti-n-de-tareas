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

      alert("Login exitoso");

    } catch (error) {

      console.error("Error login:", error);
      alert("Credenciales incorrectas");
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

      alert("Login con Google exitoso");

    } catch (error) {

      console.error("Error Google login:", error);

      // 🔥 ahora muestra el error real si viene del backend
      alert(error.message || "Error con Google");
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
              alert("Error con Google");
            }}

            // 🔥 CLAVES PARA FORZAR SELECCIÓN DE CUENTA
            useOneTap={false}
            prompt="select_account"
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

export default Login;