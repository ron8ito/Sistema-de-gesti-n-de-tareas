import { useState } from "react";
import { loginUser } from "../Services/api";

function Login({ cambiarVista }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser(username, password);
      localStorage.setItem("token", data.access_token);
      cambiarVista("tareas");
      alert("Login exitoso");
    } catch (error) {
      console.error(error);
      alert("Error en login");
    }
  };

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

        <button onClick={handleLogin}>Ingresar</button>

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