// =========================================================
// API.JS (SERVICIOS DE COMUNICACIÓN CON BACKEND)
// =========================================================
// Este archivo centraliza todas las peticiones HTTP al backend.
// Permite:
// - Manejar autenticación con JWT (Authorization header)
// - Reutilizar lógica de fetch (apiFetch)
// - Evitar repetir código en cada componente
// - Gestionar errores globales (ej: sesión expirada)
// =========================================================

// =========================
// URL BASE DEL BACKEND
// =========================
// Aquí se define la URL del servidor (Render)
const API_URL = "https://sistema-de-gesti-n-de-tareas-bgsu.onrender.com";

// =========================================================
// FETCH CENTRALIZADO
// =========================================================
// Esta función envía peticiones al backend automáticamente:
// - agrega el token JWT
// - define headers comunes
// - maneja sesión expirada
// =========================================================

const apiFetch = async (url, options = {}) => {

  // Obtiene el token guardado en el navegador
  const token = localStorage.getItem("token");

  // Ejecuta la petición HTTP
  const response = await fetch(url, {
    ...options,

    headers: {
      // Tipo de contenido JSON
      "Content-Type": "application/json",

      // Permite agregar headers personalizados
      ...(options.headers || {}),

      // Header de autenticación
      // Se envía el token en formato estándar:
      // Authorization: Bearer TOKEN
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // =========================
  // MANEJO DE SESIÓN EXPIRADA
  // =========================
  // Si el backend responde 401 (no autorizado)
  if (response.status === 401) {

    // Elimina token (logout automático)
    localStorage.removeItem("token");

    // Redirige al login
    window.location.href = "/";
    return;
  }

  return response;
};

// =========================================================
// LOGIN (NO USA TOKEN)
// =========================================================
// Envía usuario y contraseña al backend
// Recibe token JWT
// =========================================================

export const loginUser = async (username, password) => {

  const response = await fetch(`${API_URL}/login`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username: username.trim(),
      password: password.trim(),
    }),
  });

  const data = await response.json();

  // Si hay error
  if (!response.ok) {
    throw new Error(data.detail || "Error en login");
  }

  return data;
};

// =========================================================
// GET TAREAS
// =========================================================
// Obtiene todas las tareas del usuario autenticado
// =========================================================

export const getTareas = async () => {

  const response = await apiFetch(`${API_URL}/tareas`);

  if (!response.ok) {
    throw new Error("Error al obtener tareas");
  }

  return await response.json();
};

// =========================================================
// CREAR TAREA
// =========================================================
// Envía una nueva tarea al backend
// =========================================================

export const crearTarea = async (tarea) => {

  const response = await apiFetch(`${API_URL}/tareas`, {
    method: "POST",
    body: JSON.stringify(tarea),
  });

  return await response.json();
};

// =========================================================
// COMPLETAR TAREA
// =========================================================
// Marca una tarea como completada
// =========================================================

export const completarTarea = async (id) => {

  const response = await apiFetch(
    `${API_URL}/tareas/${id}/completar`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Error al completar tarea");
  }

  return await response.json();
};

// =========================================================
// ACTUALIZAR TAREA
// =========================================================
// Actualiza los datos de una tarea existente
// =========================================================

export const actualizarTarea = async (id, datos) => {

  const response = await apiFetch(`${API_URL}/tareas/${id}`, {
    method: "PUT",
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar tarea");
  }

  return await response.json();
};

// =========================================================
// REGISTRO (NO USA TOKEN)
// =========================================================
// Crea un nuevo usuario en el sistema
// =========================================================

export const registrarUsuario = async (datos) => {

  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    console.log("ERROR BACKEND:", data);

    // 👇 AQUÍ ESTÁ LA MAGIA
    throw new Error(data.detail || "Error desconocido");
  }

  return data;
};

// =========================================================
// ELIMINAR TAREA
// =========================================================
// Elimina una tarea por ID
// =========================================================

export const eliminarTarea = async (id) => {

  const response = await apiFetch(`${API_URL}/tareas/${id}`, {
    method: "DELETE",
  });

  // Caso especial: tarea ya no existe
  if (response.status === 404) {
    console.log("Tarea ya eliminada o no existe");
    return;
  }

  if (!response.ok) {
    throw new Error("Error al eliminar tarea");
  }

  return await response.json();
};