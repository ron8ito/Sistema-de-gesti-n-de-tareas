import { useState } from "react";
import Login from "./pages/Login";
import Tareas from "./pages/Tareas";

function App() {
  const [isLogged, setIsLogged] = useState(
    !!localStorage.getItem("token")
  );

  return (
    <div>
      {isLogged ? <Tareas /> : <Login />}
    </div>
  );
}

export default App;