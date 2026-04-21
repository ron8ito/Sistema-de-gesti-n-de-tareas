const API_URL = "http://127.0.0.1:8000";

// 🔹 LOGIN
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
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/tareas?token=${token}`
  );

  if (!response.ok) {
    throw new Error("Error al obtener tareas");
  }

  return await response.json();
};

// 🔹 CREAR TAREA
export const crearTarea = async (tarea) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/tareas?token=${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tarea),
    }
  );

  if (response.status === 401) {
  localStorage.removeItem("token");
  window.location.href = "/";
  return;
}
  return await response.json();
};

// 🔹 COMPLETAR TAREA
export const completarTarea = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `http://127.0.0.1:8000/tareas/${id}/completar?token=${token}`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    throw new Error("Error al completar tarea");
  }

  return await response.json();
};

export const actualizarTarea = async (id, datos) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tareas/${id}?token=${token}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  if (!response.ok) {
    throw new Error("Error al actualizar tarea");
  }

  return await response.json();
};