from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

DEFAULT_EDGE_COLOR = "#cc5500"
DEFAULT_ANNOTATION_COLOR = "#cc5500"


class AnnotationType(str, PyEnum):
    RECTANGLE = "rectangle"
    CIRCLE = "circle"
    ARROW = "arrow"
    TEXT = "text"
    FREEHAND = "freehand"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    nodes: Mapped[list["Node"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    edges: Mapped[list["Edge"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )
    annotations: Mapped[list["Annotation"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class Node(Base):
    __tablename__ = "nodes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(String, nullable=True)
    position_x: Mapped[float] = mapped_column(Float, default=0)
    position_y: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="nodes")
    tasks: Mapped[list["Task"]] = relationship(
        back_populates="node", cascade="all, delete-orphan"
    )


class Edge(Base):
    __tablename__ = "edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    source_node_id: Mapped[int] = mapped_column(ForeignKey("nodes.id"))
    target_node_id: Mapped[int] = mapped_column(ForeignKey("nodes.id"))
    color: Mapped[str] = mapped_column(String, default=DEFAULT_EDGE_COLOR)

    project: Mapped["Project"] = relationship(back_populates="edges")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    node_id: Mapped[int] = mapped_column(ForeignKey("nodes.id"))
    parent_task_id: Mapped[int | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    title: Mapped[str] = mapped_column(String)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    node: Mapped["Node"] = relationship(back_populates="tasks")
    subtasks: Mapped[list["Task"]] = relationship(
        back_populates="parent_task", cascade="all, delete-orphan"
    )
    parent_task: Mapped["Task | None"] = relationship(back_populates="subtasks", remote_side=[id])


class Annotation(Base):
    __tablename__ = "annotations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    type: Mapped[AnnotationType] = mapped_column(Enum(AnnotationType, name="annotation_type"))
    x: Mapped[float] = mapped_column(Float)
    y: Mapped[float] = mapped_column(Float)
    width: Mapped[float] = mapped_column(Float)
    height: Mapped[float] = mapped_column(Float)
    points: Mapped[list | None] = mapped_column(JSON, nullable=True)
    text: Mapped[str | None] = mapped_column(String, nullable=True)
    color: Mapped[str] = mapped_column(String, default=DEFAULT_ANNOTATION_COLOR)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    project: Mapped["Project"] = relationship(back_populates="annotations")
