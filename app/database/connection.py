# =========================================================
# CONEXIÓN A BASE DE DATOS
# =========================================================
# Este archivo configura la conexión entre la aplicación
# FastAPI y la base de datos MySQL utilizando SQLAlchemy.
#
# Incluye:
# - Engine (conexión principal)
# - Session (manejo de consultas)
# - Base (para modelos ORM)
# =========================================================

# =========================
# IMPORTACIONES
# =========================
import os
# create_engine: crea la conexión con la base de datos
from sqlalchemy import create_engine
from dotenv import load_dotenv
load_dotenv()


# sessionmaker: crea sesiones para interactuar con la BD
# declarative_base: base para definir modelos (tablas)
from sqlalchemy.orm import sessionmaker, declarative_base

# =========================
# URL DE CONEXIÓN
# =========================
# Formato:
# mysql+pymysql://usuario:password@host:puerto/database
#
# En este caso:
# - Motor: MySQL
# - Driver: pymysql
# - Usuario: root
# - Base de datos: railway
#
# import os
DATABASE_URL = os.getenv("DATABASE_URL")

# =========================
# ENGINE
# =========================
# El engine es la conexión principal a la base de datos.
# Se encarga de:
# - abrir conexiones
# - ejecutar consultas
# - manejar el pool de conexiones
engine = create_engine(DATABASE_URL)

# =========================
# SESSION LOCAL
# =========================
# SessionLocal es una fábrica de sesiones.
#
# Cada vez que llamas:
# db = SessionLocal()
#
# obtienes una conexión independiente para:
# - ejecutar consultas (SELECT, INSERT, UPDATE, DELETE)
# - hacer commit o rollback
#
# Parámetros:
# autocommit=False → debes hacer commit manual
# autoflush=False → no envía cambios automáticamente
# bind=engine → conecta con la base de datos
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =========================
# BASE
# =========================
# Base es la clase base para definir modelos de la BD.
#
# Ejemplo:
# class Usuario(Base):
#     __tablename__ = "usuarios"
#
# SQLAlchemy usará esta base para:
# - crear tablas automáticamente
# - mapear objetos Python ↔ tablas SQL
Base = declarative_base()