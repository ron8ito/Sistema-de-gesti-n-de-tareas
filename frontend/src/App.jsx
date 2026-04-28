// =========================================================
// APP.JSX (COMPONENTE PRINCIPAL DE LA APLICACIÓN)
// =========================================================
// Este componente controla:
// - La navegación entre vistas (login, registro, tareas)
// - La protección de rutas (no entrar sin token)
// - El auto-login si el usuario ya tiene sesión activa
//
// No usa React Router, sino un sistema simple basado en estado
// =========================================================

// =========================
// IMPORTACIONES
// =========================

// Hooks de React
import { useState, useEffect } from "react";

// Componentes de páginas
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Tareas from "./pages/Tareas";
import { Toaster } from 'react-hot-toast';

// Estilos globales
import "./App.css";

// =========================
// COMPONENTE PRINCIPAL
// =========================

function App() {

  // =========================
  // ESTADO DE NAVEGACIÓN
  // =========================

  const [vista, setVista] = useState("login");

  // =========================
  // FUNCIÓN PARA CAMBIAR VISTA (PROTEGIDA)
  // =========================

  const cambiarVista = (nuevaVista) => {
    const token = localStorage.getItem("token");

    if (nuevaVista === "tareas" && !token) {
      setVista("login");
      return;
    }

    setVista(nuevaVista);
  };

  // =========================
  // AUTO LOGIN
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setVista("tareas");
    }
  }, []);

  // =========================
  // DEBUG
  // =========================

  console.log("VISTA ACTUAL:", vista);

  // =========================
  // RENDER CON TOASTER INCLUIDO
  // =========================

  return (
    <>
      <Toaster position="top-right" />

      {vista === "login" && <Login cambiarVista={cambiarVista} />}
      {vista === "registro" && <Registro cambiarVista={cambiarVista} />}
      {vista === "tareas" && <Tareas cambiarVista={cambiarVista} />}
    </>
  );
}

// =========================
// EXPORTACIÓN
// =========================

export default App;