const API_URL = "https://sistema-de-gesti-n-de-tareas-bgsu.onrender.com";

// 🔥 FETCH CENTRALIZADO
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // 🔐 sesión expirada
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  return response;
};

// 🔹 LOGIN (no usa token)
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

  if (!response.ok) {
    throw new Error(data.detail || "Error en login");
  }

  return data;
};

// 🔹 GET TAREAS
export const getTareas = async () => {
  const response = await apiFetch(`${API_URL}/tareas`);

  if (!response.ok) {
    throw new Error("Error al obtener tareas");
  }

  return await response.json();
};

// 🔹 CREAR TAREA
export const crearTarea = async (tarea) => {
  const response = await apiFetch(`${API_URL}/tareas`, {
    method: "POST",
    body: JSON.stringify(tarea),
  });

  return await response.json();
};

// 🔹 COMPLETAR TAREA
export const completarTarea = async (id) => {
  const response = await apiFetch(`${API_URL}/tareas/${id}/completar`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error al completar tarea");
  }

  return await response.json();
};

// 🔹 ACTUALIZAR TAREA
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

// 🔹 REGISTRO (no usa token)
export const registrarUsuario = async (datos) => {
  const response = await fetch(`${API_URL}/registro`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (!response.ok) {
    throw new Error("Error al registrar usuario");
  }

  return await response.json();
};

// 🔹 ELIMINAR TAREA
export const eliminarTarea = async (id) => {
  const response = await apiFetch(`${API_URL}/tareas/${id}`, {
    method: "DELETE",
  });

  if (response.status === 404) {
    console.log("Tarea ya eliminada o no existe");
    return;
  }

  if (!response.ok) {
    throw new Error("Error al eliminar tarea");
  }

  return await response.json();
};