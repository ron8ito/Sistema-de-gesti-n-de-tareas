import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Tareas from "./pages/Tareas";
import "./App.css";

function App() {
  const [vista, setVista] = useState("login");

  // 🔐 FUNCIÓN PROTEGIDA
  const cambiarVista = (nuevaVista) => {
    const token = localStorage.getItem("token");

    if (nuevaVista === "tareas" && !token) {
      setVista("login");
      return;
    }

    setVista(nuevaVista);
  };

  // 🔥 AUTO LOGIN SI HAY TOKEN
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setVista("tareas");
    }
  }, []);

  console.log("VISTA ACTUAL:", vista);

  if (vista === "login") {
    return <Login cambiarVista={cambiarVista} />;
  }

  if (vista === "registro") {
    return <Registro cambiarVista={cambiarVista} />;
  }

  if (vista === "tareas") {
    return <Tareas cambiarVista={cambiarVista} />;
  }
}

export default App;