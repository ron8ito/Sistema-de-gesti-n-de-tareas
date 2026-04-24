import { useState } from "react";
import { loginUser } from "../Services/api";
import { GoogleLogin } from "@react-oauth/google";

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

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const res = await fetch(
        "https://sistema-de-gesti-n-de-tareas-bgsu.onrender.com/google-login", // 👉 cambia luego a tu URL de Render
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

    } catch (error) {
      console.error("Error Google login:", error);
      alert("Error con Google");
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

        {/* 🔥 BOTÓN GOOGLE */}
        <div style={{ marginTop: "15px" }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log("Error con Google");
            }}
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