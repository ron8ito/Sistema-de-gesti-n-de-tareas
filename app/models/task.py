from sqlalchemy import Column, Integer, String, ForeignKey
from app.database.connection import Base

class Task(Base):
    __tablename__ = "tareas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(100))
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    descripcion = Column(String(200))
    fecha_vencimiento = Column(String(50))
    estado = Column(String(20))