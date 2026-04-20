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
    `${API_URL}/tareas?token=${encodeURIComponent(token)}`
  );

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/";
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error al obtener tareas");
  }

  return data;
};

// 🔹 CREAR TAREA
export const crearTarea = async (tarea) => {
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/tareas?token=${encodeURIComponent(token)}`,
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error al crear tarea");
  }

  return data;
};