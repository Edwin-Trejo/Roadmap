import {
  addEdge,
  Background,
  Controls,
  MarkerType,
  MiniMap,
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
import { RoadmapNode, type RoadmapNodeData } from '../components/RoadmapNode'
import { TaskPanel } from '../components/TaskPanel'

const nodeTypes = { roadmap: RoadmapNode }

export function ProjectRoadmap() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)

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
        markerEnd: { type: MarkerType.ArrowClosed },
      })),
    )
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

  const createEdgeMutation = useMutation({
    mutationFn: (connection: Connection) =>
      api.createEdge(projectId, Number(connection.source), Number(connection.target)),
    onSuccess: invalidate,
  })

  const deleteEdgeMutation = useMutation({
    mutationFn: (id: number) => api.deleteEdge(id),
    onSuccess: invalidate,
  })

  const deleteNodeMutation = useMutation({
    mutationFn: (id: number) => api.deleteNode(id),
    onSuccess: invalidate,
  })

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed } }, eds))
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
  }, [])

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((e) => deleteEdgeMutation.mutate(Number(e.id)))
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

  function handleAddNode() {
    createNodeMutation.mutate({ x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 })
  }

  if (isLoading) return <p className="p-10 text-slate-500">Loading…</p>
  if (!graph) return null

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            ← Dashboard
          </button>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {graph.name}
          </h1>
        </div>
        <button
          onClick={handleAddNode}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Node
        </button>
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
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>

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
