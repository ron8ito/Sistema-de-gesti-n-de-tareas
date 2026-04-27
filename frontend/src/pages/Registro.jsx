// =========================================================
// COMPONENTE REGISTER (REGISTRO DE USUARIO)
// =========================================================

import { useState } from "react";
import { registrarUsuario } from "../Services/api";

function Register({ cambiarVista }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {

      await registrarUsuario({
        username,
        password,
      });

      alert("Usuario creado correctamente");
      cambiarVista("login");

    } catch (error) {

      console.log("ERROR COMPLETO:", error);
      console.log("MENSAJE:", error.message);

      // 🔥 ahora sí muestra el error real del backend
      alert("ERROR: " + error.message);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">

        <h2>Crear cuenta</h2>

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

        <button onClick={handleRegister}>
          Registrarse
        </button>

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

export default Register;