"""add edge color, drop node status_override

Revision ID: 5a925413cc21
Revises: deef313aa5a4
Create Date: 2026-09-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "5a925413cc21"
down_revision = "deef313aa5a4"
branch_labels = None
depends_on = None

DEFAULT_EDGE_COLOR = "#8a6d4a"

node_status = sa.Enum(
    "complete", "in_progress", "next", "locked", name="node_status"
)


def upgrade() -> None:
    op.add_column(
        "edges",
        sa.Column("color", sa.String(), nullable=False, server_default=DEFAULT_EDGE_COLOR),
    )
    op.drop_column("nodes", "status_override")
    node_status.drop(op.get_bind(), checkfirst=True)


def downgrade() -> None:
    node_status.create(op.get_bind(), checkfirst=True)
    op.add_column("nodes", sa.Column("status_override", node_status, nullable=True))
    op.drop_column("edges", "color")
