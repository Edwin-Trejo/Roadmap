"""add annotations table

Revision ID: 8443a6c2ad63
Revises: 484d9af6662f
Create Date: 2026-09-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "8443a6c2ad63"
down_revision = "484d9af6662f"
branch_labels = None
depends_on = None

DEFAULT_ANNOTATION_COLOR = "#cc5500"

annotation_type = sa.Enum(
    "rectangle", "circle", "arrow", "text", "freehand", name="annotation_type"
)


def upgrade() -> None:
    op.create_table(
        "annotations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("type", annotation_type, nullable=False),
        sa.Column("x", sa.Float(), nullable=False),
        sa.Column("y", sa.Float(), nullable=False),
        sa.Column("width", sa.Float(), nullable=False),
        sa.Column("height", sa.Float(), nullable=False),
        sa.Column("points", sa.JSON(), nullable=True),
        sa.Column("text", sa.String(), nullable=True),
        sa.Column(
            "color", sa.String(), nullable=False, server_default=DEFAULT_ANNOTATION_COLOR
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("annotations")
    annotation_type.drop(op.get_bind(), checkfirst=True)
