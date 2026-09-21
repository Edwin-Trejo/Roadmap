from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Edge, Node, Project, User
from app.schemas import EdgeCreate, EdgeOut
from app.security import get_current_user

router = APIRouter(tags=["edges"])


@router.post(
    "/projects/{project_id}/edges", response_model=EdgeOut, status_code=status.HTTP_201_CREATED
)
def create_edge(
    project_id: int,
    payload: EdgeCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    for node_id in (payload.source_node_id, payload.target_node_id):
        node = db.query(Node).filter(Node.id == node_id, Node.project_id == project_id).first()
        if node is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Node {node_id} not found in this project",
            )

    edge = Edge(
        project_id=project_id,
        source_node_id=payload.source_node_id,
        target_node_id=payload.target_node_id,
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)
    return edge


@router.delete("/edges/{edge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_edge(
    edge_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    edge = db.query(Edge).filter(Edge.id == edge_id).first()
    if edge is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Edge not found")
    db.delete(edge)
    db.commit()
