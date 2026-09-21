from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Node, Task, User
from app.schemas import TaskCreate, TaskOut, TaskUpdate
from app.security import get_current_user

router = APIRouter(tags=["tasks"])


@router.get("/nodes/{node_id}/tasks", response_model=list[TaskOut])
def list_tasks(
    node_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    node = db.query(Node).filter(Node.id == node_id).first()
    if node is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    return db.query(Task).filter(Task.node_id == node_id).order_by(Task.id).all()


@router.post("/nodes/{node_id}/tasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    node_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    node = db.query(Node).filter(Node.id == node_id).first()
    if node is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    task = Task(node_id=node_id, title=payload.title)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if payload.title is not None:
        task.title = payload.title
    if payload.done is not None:
        task.done = payload.done
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    db.delete(task)
    db.commit()
