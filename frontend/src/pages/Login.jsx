import { useState } from "react";
import { loginUser } from "../Services/api";
import { GoogleLogin } from "@react-oauth/google";

function Login({ cambiarVista }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // 🔐 LOGIN NORMAL
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

  // 🔥 LOGIN CON GOOGLE
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

      // 🔐 Guardar token
      localStorage.setItem("token", data.access_token);

      cambiarVista("tareas");
      alert("Login con Google exitoso");

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

        {/* 🔥 GOOGLE */}
        <div style={{ marginTop: "15px" }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => {
              console.log("Error con Google");
              alert("Error con Google");
            }}
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