from fastapi import FastAPI, Query, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import text
from jose import jwt, JWTError, ExpiredSignatureError
from datetime import datetime, timedelta
from app.database.connection import SessionLocal, engine, Base
from typing import Optional
import re

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

# 🔥 IMPORTAR MODELOS
import app.models.user
import app.models.task

# 🔥 APP
app = FastAPI()

# 🔥 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔥 DB INIT
@app.on_event("startup")
def startup():  
    Base.metadata.create_all(bind=engine)


# =========================
# MODELOS
# =========================

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

class Usuario(BaseModel):
    username: str
    password: str


# =========================
# CONFIG JWT
# =========================

SECRET_KEY = "mi_clave_secreta"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def crear_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
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


def obtener_token(request: Request):
    token = request.query_params.get("token")

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(status_code=401, detail="Token requerido")

    return token


# =========================
# PASSWORD
# =========================

def validar_password(password: str):
    if len(password) < 8:
        raise HTTPException(400, "La contraseña debe tener al menos 8 caracteres")

    if len(password) > 72:
        raise HTTPException(400, "La contraseña no puede tener más de 72 caracteres")

    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(400, "Debe contener al menos una letra")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(400, "Debe contener al menos un carácter especial")


from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# =========================
# ENDPOINTS BASE
# =========================

@app.get("/")
def inicio():
    return {"mensaje": "Hola mundo"}


# =========================
# TAREAS
# =========================

@app.get("/tareas")
def obtener_tareas(request: Request):
    token = obtener_token(request)
    usuario_id = verificar_token(token)

    db = SessionLocal()

    result = db.execute(
        text("SELECT * FROM tareas WHERE usuario_id = :usuario_id"),
        {"usuario_id": usuario_id}
    ).fetchall()

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

@app.post("/tareas")
def crear_tarea(tarea: Tarea, request: Request):
    token = obtener_token(request)
    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
        db.execute(text("""
            INSERT INTO tareas (titulo, usuario_id, descripcion, fecha_vencimiento, estado)
            VALUES (:titulo, :usuario_id, :descripcion, :fecha_vencimiento, :estado)
        """), {
            "titulo": tarea.titulo,
            "usuario_id": usuario_id,
            "descripcion": tarea.descripcion,
            "fecha_vencimiento": tarea.fecha_vencimiento,
            "estado": tarea.estado
        })

        db.commit()

    except Exception as e:
        db.rollback()
        raise HTTPException(500, "Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea creada"}


@app.post("/tareas/{tarea_id}/completar")
def completar_tarea(tarea_id: int, request: Request):
    token = obtener_token(request)
    usuario_id = verificar_token(token)
    db = SessionLocal()

    try:
        result = db.execute(text("""
            UPDATE tareas
            SET estado = 'completada'
            WHERE id = :id AND usuario_id = :usuario_id
        """), {"id": tarea_id, "usuario_id": usuario_id})

        db.commit()

        # 🔥 AQUÍ VA LA MEJORA
        if result.rowcount == 0:
            raise HTTPException(404, "Tarea no encontrada")

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        raise HTTPException(500, "Error al completar tarea")

    finally:
        db.close()

    return {"mensaje": "Tarea completada"}


@app.put("/tareas/{id}")
def actualizar_tarea(id: int, tarea: TareaUpdate, request: Request):
    token = obtener_token(request)
    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
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
            raise HTTPException(400, "No hay datos para actualizar")

        query = f"""
        UPDATE tareas 
        SET {", ".join(campos)}
        WHERE id = :id AND usuario_id = :usuario_id
        """

        result = db.execute(text(query), valores)
        db.commit()

        if result.rowcount == 0:
            raise HTTPException(404, "Tarea no encontrada")

    except Exception:
        db.rollback()
        raise HTTPException(500, "Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea actualizada"}


@app.delete("/tareas/{id}")
def eliminar_tarea(id: int, request: Request):
    token = obtener_token(request)
    usuario_id = verificar_token(token)

    db = SessionLocal()

    try:
        result = db.execute(
            text("DELETE FROM tareas WHERE id = :id AND usuario_id = :usuario_id"),
            {"id": id, "usuario_id": usuario_id}
        )

        db.commit()

        if result.rowcount == 0:
            raise HTTPException(404, "Tarea no encontrada")

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(500, "Error en base de datos")

    finally:
        db.close()

    return {"mensaje": "Tarea eliminada"}

# =========================
# AUTH
# =========================

@app.post("/registro")
def registrar(usuario: Usuario):
    validar_password(usuario.password)
    hashed_password = hash_password(usuario.password)

    db = SessionLocal()

    try:
        existing = db.execute(
            text("SELECT * FROM usuarios WHERE username = :username"),
            {"username": usuario.username}
        ).fetchone()

        if existing:
            raise HTTPException(400, "El usuario ya existe")

        db.execute(text("""
            INSERT INTO usuarios (username, password)
            VALUES (:username, :password)
        """), {
            "username": usuario.username,
            "password": hashed_password
        })

        db.commit()

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        raise HTTPException(500, "Error al crear usuario")

    finally:
        db.close()

    return {"mensaje": "Usuario creado"}


@app.post("/login")
def login(usuario: Usuario):
    db = SessionLocal()

    result = db.execute(
        text("SELECT * FROM usuarios WHERE username = :username"),
        {"username": usuario.username}
    ).fetchone()

    if not result:
        db.close()
        raise HTTPException(401, "Credenciales incorrectas")

    stored_password = result[2]

    if stored_password.startswith("$2b$"):
        if not verify_password(usuario.password, stored_password):
            db.close()
            raise HTTPException(401, "Credenciales incorrectas")
    else:
        if usuario.password != stored_password:
            db.close()
            raise HTTPException(401, "Credenciales incorrectas")

        new_hashed = hash_password(usuario.password)
        db.execute(text("""
            UPDATE usuarios SET password = :password WHERE id = :id
        """), {"password": new_hashed, "id": result[0]})
        db.commit()

    db.close()

    token = crear_token({"user_id": result[0]})

    return {"access_token": token}

print("LLEGUE AQUI")

@app.get("/test-google")
def test_google():
    return {"ok": True}

# =========================
# GOOGLE LOGIN
# =========================

GOOGLE_CLIENT_ID = "865802471208-afm6vp84nov5q9dlcutco3hdb4t0842m.apps.googleusercontent.com"

@app.post("/google-login")
def google_login(data: dict):
    token = data.get("credential")

    if not token:
        raise HTTPException(400, "Token requerido")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")

        db = SessionLocal()

        user = db.execute(
            text("SELECT * FROM usuarios WHERE username = :username"),
            {"username": email}
        ).fetchone()

        if not user:
            db.execute(text("""
                INSERT INTO usuarios (username, password)
                VALUES (:username, :password)
            """), {
                "username": email,
                "password": "google_user"
            })
            db.commit()

            user = db.execute(
                text("SELECT * FROM usuarios WHERE username = :username"),
                {"username": email}
            ).fetchone()

        db.close()

        token_jwt = crear_token({"user_id": user[0]})

        return {"access_token": token_jwt}

    except Exception as e:
        print("ERROR GOOGLE:", e)
        raise HTTPException(401, "Token inválido")