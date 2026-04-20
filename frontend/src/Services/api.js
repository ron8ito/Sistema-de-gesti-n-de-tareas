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

// 🔹 OBTENER TAREAS
export const getTareas = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/tareas?token=${token}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error("Error al obtener tareas");
  }

  return data;
};