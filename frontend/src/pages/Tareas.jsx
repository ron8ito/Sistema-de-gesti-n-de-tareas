import { useEffect, useState } from "react";
import { getTareas, crearTarea, completarTarea, actualizarTarea } from "../services/api";

function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [editandoId, setEditandoId] = useState(null);

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

  // 🟢 CREAR
  const handleCrear = async () => {
    try {
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

  // 🟡 EDITAR (cargar datos en inputs)
  const handleEditar = (t) => {
    setEditandoId(t.id);
    setTitulo(t.titulo);
    setDescripcion(t.descripcion);
    setFecha(t.fecha_vencimiento);
  };

  // 🔵 ACTUALIZAR (PUT)
  const handleActualizar = async () => {
  try {
    const datos = {};

    if (titulo && titulo.trim() !== "") {
      datos.titulo = titulo;
    }

    if (descripcion && descripcion.trim() !== "") {
      datos.descripcion = descripcion;
    }

    if (fecha && fecha !== "") {
    datos.fecha_vencimiento = fecha + "T00:00:00";
    }

    await actualizarTarea(editandoId, datos);

    setEditandoId(null);
    setTitulo("");
    setDescripcion("");
    setFecha("");

    await cargarTareas();
  } catch (error) {
    console.error("ERROR ACTUALIZAR:", error);
  }
};

  // 🟣 COMPLETAR
  const handleCompletar = async (id) => {
    try {
      await completarTarea(id);
      await cargarTareas();
    } catch (error) {
      console.error("ERROR COMPLETAR:", error);
    }
  };

  // 🔴 ELIMINAR
  const eliminarTarea = async (id) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No estás autenticado");
      return;
    }

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/tareas/${id}?token=${token}`,
        {
          method: "DELETE",
        }
      );

      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
        return;
      }

      if (!res.ok) {
        console.error("Error al eliminar");
        return;
      }

      await cargarTareas();
    } catch (error) {
      console.error("ERROR ELIMINAR:", error);
    }
  };

  return (
  <>
    {/* HEADER */}
    <div className="header">
      <h1>Gestor de Tareas</h1>

      <button
        className="logout-btn"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.reload();
        }}
      >
        Cerrar sesión
      </button>
    </div>

    {/* CONTENIDO */}
    <div className="container">
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

      {/* BOTONES */}
      <button onClick={handleCrear}>Crear</button>

      {editandoId && (
        <button onClick={handleActualizar}>
          Actualizar
        </button>
      )}

      <hr />

      {tareas.length === 0 ? (
        <p>No hay tareas</p>
      ) : (
        tareas.map((t) => (
          <div key={t.id} className="card">
            <h3>{t.titulo}</h3>
            <p>{t.descripcion}</p>
            <p><strong>Fecha:</strong> {t.fecha_vencimiento}</p>
            <p><strong>Estado:</strong> {t.estado}</p>

            <button
              className="btn-completar"
              onClick={() => handleCompletar(t.id)}
            >
              ✔️ Completar
            </button>

            <button
              className="btn-editar"
              onClick={() => handleEditar(t)}
            >
              ✏️ Editar
            </button>

            <button
              className="btn-eliminar"
              onClick={() => eliminarTarea(t.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        ))
      )}
    </div>
  </>
);
} 

export default Tareas;