from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

tareas = []

# Modelo de datos
class Tarea(BaseModel):
    titulo: str

@app.get("/")
def inicio():
    return {"mensaje": "Hola mundo"}


@app.get("/tareas")
def obtener_tareas():
    return tareas


@app.post("/tareas")
def crear_tarea(tarea: Tarea):
    nueva = {
        "id": len(tareas) + 1,
        "titulo": tarea.titulo
    }
    tareas.append(nueva)
    return nueva