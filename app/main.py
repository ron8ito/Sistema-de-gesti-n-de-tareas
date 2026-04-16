from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

tareas = []

class Tarea(BaseModel):
    titulo: str

@app.get("/")
def inicio():
    return {"mensaje": "Hola mundo"}

# 🔹 GET
@app.get("/tareas")
def obtener_tareas():
    return tareas

# 🔹 POST
@app.post("/tareas")
def crear_tarea(tarea: Tarea):
    nueva = {
        "id": len(tareas) + 1,
        "titulo": tarea.titulo
    }
    tareas.append(nueva)
    return nueva

# 🔹 PUT (actualizar)
@app.put("/tareas/{id}")
def actualizar_tarea(id: int, tarea: Tarea):
    for t in tareas:
        if t["id"] == id:
            t["titulo"] = tarea.titulo
            return t
    return {"error": "Tarea no encontrada"}

# 🔹 DELETE (eliminar)
@app.delete("/tareas/{id}")
def eliminar_tarea(id: int):
    for t in tareas:
        if t["id"] == id:
            tareas.remove(t)
            return {"mensaje": "Tarea eliminada"}
    return {"error": "Tarea no encontrada"}