from fastapi import FastAPI, Query, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import text
from jose import jwt
from datetime import datetime, timedelta
from app.database.connection import SessionLocal, engine, Base
from typing import Optional

# 🔥 IMPORTAR MODELOS (ANTES DE CREAR LA APP)
import app.models.user
import app.models.task

# 🔥 CREAR APP
app = FastAPI()

# 🔥 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 CREAR TABLAS AL INICIAR
@app.on_event("startup")
def startup():  
    Base.metadata.create_all(bind=engine)

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

# 🔥 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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

import re

def validar_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(status_code=400, detail="Debe contener al menos una letra")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Debe contener al menos un carácter especial")

@app.post("/registro")
def registrar(usuario: Usuario):
    # 🔐 Validar contraseña (nuevo)
    validar_password(usuario.password)

    # 🔐 Hashear contraseña (nuevo)
    hashed_password = hash_password(usuario.password)

    db = SessionLocal()

    query = "INSERT INTO usuarios (username, password) VALUES (:username, :password)"
    db.execute(text(query), {
        "username": usuario.username,
        "password": hashed_password  # 👈 antes era texto plano
    })

    db.commit()
    db.close()

    return {"mensaje": "Usuario creado"}

@app.post("/login")
def login(usuario: Usuario):
    db = SessionLocal()

    query = "SELECT * FROM usuarios WHERE username = :username"
    result = db.execute(text(query), {
        "username": usuario.username
    }).fetchone()

    if not result:
        db.close()
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    stored_password = result[2]  # id, username, password

    # 🔐 Si es hash (nuevo sistema)
    if stored_password.startswith("$2b$"):
        if not verify_password(usuario.password, stored_password):
            db.close()
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # 🧓 Si es texto plano (usuarios viejos)
    else:
        if usuario.password != stored_password:
            db.close()
            raise HTTPException(status_code=401, detail="Credenciales incorrectas")

        # 🔥 Migración automática
        new_hashed = hash_password(usuario.password)

        db.execute(text("""
            UPDATE usuarios 
            SET password = :password 
            WHERE id = :id
        """), {
            "password": new_hashed,
            "id": result[0]
        })
        db.commit()

    db.close()

    token = crear_token({"user_id": result[0]})

    return {
        "mensaje": "Login exitoso",
        "access_token": token
    }
    
    
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
    
import re

def validar_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 8 caracteres")

    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(status_code=400, detail="Debe contener al menos una letra")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Debe contener al menos un carácter especial")