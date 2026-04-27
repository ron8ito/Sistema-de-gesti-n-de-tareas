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

  // Guarda el usuario ingresado
  const [username, setUsername] = useState("");

  // Guarda la contraseña ingresada
  const [password, setPassword] = useState("");

  // =========================
  // LOGIN NORMAL (usuario + contraseña)
  // =========================

  const handleLogin = async () => {
    try {

      // Llama al backend para validar credenciales
      const data = await loginUser(username, password);

      // Guarda el token JWT en el navegador
      // Este token identifica al usuario en futuras peticiones
      localStorage.setItem("token", data.access_token);

      // Cambia la vista a la pantalla de tareas
      cambiarVista("tareas");

      alert("Login exitoso");

    } catch (error) {

      // Manejo de errores (credenciales incorrectas, etc)
      console.error("Error login:", error);
      alert("Credenciales incorrectas");
    }
  };

  // =========================
  // LOGIN CON GOOGLE (OAUTH)
  // =========================

  const handleGoogleLogin = async (credentialResponse) => {
    try {

      // Verifica que Google haya enviado el token
      if (!credentialResponse?.credential) {
        throw new Error("No se recibió credential de Google");
      }

      // Envía el token de Google al backend
      const res = await fetch(
        "https://sistema-de-gesti-n-de-tareas-bgsu.onrender.com/google-login",
        {
          method: "POST",

          // Indica que se enviará JSON
          headers: {
            "Content-Type": "application/json",
          },

          // Se envía el token de Google
          body: JSON.stringify({
            credential: credentialResponse.credential,
          }),
        }
      );

      // Convierte la respuesta a JSON
      const data = await res.json();

      // Si el backend responde con error
      if (!res.ok) {
        throw new Error(data.detail || "Error en Google login");
      }

      // =========================
      // GUARDAR TOKEN
      // =========================

      // Guarda el JWT recibido del backend
      localStorage.setItem("token", data.access_token);

      // Redirige a tareas
      cambiarVista("tareas");

      alert("Login con Google exitoso");

    } catch (error) {

      // Manejo de errores
      console.error("Error Google login:", error);
      alert("Error con Google");
    }
  };

  // =========================
  // UI (INTERFAZ)
  // =========================

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        {/* Título */}
        <h2>Iniciar sesión</h2>

        {/* INPUT USUARIO */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}

          // Actualiza el estado al escribir
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* INPUT CONTRASEÑA */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}

          // Actualiza el estado al escribir
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BOTÓN LOGIN NORMAL */}
        <button onClick={handleLogin}>
          Ingresar
        </button>

        {/* =========================
            BOTÓN GOOGLE LOGIN
        ========================= */}
        <div style={{ marginTop: "15px" }}>
          <GoogleLogin

            // Se ejecuta cuando login es exitoso
            onSuccess={handleGoogleLogin}

            // Se ejecuta si falla Google
            onError={() => {
              console.log("Error con Google");
              alert("Error con Google");
            }}

            // Evita login automático
            useOneTap={false}

            // Fuerza selección de cuenta
            prompt="select_account"
          />
        </div>

        {/* BOTÓN IR A REGISTRO */}
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