# =========================================================
# MODELO TASK (TAREA)
# =========================================================
# Este archivo define la estructura de la tabla "tareas"
# en la base de datos utilizando SQLAlchemy (ORM).
#
# Permite mapear objetos Python ↔ registros en MySQL
# =========================================================


# =========================
# IMPORTACIONES
# =========================

# Column: define columnas de la tabla
# Integer, String: tipos de datos
# ForeignKey: relación con otra tabla
from sqlalchemy import Column, Integer, String, ForeignKey

# Base: clase base para todos los modelos
from app.database.connection import Base


# =========================
# CLASE TASK
# =========================
# Representa la tabla "tareas" en la base de datos
class Task(Base):

    # Nombre de la tabla en MySQL
    __tablename__ = "tareas"


    # =========================
    # COLUMNAS
    # =========================

    # ID único de la tarea (clave primaria)
    id = Column(Integer, primary_key=True, index=True)

    # Título de la tarea (máx 100 caracteres)
    titulo = Column(String(100))

    # ID del usuario al que pertenece la tarea
    # Relación con la tabla "usuarios"
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    # Descripción de la tarea
    descripcion = Column(String(200))

    # Fecha límite (se guarda como texto)
    # Ejemplo: "2025-04-10"
    fecha_vencimiento = Column(String(50))

    # Estado de la tarea
    # Ejemplo: "pendiente", "completada"
    estado = Column(String(20))