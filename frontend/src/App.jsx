import { useState } from "react";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Tareas from "./pages/Tareas";
import "./App.css";

function App() {
  const [vista, setVista] = useState("login");

  console.log("VISTA ACTUAL:", vista);

  if (vista === "login") {
    return <Login cambiarVista={setVista} />;
  }

  if (vista === "registro") {
    return <Registro cambiarVista={setVista} />;
  }

  if (vista === "tareas") {
    return <Tareas />;
  }
}

export default App;