  import { useEffect, useState } from "react";
  import {
    getTareas,
    crearTarea,
    completarTarea,
    eliminarTarea,
    actualizarTarea
  } from "../Services/api";

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

    const handleCompletar = async (id) => {
      try {
        await completarTarea(id);
        await cargarTareas();
      } catch (error) {
        console.error("ERROR COMPLETAR:", error);
      }
    };

    const handleEditar = (t) => {
      setEditandoId(t.id);
      setTitulo(t.titulo);
      setDescripcion(t.descripcion);
      setFecha(t.fecha_vencimiento);
    };

    const handleActualizar = async () => {
      try {
        await actualizarTarea(editandoId, {
          titulo,
          descripcion,
          fecha_vencimiento: fecha,
        });

        setEditandoId(null);
        setTitulo("");
        setDescripcion("");
        setFecha("");

        await cargarTareas();
      } catch (error) {
        console.error("ERROR ACTUALIZAR:", error);
      }
    };

  return (
  <>
    {/* HEADER */}
    <div className="header">
      <div className="header-content">
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
    </div>

    {/* FORMULARIO */}
    <div className="container form-container">
      <div className="form-card">
        <h2>Crear tarea</h2>

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

        {editandoId && (
          <button onClick={handleActualizar}>
            Actualizar
          </button>
        )}
      </div>
    </div>

    {/* TAREAS */}
    <div className="container tareas-container">
      <div className="tareas-card">
        <h2>Mis tareas</h2>

        {tareas.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes tareas aún </h3>
            <p>Empieza creando tu primera tarea arriba</p>
          </div>
        ) : (
          tareas.map((t) => (
            <div key={t.id} className="card">
              <h3>{t.titulo}</h3>
              <p>{t.descripcion}</p>

              <p>
                <strong>Fecha:</strong> {t.fecha_vencimiento}
              </p>

              <p>
                <strong>Estado:</strong> {t.estado}
              </p>

              <div className="card-buttons">
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
                  onClick={async () => {
                    await eliminarTarea(t.id);
                    await cargarTareas();
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </>
);
  }

export default Tareas;  
  