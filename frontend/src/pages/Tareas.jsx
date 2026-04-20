import { useEffect, useState } from "react";
import { getTareas, crearTarea } from "../services/api";

function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [estado, setEstado] = useState("pendiente");

  useEffect(() => {
    const cargarTareas = async () => {
      const data = await getTareas();
      setTareas(data);
    };

    cargarTareas();
  }, []);

 const handleCrear = async () => {
  console.log("CLICK CREAR");

  try {
    const res = await crearTarea({
      titulo,
      descripcion,
      fecha_vencimiento: "fecha",
      estado: "pendiente",
    });

    console.log("RESPUESTA:", res);

    setTitulo("");
    setDescripcion("");

    const data = await getTareas();
    setTareas(data);

  } catch (error) {
    console.error("ERROR CREANDO:", error);
    alert("Error al crear tarea");
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

      <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="pendiente">Pendiente</option>
       </select>

      <button onClick={handleCrear}>Crear</button>


      {tareas.map((t) => (
        <div key={t.id}>
          <h4>{t.titulo}</h4>
          <p>{t.descripcion}</p>
          <p>{t.fecha_vencimiento}</p>
          <p>{t.estado}</p>
        </div>
      ))}
    </div>
  );
}

export default Tareas;