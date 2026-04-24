from fastapi import FastAPI, Query, Header, HTTPException, RequestS
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import text
from jose import jwt, JWTError, ExpiredSignatureError
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
def crear_tarea(tarea: Tarea, request: Request):

    # 🔐 Obtener token (query o header)
    token = obtener_token(request)

    # 🔐 Validar token
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

        print("INSERTANDO:", datos)

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
from fastapi import HTTPException

def validar_password(password: str):
    # 🔹 Mínimo de caracteres
    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="La contraseña debe tener al menos 8 caracteres"
        )

    # 🔹 Límite de bcrypt (IMPORTANTE)
    if len(password) > 72:
        raise HTTPException(
            status_code=400,
            detail="La contraseña no puede tener más de 72 caracteres"
        )

    # 🔹 Al menos una letra
    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(
            status_code=400,
            detail="Debe contener al menos una letra"
        )

    # 🔹 Al menos un carácter especial
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=400,
            detail="Debe contener al menos un carácter especial"
        )

@app.post("/registro")
def registrar(usuario: Usuario):
    validar_password(usuario.password)

    hashed_password = hash_password(usuario.password)

    db = SessionLocal()

    try:
        # 🔍 Verificar si ya existe
        query_check = "SELECT * FROM usuarios WHERE username = :username"
        existing_user = db.execute(text(query_check), {
            "username": usuario.username
        }).fetchone()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="El usuario ya existe"
            )

        # ✅ Insertar si no existe
        query = "INSERT INTO usuarios (username, password) VALUES (:username, :password)"
        db.execute(text(query), {
            "username": usuario.username,
            "password": hashed_password
        })

        db.commit()

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("ERROR REGISTRO:", e)
        raise HTTPException(status_code=500, detail="Error al crear usuario")

    finally:
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

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

GOOGLE_CLIENT_ID = "865802471208-afm6vp84nov5q9dlcutco3hdb4t0842m.apps.googleusercontent.com"

@app.post("/google-login")
def google_login(data: dict):
    token = data.get("credential")

    if not token:
        raise HTTPException(status_code=400, detail="Token requerido")

    try:
        # 🔐 Verificar token con Google
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")

        if not email:
            raise HTTPException(status_code=400, detail="Email no encontrado")

        db = SessionLocal()

        # 🔍 Buscar usuario
        query = "SELECT * FROM usuarios WHERE username = :username"
        user = db.execute(text(query), {"username": email}).fetchone()

        # 👤 Si no existe → crear
        if not user:
            db.execute(text("""
                INSERT INTO usuarios (username, password)
                VALUES (:username, :password)
            """), {
                "username": email,
                "password": "google_user"
            })
            db.commit()

            user = db.execute(text(query), {"username": email}).fetchone()

        db.close()

        # 🎟️ Crear TU token JWT
        token_jwt = crear_token({"user_id": user[0]})

        return {
            "access_token": token_jwt,
            "token_type": "bearer"
        }

    except Exception as e:
        print("ERROR GOOGLE:", e)
        raise HTTPException(status_code=401, detail="Token inválido")
    
SECRET_KEY = "mi_clave_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def crear_token(data: dict):
    to_encode = data.copy()
    
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "type": "access"
    })

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verificar_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")

        return user_id

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    
    from fastapi import Request

def obtener_token(request: Request):
    # 🔹 1. Query param (lo actual)
    token = request.query_params.get("token")

    # 🔹 2. Header Authorization (nuevo)
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    return token
