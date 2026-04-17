from fastapi import FastAPI, Query, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from jose import jwt
from datetime import datetime, timedelta
from app.database.connection import SessionLocal

app = FastAPI()


class Tarea(BaseModel):
     titulo: str
     usuario_id: int
     descripcion: str
     fecha_vencimiento: str
     estado: str
     

@app.get("/")
def inicio():
    return {"mensaje": "Hola mundo"}

# 🔹 GET
@app.get("/tareas")
def obtener_tareas(usuario_id: int = Query(None)):
    db = SessionLocal()

    if usuario_id:
        query = "SELECT * FROM tareas WHERE usuario_id = :usuario_id"
        result = db.execute(text(query), {"usuario_id": usuario_id}).fetchall()
    else:
        result = db.execute(text("SELECT * FROM tareas")).fetchall()

    tareas = []
    for row in result:
        tareas.append({
            "id": row[0],
            "titulo": row[1],
            "usuario_id": row[2],
            "descripcion": row[3],
            "fecha_vencimiento": row[4],
            "estado": row[5],
        })

    db.close()

    return tareas

# 🔹 POST

from fastapi import Header, HTTPException

from fastapi import Query

@app.post("/tareas")
def crear_tarea(tarea: Tarea, token: str = Query(None)):

    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    usuario_id = verificar_token(token)

    db = SessionLocal()

    query = """
    INSERT INTO tareas (titulo, descripcion, fecha_vencimiento, estado, usuario_id)
    VALUES (:titulo, :descripcion, :fecha_vencimiento, :estado, :usuario_id)
    """

    db.execute(text(query), {
        "titulo": tarea.titulo,
        "descripcion": tarea.descripcion,
        "fecha_vencimiento": tarea.fecha_vencimiento,
        "estado": tarea.estado,
        "usuario_id": usuario_id
    })

    db.commit()
    db.close()

    return {"mensaje": "Tarea creada"}
# 🔹 PUT (actualizar)
@app.put("/tareas/{id}")
def actualizar_tarea(id: int, tarea: Tarea):
    db = SessionLocal()

    query = "UPDATE tareas SET titulo = :titulo WHERE id = :id"
    db.execute(text(query), {
        "titulo": tarea.titulo,
        "id": id
    })

    db.commit()
    db.close()

    return {"mensaje": "Tarea actualizada"}

# 🔹 DELETE (eliminar)
@app.delete("/tareas/{id}")
def eliminar_tarea(id: int):
    db = SessionLocal()

    query = "DELETE FROM tareas WHERE id = :id"
    db.execute(text(query), {"id": id})

    db.commit()
    db.close()

    return {"mensaje": "Tarea eliminada"}

from app.database.connection import engine #Codigo para probar la coneccion

@app.get("/test-db")
def test_db():
    return {"mensaje": "Conexión exitosa"}


class Usuario(BaseModel):
    username: str
    password: str

@app.post("/registro")
def registrar(usuario: Usuario):
    db = SessionLocal()

    query = "INSERT INTO usuarios (username, password) VALUES (:username, :password)"
    db.execute(text(query), {
        "username": usuario.username,
        "password": usuario.password
    })

    db.commit()
    db.close()

    return {"mensaje": "Usuario creado"}

@app.post("/login")
def login(usuario: Usuario):
    db = SessionLocal()

    query = "SELECT * FROM usuarios WHERE username = :username AND password = :password"
    result = db.execute(text(query), {
        "username": usuario.username,
        "password": usuario.password
    }).fetchone()

    db.close()

    if result:
        token = crear_token({"user_id": result[0]})

        return {
            "mensaje": "Login exitoso",
            "access_token": token
        }
    else:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    
    
SECRET_KEY = "mi_clave_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def crear_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload["user_id"]
    except:
        raise HTTPException(status_code=401, detail="Token inválido")
    