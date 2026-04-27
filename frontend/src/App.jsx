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

// Estilos globales
import "./App.css";

// =========================
// COMPONENTE PRINCIPAL
// =========================

function App() {

  // =========================
  // ESTADO DE NAVEGACIÓN
  // =========================

  // Controla qué pantalla se muestra:
  // "login" | "registro" | "tareas"
  const [vista, setVista] = useState("login");

  // =========================
  // FUNCIÓN PARA CAMBIAR VISTA (PROTEGIDA)
  // =========================

  const cambiarVista = (nuevaVista) => {

    // Obtiene token del navegador
    const token = localStorage.getItem("token");

    // 🔐 PROTECCIÓN DE RUTA
    // Si intenta entrar a "tareas" sin token → lo manda a login
    if (nuevaVista === "tareas" && !token) {
      setVista("login");
      return;
    }

    // Cambia la vista normalmente
    setVista(nuevaVista);
  };

  // =========================
  // AUTO LOGIN
  // =========================

  useEffect(() => {

    // Revisa si ya hay token guardado
    const token = localStorage.getItem("token");

    // Si existe → entra directo a tareas
    if (token) {
      setVista("tareas");
    }

  }, []);

  // =========================
  // DEBUG
  // =========================

  console.log("VISTA ACTUAL:", vista);

  // =========================
  // RENDER CONDICIONAL
  // =========================

  // Dependiendo del estado "vista", muestra un componente distinto

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

// =========================
// EXPORTACIÓN
// =========================

export default App;