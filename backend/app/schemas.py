from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models import AnnotationType
from app.status import Status


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    done: Optional[bool] = None
    notes: Optional[str] = None


class TaskOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    node_id: int
    parent_task_id: Optional[int]
    title: str
    done: bool
    notes: Optional[str]
    created_at: datetime
    subtasks: list["TaskOut"] = []


TaskOut.model_rebuild()


class NodeCreate(BaseModel):
    title: str
    description: Optional[str] = None
    position_x: float = 0
    position_y: float = 0


class NodeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position_x: Optional[float] = None
    position_y: Optional[float] = None


class NodeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    description: Optional[str]
    position_x: float
    position_y: float
    status: Status
    total_tasks: int
    done_tasks: int
    tasks: list[TaskOut] = []


class EdgeCreate(BaseModel):
    source_node_id: int
    target_node_id: int


class EdgeUpdate(BaseModel):
    color: str


class EdgeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    source_node_id: int
    target_node_id: int
    color: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class ProjectSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: Optional[str]
    created_at: datetime
    percent_complete: float
    next_step_titles: list[str]


class AnnotationCreate(BaseModel):
    type: AnnotationType
    x: float
    y: float
    width: float
    height: float
    points: Optional[list[list[float]]] = None
    text: Optional[str] = None
    color: str


class AnnotationUpdate(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    text: Optional[str] = None
    color: Optional[str] = None


class AnnotationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    type: AnnotationType
    x: float
    y: float
    width: float
    height: float
    points: Optional[list[list[float]]]
    text: Optional[str]
    color: str


class ProjectGraph(BaseModel):
    id: int
    name: str
    description: Optional[str]
    nodes: list[NodeOut]
    edges: list[EdgeOut]
    annotations: list[AnnotationOut]


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
