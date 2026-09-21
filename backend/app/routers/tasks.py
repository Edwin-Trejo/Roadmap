from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.models import Node, Task, User
from app.schemas import TaskCreate, TaskOut, TaskUpdate
from app.security import get_current_user
from app.subtasks import derive_parent_done

router = APIRouter(tags=["tasks"])


def _recompute_parent(db: Session, parent_task_id: int | None) -> None:
    if parent_task_id is None:
        return
    parent = db.query(Task).filter(Task.id == parent_task_id).first()
    if parent is None:
        return
    parent.done = derive_parent_done([t.done for t in parent.subtasks])
    db.commit()


@router.get("/nodes/{node_id}/tasks", response_model=list[TaskOut])
def list_tasks(
    node_id: int,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    node = db.query(Node).filter(Node.id == node_id).first()
    if node is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Node not found")
    return (
        db.query(Task)
        .options(selectinload(Task.subtasks))
        .filter(Task.node_id == node_id, Task.parent_task_id.is_(None))
        .order_by(Task.id)
        .all()
    )


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


@router.post(
    "/tasks/{task_id}/subtasks", response_model=TaskOut, status_code=status.HTTP_201_CREATED
)
def create_subtask(
    task_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    _user: User = Depends(get_current_user),
):
    parent = db.query(Task).filter(Task.id == task_id).first()
    if parent is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    if parent.parent_task_id is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subtasks cannot be nested more than one level",
        )
    subtask = Task(node_id=parent.node_id, parent_task_id=parent.id, title=payload.title)
    db.add(subtask)
    _recompute_parent(db, parent.id)
    db.refresh(subtask)
    return subtask


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
    if payload.done is not None and not task.subtasks:
        task.done = payload.done
    db.commit()
    _recompute_parent(db, task.parent_task_id)
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
    parent_task_id = task.parent_task_id
    db.delete(task)
    db.commit()
    _recompute_parent(db, parent_task_id)
