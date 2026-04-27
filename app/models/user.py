# =========================================================
# MODELO USER (USUARIO)
# =========================================================
# Este archivo define la estructura de la tabla "usuarios"
# en la base de datos usando SQLAlchemy (ORM).
#
# Representa a los usuarios del sistema, quienes pueden:
# - registrarse
# - iniciar sesión
# - crear tareas
# =========================================================

# =========================
# IMPORTACIONES
# =========================

# Column: define columnas de la tabla
# Integer, String: tipos de datos
from sqlalchemy import Column, Integer, String

# Base: clase base para todos los modelos (conexión ORM)
from app.database.connection import Base

# =========================
# CLASE USER
# =========================
# Representa la tabla "usuarios" en la base de datos
class User(Base):

    # Nombre de la tabla en MySQL
    __tablename__ = "usuarios"

    # =========================
    # COLUMNAS
    # =========================

    # ID único del usuario (clave primaria)
    id = Column(Integer, primary_key=True, index=True)

    # Nombre de usuario (único)
    # - no se pueden repetir usuarios
    # - index=True mejora velocidad de búsqueda
    username = Column(String(50), unique=True, index=True)

    # Contraseña del usuario
    # - se almacena en formato hash (seguridad)
    # - longitud suficiente para bcrypt
    password = Column(String(100))