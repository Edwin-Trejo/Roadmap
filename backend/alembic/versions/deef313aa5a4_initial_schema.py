"""initial schema

Revision ID: deef313aa5a4
Revises:
Create Date: 2026-09-20 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "deef313aa5a4"
down_revision = None
branch_labels = None
depends_on = None

DEFAULT_EDGE_COLOR = "#8a6d4a"


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_username", "users", ["username"])

    op.create_table(
        "projects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "nodes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("position_x", sa.Float(), nullable=False, server_default="0"),
        sa.Column("position_y", sa.Float(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "edges",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("project_id", sa.Integer(), sa.ForeignKey("projects.id"), nullable=False),
        sa.Column("source_node_id", sa.Integer(), sa.ForeignKey("nodes.id"), nullable=False),
        sa.Column("target_node_id", sa.Integer(), sa.ForeignKey("nodes.id"), nullable=False),
        sa.Column(
            "color", sa.String(), nullable=False, server_default=DEFAULT_EDGE_COLOR
        ),
    )

    op.create_table(
        "tasks",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("node_id", sa.Integer(), sa.ForeignKey("nodes.id"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("done", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("tasks")
    op.drop_table("edges")
    op.drop_table("nodes")
    op.drop_table("projects")
    op.drop_index("ix_users_username", table_name="users")
    op.drop_table("users")
