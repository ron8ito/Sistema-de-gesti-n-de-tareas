import { useState } from "react";
import { loginUser } from "../services/api";

function Login() {
  console.log("Login cargado");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("click login");

    try {
      const data = await loginUser(username, password);
      console.log("Respuesta:", data);
      localStorage.setItem("token", data.access_token);
      alert("Login exitoso");
      window.location.href = "/tareas";
    } catch (error) {
      console.error(error);
      alert("Error en login");
    }
  };

  return (
    <div>
      <h2>Login</h2>

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
    </div>
  );
}

export default Login;