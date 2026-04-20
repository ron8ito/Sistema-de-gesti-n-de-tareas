
from pydantic import BaseModel
from sqlalchemy import text
from jose import jwt
from datetime import datetime, timedelta
from app.database.connection import SessionLocal
from fastapi import FastAPI, Query, HTTPException

app = FastAPI()


class Tarea(BaseModel):
    titulo: str = Field(..., min_length=1)
    descripcion: str = Field(..., min_length=1)
    fecha_vencimiento: str
    estado: str
     

@app.get("/")
def inicio():
    return {"mensaje": "Hola mundo"}

# 🔹 GET
@app.get("/tareas")
def obtener_tareas(token: str = Query(None)):

    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
        result = db.execute(
            text("SELECT * FROM tareas WHERE usuario_id = :usuario_id"),
            {"usuario_id": usuario_id}
        ).fetchall()

    except Exception:
        raise HTTPException(status_code=500, detail="Error al obtener datos")

    finally:
        db.close()

    tareas = []
    for row in result:
        tareas.append({
            "id": row[0],
            "titulo": row[1],
            "descripcion": row[2],
            "fecha_vencimiento": row[3],
            "estado": row[4],
            "usuario_id": row[5]
        })

    return tareas


# 🔹 POST
@app.post("/tareas")
def crear_tarea(tarea: Tarea, token: str = Query(None)):

    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
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

    except Exception as e:
        db.rollback()  # MUY IMPORTANTE
        raise HTTPException(status_code=500, detail="Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea creada"}

# 🔹 PUT (actualizar)
@app.put("/tareas/{id}")
def actualizar_tarea(id: int, tarea: Tarea, token: str = Query(None)):

    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
        query = """
        UPDATE tareas 
        SET titulo = :titulo, descripcion = :descripcion, 
            fecha_vencimiento = :fecha_vencimiento, estado = :estado
        WHERE id = :id AND usuario_id = :usuario_id
        """

        result = db.execute(text(query), {
            "id": id,
            "titulo": tarea.titulo,
            "descripcion": tarea.descripcion,
            "fecha_vencimiento": tarea.fecha_vencimiento,
            "estado": tarea.estado,
            "usuario_id": usuario_id
        })

        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea actualizada"}

# 🔹 DELETE (eliminar)
@app.delete("/tareas/{id}")
def eliminar_tarea(id: int, token: str = Query(None)):

    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
        query = "DELETE FROM tareas WHERE id = :id AND usuario_id = :usuario_id"

        result = db.execute(text(query), {
            "id": id,
            "usuario_id": usuario_id
        })

        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Tarea no encontrada")

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea eliminada"}

engine #Codigo para probar la coneccion

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
    