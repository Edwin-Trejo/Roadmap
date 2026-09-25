"""drop task notes (superseded by per-node notes via Node.description)

Revision ID: 5b845373073d
Revises: 945156145a14
Create Date: 2026-09-24 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "5b845373073d"
down_revision = "945156145a14"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column("tasks", "notes")


def downgrade() -> None:
    op.add_column("tasks", sa.Column("notes", sa.String(), nullable=True))
