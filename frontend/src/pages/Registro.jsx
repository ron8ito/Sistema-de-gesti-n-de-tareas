    import { useState } from "react";
    import { registrarUsuario } from "../services/api";

function Registro({cambiarVista}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegistro = async () => {
    try {
      await registrarUsuario({
        username,
        password,
      });

      alert("Usuario creado correctamente");

      // opcional: limpiar
      setUsername("");
      setPassword("");

    } catch (error) {
      console.error("ERROR REGISTRO:", error);
      alert("Error al registrar usuario");
    }
  };

  return (
    <div>
      <h2>Registro</h2>

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

      <button onClick={handleRegistro}>
        Registrarse
      </button>
      <button onClick={() => cambiarVista("login")}>
       Volver al login
      </button>
    </div>
  );
}

export default Registro;