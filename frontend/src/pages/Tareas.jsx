import { useEffect, useState } from "react";
import { getTareas } from "../services/api";

function Tareas() {
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    const cargarTareas = async () => {
      try {
        const data = await getTareas();
        console.log("TAREAS:", data);
        setTareas(data);
      } catch (error) {
        console.error(error);
      }
    };

    cargarTareas();
  }, []);

  return (
    <div>
      <h2>Mis tareas</h2>

      {tareas.length === 0 ? (
        <p>No hay tareas</p>
      ) : (
        tareas.map((t) => (
          <div key={t.id}>
            <h4>{t.titulo}</h4>
            <p>{t.descripcion}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Tareas;