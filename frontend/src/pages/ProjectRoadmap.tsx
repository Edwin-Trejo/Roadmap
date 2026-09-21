import {
  addEdge,
  Background,
  MarkerType,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { EdgeToolbar } from '../components/EdgeToolbar'
import { RoadmapNode, type RoadmapNodeData } from '../components/RoadmapNode'
import { TaskPanel } from '../components/TaskPanel'
import { ThemeToggle } from '../components/ThemeToggle'

const nodeTypes = { roadmap: RoadmapNode }

function edgeStyle(color: string) {
  return { markerEnd: { type: MarkerType.ArrowClosed, color }, style: { stroke: color } }
}

export function ProjectRoadmap() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null)
  const [nameDraft, setNameDraft] = useState('')

  const { data: graph, isLoading } = useQuery({
    queryKey: ['graph', projectId],
    queryFn: () => api.getGraph(projectId),
  })

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RoadmapNodeData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    if (!graph) return
    setNodes(
      graph.nodes.map((n) => ({
        id: String(n.id),
        type: 'roadmap',
        position: { x: n.position_x, y: n.position_y },
        data: {
          title: n.title,
          status: n.status,
          totalTasks: n.total_tasks,
          doneTasks: n.done_tasks,
        },
      })),
    )
    setEdges(
      graph.edges.map((e) => ({
        id: String(e.id),
        source: String(e.source_node_id),
        target: String(e.target_node_id),
        ...edgeStyle(e.color),
      })),
    )
    setNameDraft(graph.name)
  }, [graph, setNodes, setEdges])

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['graph', projectId] })
  }, [queryClient, projectId])

  const createNodeMutation = useMutation({
    mutationFn: (position: { x: number; y: number }) =>
      api.createNode(projectId, {
        title: 'New Phase',
        position_x: position.x,
        position_y: position.y,
      }),
    onSuccess: invalidate,
  })

  const updatePosition = useMutation({
    mutationFn: ({ id, x, y }: { id: number; x: number; y: number }) =>
      api.updateNode(id, { position_x: x, position_y: y }),
  })

  const renameProject = useMutation({
    mutationFn: (name: string) => api.updateProject(projectId, { name }),
    onSuccess: invalidate,
  })

  const createEdgeMutation = useMutation({
    mutationFn: (connection: Connection) =>
      api.createEdge(projectId, Number(connection.source), Number(connection.target)),
    onSuccess: invalidate,
  })

  const deleteEdgeMutation = useMutation({
    mutationFn: (id: number) => api.deleteEdge(id),
    onSuccess: invalidate,
  })

  const updateEdgeColorMutation = useMutation({
    mutationFn: ({ id, color }: { id: number; color: string }) => api.updateEdge(id, color),
    onSuccess: invalidate,
  })

  const deleteNodeMutation = useMutation({
    mutationFn: (id: number) => api.deleteNode(id),
    onSuccess: invalidate,
  })

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, ...edgeStyle('#8a6d4a') }, eds))
      createEdgeMutation.mutate(connection)
    },
    [setEdges, createEdgeMutation],
  )

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      updatePosition.mutate({ id: Number(node.id), x: node.position.x, y: node.position.y })
    },
    [updatePosition],
  )

  const onNodeClick = useCallback((_event: unknown, node: Node) => {
    setSelectedNodeId(Number(node.id))
    setSelectedEdgeId(null)
  }, [])

  const onEdgeClick = useCallback((_event: unknown, edge: Edge) => {
    setSelectedEdgeId(Number(edge.id))
    setSelectedNodeId(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null)
  }, [])

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((e) => deleteEdgeMutation.mutate(Number(e.id)))
      setSelectedEdgeId(null)
    },
    [deleteEdgeMutation],
  )

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((n) => {
        deleteNodeMutation.mutate(Number(n.id))
        setSelectedNodeId((current) => (current === Number(n.id) ? null : current))
      })
    },
    [deleteNodeMutation],
  )

  const selectedNode = useMemo(
    () => graph?.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph, selectedNodeId],
  )

  const selectedEdge = useMemo(
    () => graph?.edges.find((e) => e.id === selectedEdgeId) ?? null,
    [graph, selectedEdgeId],
  )

  function handleAddNode() {
    createNodeMutation.mutate({ x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 })
  }

  function handleNameBlur() {
    const trimmed = nameDraft.trim()
    if (graph && trimmed && trimmed !== graph.name) {
      renameProject.mutate(trimmed)
    } else if (graph) {
      setNameDraft(graph.name)
    }
  }

  if (isLoading) return <p className="p-10 text-[var(--ink-muted)]">Loading…</p>
  if (!graph) return null

  return (
    <div className="flex h-screen flex-col bg-[var(--bg)]">
      <header className="flex items-center justify-between border-b border-[var(--border-earth)] bg-[var(--surface)] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            ← Dashboard
          </button>
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
            }}
            className="rounded-md border border-transparent bg-transparent text-lg font-semibold text-[var(--ink)] hover:border-[var(--border-earth)] focus:border-[var(--accent)] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleAddNode}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--accent-fg)] hover:bg-[var(--accent-hover)]"
          >
            + Add Node
          </button>
        </div>
      </header>

      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          fitView
        >
          <Background />
        </ReactFlow>

        {selectedEdge && (
          <EdgeToolbar
            color={selectedEdge.color}
            onDelete={() => {
              deleteEdgeMutation.mutate(selectedEdge.id)
              setSelectedEdgeId(null)
            }}
            onColorChange={(color) =>
              updateEdgeColorMutation.mutate({ id: selectedEdge.id, color })
            }
          />
        )}

        {selectedNode && (
          <TaskPanel
            node={selectedNode}
            projectId={projectId}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}
