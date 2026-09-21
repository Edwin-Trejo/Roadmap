from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.graph import compute_node_statuses, node_to_dict
from app.models import Edge, Node, Project, User
from app.schemas import NodeCreate, NodeOut, NodeUpdate
from app.security import get_current_user

router = APIRouter(tags=["nodes"])


def _get_project_or_404(db: Session, project_id: int) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


def _get_node_or_404(db: Session, node_id: int) -> Node:
    node = (
        db.query(Node)
        .options(selectinload(Node.tasks))
        .filter(Node.id == node_id)
        .first()
    )
    if node is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    return node


def _node_status(db: Session, node: Node):
    project = db.query(Project).filter(Project.id == node.project_id).first()
    statuses = compute_node_statuses(project.nodes, project.edges)
    return statuses[node.id]


@router.post(
    "/projects/{project_id}/nodes", response_model=NodeOut, status_code=status.HTTP_201_CREATED
)
def create_node(
    project_id: int,
    payload: NodeCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    _get_project_or_404(db, project_id)
    node = Node(
        project_id=project_id,
        title=payload.title,
        description=payload.description,
        position_x=payload.position_x,
        position_y=payload.position_y,
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return NodeOut(**node_to_dict(node, _node_status(db, node)))


@router.put("/nodes/{node_id}", response_model=NodeOut)
def update_node(
    node_id: int,
    payload: NodeUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    node = _get_node_or_404(db, node_id)
    if payload.title is not None:
        node.title = payload.title
    if payload.description is not None:
        node.description = payload.description
    if payload.position_x is not None:
        node.position_x = payload.position_x
    if payload.position_y is not None:
        node.position_y = payload.position_y
    if payload.clear_status_override:
        node.status_override = None
    elif payload.status_override is not None:
        node.status_override = payload.status_override
    db.commit()
    db.refresh(node)
    return NodeOut(**node_to_dict(node, _node_status(db, node)))


@router.delete("/nodes/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(
    node_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    node = _get_node_or_404(db, node_id)
    db.query(Edge).filter(
        (Edge.source_node_id == node_id) | (Edge.target_node_id == node_id)
    ).delete(synchronize_session=False)
    db.delete(node)
    db.commit()
