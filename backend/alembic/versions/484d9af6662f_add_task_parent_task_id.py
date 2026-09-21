"""add task parent_task_id for subtasks

Revision ID: 484d9af6662f
Revises: 5a925413cc21
Create Date: 2026-09-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "484d9af6662f"
down_revision = "5a925413cc21"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "tasks",
        sa.Column("parent_task_id", sa.Integer(), sa.ForeignKey("tasks.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tasks", "parent_task_id")
