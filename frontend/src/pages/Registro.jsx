// =========================================================
// COMPONENTE REGISTER (REGISTRO DE USUARIO)
// =========================================================
// Este componente permite:
// - Registrar un nuevo usuario en el sistema
// - Enviar datos al backend (username, password)
// - Mostrar notificaciones visuales con toast
// =========================================================

// =========================
// IMPORTACIONES
// =========================

import { useState } from "react";
import { registrarUsuario } from "../Services/api";

// 🔔 Librería para notificaciones (reemplaza alert)
import toast from 'react-hot-toast';

// =========================
// COMPONENTE PRINCIPAL
// =========================

function Register({ cambiarVista }) {

  // =========================
  // ESTADOS DEL FORMULARIO
  // =========================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // =========================
  // FUNCIÓN DE REGISTRO
  // =========================

  const handleRegister = async () => {
    try {

      // 📡 Envío de datos al backend
      await registrarUsuario({
        username,
        password,
      });

      // ✅ Notificación de éxito
      toast.success("Usuario registrado correctamente");

    } catch (error) {

      // 🧠 Debug en consola
      console.log("ERROR COMPLETO:", error);
      console.log("MENSAJE:", error.message);

      // ❌ Notificación de error
      toast.error("Error al registrar usuario");
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h2>Crear cuenta</h2>

        {/* INPUT USUARIO */}
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* INPUT CONTRASEÑA */}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* BOTÓN REGISTRO */}
        <button onClick={handleRegister}>
          Registrarse
        </button>

        {/* VOLVER A LOGIN */}
        <button
          className="secondary"
          onClick={() => cambiarVista("login")}
        >
          Volver al login
        </button>

      </div>
    </div>
  );
}

// =========================
// EXPORTACIÓN
// =========================

export default Register;