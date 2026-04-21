import { useEffect, useState } from "react";
import { getTareas, crearTarea, completarTarea } from "../services/api";

function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  useEffect(() => {
    cargarTareas();
  }, []);

  const cargarTareas = async () => {
    try {
      const data = await getTareas();
      setTareas(data);
    } catch (error) {
      console.error("ERROR CARGANDO:", error);
    }
  };

  const handleCrear = async () => {
    try {
      console.log("Creando tarea...");
      
      console.log({
      titulo,
      descripcion,
      fecha,
  });
      await crearTarea({
        titulo,
        descripcion,
        fecha_vencimiento: fecha,
        estado: "pendiente",
      });

      setTitulo("");
      setDescripcion("");
      setFecha("");

      await cargarTareas();
    } catch (error) {
      console.error("ERROR CREAR:", error);
    }
  };

  const handleCompletar = async (id) => {
    try {
      await completarTarea(id);
      await cargarTareas();
    } catch (error) {
      console.error("ERROR COMPLETAR:", error);
    }
  };

  return (
    <div>
      <h2>Mis tareas</h2>

      <input
        type="text"
        placeholder="Título"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />

      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />

      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
      />

      <button onClick={handleCrear}>Crear</button>

      <hr />

      {tareas.length === 0 ? (
        <p>No hay tareas</p>
      ) : (
        tareas.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid white",
              margin: "10px",
              padding: "10px",
            }}
          >
            <h3>{t.titulo}</h3>
            <p>{t.descripcion}</p>
            <p>Fecha: {t.fecha_vencimiento}</p>
            <p>Estado: {t.estado}</p>

            <button onClick={() => handleCompletar(t.id)}>
              ✔️ Completar
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Tareas;  