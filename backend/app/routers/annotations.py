from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Annotation, Project, User
from app.schemas import AnnotationCreate, AnnotationOut, AnnotationUpdate
from app.security import get_current_user

router = APIRouter(tags=["annotations"])


@router.post(
    "/projects/{project_id}/annotations",
    response_model=AnnotationOut,
    status_code=status.HTTP_201_CREATED,
)
def create_annotation(
    project_id: int,
    payload: AnnotationCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    annotation = Annotation(project_id=project_id, **payload.model_dump())
    db.add(annotation)
    db.commit()
    db.refresh(annotation)
    return annotation


@router.put("/annotations/{annotation_id}", response_model=AnnotationOut)
def update_annotation(
    annotation_id: int,
    payload: AnnotationUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if annotation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotation not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(annotation, field, value)
    db.commit()
    db.refresh(annotation)
    return annotation


@router.delete("/annotations/{annotation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_annotation(
    annotation_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    annotation = db.query(Annotation).filter(Annotation.id == annotation_id).first()
    if annotation is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotation not found")
    db.delete(annotation)
    db.commit()
