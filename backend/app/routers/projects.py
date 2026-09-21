from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.graph import compute_node_statuses, next_step_titles, node_to_dict, project_percent_complete
from app.models import Node, Project, User
from app.schemas import NodeOut, ProjectCreate, ProjectGraph, ProjectSummary, ProjectUpdate
from app.security import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])


def _get_project_or_404(db: Session, project_id: int) -> Project:
    project = (
        db.query(Project)
        .options(
            selectinload(Project.nodes).selectinload(Node.tasks),
            selectinload(Project.edges),
            selectinload(Project.annotations),
        )
        .filter(Project.id == project_id)
        .first()
    )
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return project


@router.get("", response_model=list[ProjectSummary])
def list_projects(
    db: Session = Depends(get_db), _user: User = Depends(get_current_user)
):
    projects = (
        db.query(Project)
        .options(selectinload(Project.nodes).selectinload(Node.tasks), selectinload(Project.edges))
        .order_by(Project.id)
        .all()
    )
    result = []
    for project in projects:
        statuses = compute_node_statuses(project.nodes, project.edges)
        result.append(
            ProjectSummary(
                id=project.id,
                name=project.name,
                description=project.description,
                created_at=project.created_at,
                percent_complete=project_percent_complete(project.nodes),
                next_step_titles=next_step_titles(project.nodes, statuses),
            )
        )
    return result


@router.post("", response_model=ProjectSummary, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    project = Project(name=payload.name, description=payload.description)
    db.add(project)
    db.commit()
    db.refresh(project)
    return ProjectSummary(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        percent_complete=0.0,
        next_step_titles=[],
    )


@router.put("/{project_id}", response_model=ProjectSummary)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    if payload.name is not None:
        project.name = payload.name
    if payload.description is not None:
        project.description = payload.description
    db.commit()
    db.refresh(project)
    statuses = compute_node_statuses(project.nodes, project.edges)
    return ProjectSummary(
        id=project.id,
        name=project.name,
        description=project.description,
        created_at=project.created_at,
        percent_complete=project_percent_complete(project.nodes),
        next_step_titles=next_step_titles(project.nodes, statuses),
    )


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    db.delete(project)
    db.commit()


@router.get("/{project_id}/graph", response_model=ProjectGraph)
def get_project_graph(
    project_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    project = _get_project_or_404(db, project_id)
    statuses = compute_node_statuses(project.nodes, project.edges)
    nodes = [
        NodeOut(**node_to_dict(node, statuses[node.id])) for node in project.nodes
    ]
    return ProjectGraph(
        id=project.id,
        name=project.name,
        description=project.description,
        nodes=nodes,
        edges=project.edges,
        annotations=project.annotations,
    )
