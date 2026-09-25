"""add task notes

Revision ID: 945156145a14
Revises: 8443a6c2ad63
Create Date: 2026-09-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "945156145a14"
down_revision = "8443a6c2ad63"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("tasks", sa.Column("notes", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("tasks", "notes")
