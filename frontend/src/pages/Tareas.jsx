// =========================================================
// COMPONENTE TAREAS (GESTIÓN DE TAREAS)
// =========================================================
// Este componente permite:
// - Mostrar tareas del usuario
// - Crear nuevas tareas
// - Editar tareas existentes
// - Marcar tareas como completadas
// - Eliminar tareas
// - Cerrar sesión (logout)
// =========================================================

// =========================
// IMPORTACIONES
// =========================

// Hooks de React
import { useEffect, useState } from "react";

// Funciones para consumir la API (backend)
import {
  getTareas,
  crearTarea,
  completarTarea,
  eliminarTarea,
  actualizarTarea
} from "../Services/api";

// =========================
// COMPONENTE PRINCIPAL
// =========================

// Recibe cambiarVista para navegación entre pantallas
function Tareas({ cambiarVista }) {

  // =========================
  // ESTADOS
  // =========================

  // Lista de tareas
  const [tareas, setTareas] = useState([]);

  // Campos del formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  // ID de tarea en edición
  const [editandoId, setEditandoId] = useState(null);

  // =========================
  // CARGAR TAREAS AL INICIAR
  // =========================

  useEffect(() => {
    cargarTareas();
  }, []);

  // =========================
  // OBTENER TAREAS
  // =========================

  const cargarTareas = async () => {
    try {

      // Llama al backend
      const data = await getTareas();

      // Guarda tareas en estado
      setTareas(data);

    } catch (error) {
      console.error("ERROR CARGANDO:", error);
    }
  };

  // =========================
  // CREAR TAREA
  // =========================

  const handleCrear = async () => {
    try {

      // Envía datos al backend
      await crearTarea({
        titulo,
        descripcion,
        fecha_vencimiento: fecha,
        estado: "pendiente",
      });

      // Limpia formulario
      setTitulo("");
      setDescripcion("");
      setFecha("");

      // Recarga tareas
      await cargarTareas();

    } catch (error) {
      console.error("ERROR CREAR:", error);
    }
  };

  // =========================
  // COMPLETAR TAREA
  // =========================

  const handleCompletar = async (id) => {
    try {

      // Marca tarea como completada
      await completarTarea(id);

      // Recarga lista
      await cargarTareas();

    } catch (error) {
      console.error("ERROR COMPLETAR:", error);
    }
  };

  // =========================
  // ACTIVAR MODO EDICIÓN
  // =========================

  const handleEditar = (t) => {

    // Guarda ID de la tarea
    setEditandoId(t.id);

    // Carga datos en el formulario
    setTitulo(t.titulo);
    setDescripcion(t.descripcion);
    setFecha(t.fecha_vencimiento);
  };

  // =========================
  // ACTUALIZAR TAREA
  // =========================

  const handleActualizar = async () => {
    try {

      // Envía datos actualizados
      await actualizarTarea(editandoId, {
        titulo,
        descripcion,
        fecha_vencimiento: fecha,
      });

      // Sale del modo edición
      setEditandoId(null);

      // Limpia formulario
      setTitulo("");
      setDescripcion("");
      setFecha("");

      // Recarga tareas
      await cargarTareas();

    } catch (error) {
      console.error("ERROR ACTUALIZAR:", error);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    // Elimina token (cierra sesión)
    localStorage.removeItem("token");

    // Redirige a login
    cambiarVista("login");
  };

  // =========================
  // UI (INTERFAZ)
  // =========================

  return (
    <>
      {/* =========================
          HEADER
      ========================= */}
      <div className="header">
        <div className="header-content">
          <h1>Gestor de Tareas</h1>

          {/* BOTÓN LOGOUT */}
          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>


      {/* =========================
          FORMULARIO CREAR / EDITAR
      ========================= */}
      <div className="container form-container">
        <div className="form-card">
          <h2>Crear tarea</h2>

          {/* INPUT TÍTULO */}
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          {/* INPUT DESCRIPCIÓN */}
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          {/* INPUT FECHA */}
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />

          {/* BOTÓN CREAR */}
          <button onClick={handleCrear}>
            Crear
          </button>

          {/* BOTÓN ACTUALIZAR (solo si está editando) */}
          {editandoId && (
            <button onClick={handleActualizar}>
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* =========================
          LISTA DE TAREAS
      ========================= */}
      <div className="container tareas-container">
        <div className="tareas-card">
          <h2>Mis tareas</h2>

          {/* SI NO HAY TAREAS */}
          {tareas.length === 0 ? (
            <div className="empty-state">
              <h3>No tienes tareas aún </h3>
              <p>Empieza creando tu primera tarea arriba</p>
            </div>

          ) : (

            // RECORRE TODAS LAS TAREAS
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


                {/* BOTONES DE ACCIÓN */}
                <div className="card-buttons">

                  {/* COMPLETAR */}
                  <button
                    className="btn-completar"
                    onClick={() => handleCompletar(t.id)}
                  >
                    ✔️ Completar
                  </button>

                  {/* EDITAR */}
                  <button
                    className="btn-editar"
                    onClick={() => handleEditar(t)}
                  >
                    ✏️ Editar
                  </button>

                  {/* ELIMINAR */}
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

// =========================
// EXPORTACIÓN
// =========================

export default Tareas;