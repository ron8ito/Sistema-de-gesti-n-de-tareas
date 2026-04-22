
from pydantic import BaseModel, Field 
from sqlalchemy import text
from jose import jwt
from datetime import datetime, timedelta
from app.database.connection import SessionLocal
from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional


app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel

class Tarea(BaseModel):
    titulo: str
    descripcion: str
    fecha_vencimiento: str
    estado: str
     
class TareaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    fecha_vencimiento: Optional[datetime] = None
    estado: Optional[str] = None


@app.get("/")
def inicio():
    return {"mensaje": "Hola mundo"}

# 🔹 GET
@app.get("/tareas")
def obtener_tareas(token: str = Query(...)):

    usuario_id = verificar_token(token)
    db = SessionLocal()

    query = "SELECT * FROM tareas WHERE usuario_id = :usuario_id"
    result = db.execute(text(query), {"usuario_id": usuario_id}).fetchall()

    tareas = []
    for row in result:
        tareas.append({
            "id": row[0],
            "titulo": row[1],
            "usuario_id": row[2],
            "descripcion": row[3],
            "fecha_vencimiento": row[4],
            "estado": row[5]
        })

    db.close()
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
        INSERT INTO tareas (titulo, usuario_id, descripcion, fecha_vencimiento, estado)
        VALUES (:titulo, :usuario_id, :descripcion, :fecha_vencimiento, :estado)
        """

        db.execute(text(query), {
            "titulo": tarea.titulo,
            "usuario_id": usuario_id,
            "descripcion": tarea.descripcion,
            "fecha_vencimiento": tarea.fecha_vencimiento,
            "estado": tarea.estado
        })

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea creada"}

@app.post("/tareas/{tarea_id}/completar")
def completar_tarea(tarea_id: int, token: str = Query(...)):

    usuario_id = verificar_token(token)
    db = SessionLocal()

    try:
        query = """
        UPDATE tareas
        SET estado = 'completada'
        WHERE id = :id AND usuario_id = :usuario_id
        """

        db.execute(text(query), {
            "id": tarea_id,
            "usuario_id": usuario_id
        })

        db.commit()

    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error al completar tarea")

    finally:
        db.close()

    return {"mensaje": "Tarea completada"}

# 🔹 PUT (actualizar)
@app.put("/tareas/{id}")
def actualizar_tarea(id: int, tarea: TareaUpdate, token: str = Query(None)):

    if not token:
        raise HTTPException(status_code=401, detail="No autorizado")

    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
        #QUERY
        campos = []
        valores = {"id": id, "usuario_id": usuario_id}

        if tarea.titulo is not None:
            campos.append("titulo = :titulo")
            valores["titulo"] = tarea.titulo

        if tarea.descripcion is not None:
            campos.append("descripcion = :descripcion")
            valores["descripcion"] = tarea.descripcion

        if tarea.fecha_vencimiento is not None:
            campos.append("fecha_vencimiento = :fecha_vencimiento")
            valores["fecha_vencimiento"] = tarea.fecha_vencimiento

        if tarea.estado is not None:
            campos.append("estado = :estado")
            valores["estado"] = tarea.estado

        if not campos:
            raise HTTPException(status_code=400, detail="No hay datos para actualizar")

        query = f"""
        UPDATE tareas 
        SET {", ".join(campos)}
        WHERE id = :id AND usuario_id = :usuario_id
        """

        result = db.execute(text(query), valores)

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

    # 👇 ESTE ES EL CAMBIO IMPORTANTE
    except HTTPException:
        raise  # deja pasar errores como 404 o 401

    except Exception as e:
        db.rollback()
        print("ERROR REAL:", e)
        raise HTTPException(status_code=500, detail="Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea eliminada"}


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
        print("PAYLOAD:", payload)
        return payload["user_id"]
    except Exception as e:
        print("ERROR TOKEN:", e)  # 👈 CLAVE
        raise HTTPException(status_code=401, detail="Token inválido")
    

@app.post("/tareas")
def crear_tarea(tarea: Tarea, token: str = Query(...)):

    usuario_id = verificar_token(token)
    db = SessionLocal()

    try:
        query = """
        INSERT INTO tareas (titulo, usuario_id, descripcion, fecha_vencimiento, estado)
        VALUES (:titulo, :usuario_id, :descripcion, :fecha_vencimiento, :estado)
        """

        datos = {
            "titulo": tarea.titulo,
            "usuario_id": usuario_id,
            "descripcion": tarea.descripcion,
            "fecha_vencimiento": tarea.fecha_vencimiento,
            "estado": tarea.estado
        }

        print("INSERTANDO:", datos)  # 👈 para verificar

        db.execute(text(query), datos)
        db.commit()

    except Exception as e:
        db.rollback()
        print("ERROR:", e)
        raise HTTPException(status_code=500, detail="Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea creada"}