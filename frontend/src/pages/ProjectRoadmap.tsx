import {
  addEdge,
  Background,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'
import { AnnotationToolbar, type AnnotationTool } from '../components/AnnotationToolbar'
import { ArrowAnnotation } from '../components/annotations/ArrowAnnotation'
import { CircleAnnotation } from '../components/annotations/CircleAnnotation'
import { FreehandAnnotation } from '../components/annotations/FreehandAnnotation'
import { RectangleAnnotation } from '../components/annotations/RectangleAnnotation'
import { TextAnnotation } from '../components/annotations/TextAnnotation'
import { RoadmapNode } from '../components/RoadmapNode'
import { SelectionToolbar } from '../components/SelectionToolbar'
import { TaskPanel } from '../components/TaskPanel'
import { ThemeToggle } from '../components/ThemeToggle'
import { normalizePoints, type Point } from '../lib/geometry'
import { DEFAULT_EDGE_COLOR, EDGE_COLOR_PALETTE } from '../lib/palette'
import type { AnnotationType } from '../api/types'

const nodeTypes = {
  roadmap: RoadmapNode,
  'annotation-rectangle': RectangleAnnotation,
  'annotation-circle': CircleAnnotation,
  'annotation-text': TextAnnotation,
  'annotation-arrow': ArrowAnnotation,
  'annotation-freehand': FreehandAnnotation,
}

const DEFAULT_SHAPE_SIZE: Record<string, { width: number; height: number }> = {
  rectangle: { width: 140, height: 90 },
  circle: { width: 100, height: 100 },
  text: { width: 160, height: 44 },
}

function edgeStyle(color: string) {
  return { markerEnd: { type: MarkerType.ArrowClosed, color }, style: { stroke: color } }
}

const annotationNodeId = (id: number) => `a${id}`
const isAnnotationNodeId = (id: string) => id.startsWith('a')
const annotationDbId = (id: string) => Number(id.slice(1))

function ProjectRoadmapCanvas({ projectId }: { projectId: number }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const rf = useReactFlow()
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<number | null>(null)
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<number | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [activeTool, setActiveTool] = useState<AnnotationTool>('select')
  const [toolColor, setToolColor] = useState<string>(EDGE_COLOR_PALETTE[0])
  const [drawingPoints, setDrawingPoints] = useState<Point[] | null>(null)
  const isDrawingRef = useRef(false)

  const { data: graph, isLoading } = useQuery({
    queryKey: ['graph', projectId],
    queryFn: () => api.getGraph(projectId),
  })

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

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

  const createAnnotationMutation = useMutation({
    mutationFn: (data: {
      type: AnnotationType
      x: number
      y: number
      width: number
      height: number
      points?: Point[] | null
      text?: string | null
      color: string
    }) => api.createAnnotation(projectId, data),
    onSuccess: invalidate,
  })

  const updateAnnotationMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<{ x: number; y: number; width: number; height: number; text: string; color: string }>
    }) => api.updateAnnotation(id, data),
    onSuccess: invalidate,
  })

  const deleteAnnotationMutation = useMutation({
    mutationFn: (id: number) => api.deleteAnnotation(id),
    onSuccess: invalidate,
  })

  useEffect(() => {
    if (!graph) return
    const roadmapNodes: Node[] = graph.nodes.map((n) => ({
      id: String(n.id),
      type: 'roadmap',
      position: { x: n.position_x, y: n.position_y },
      data: {
        title: n.title,
        status: n.status,
        totalTasks: n.total_tasks,
        doneTasks: n.done_tasks,
      },
    }))

    const annotationNodes: Node[] = graph.annotations.map((a) => {
      const base = {
        id: annotationNodeId(a.id),
        type: `annotation-${a.type}`,
        position: { x: a.x, y: a.y },
        width: a.width,
        height: a.height,
      }
      if (a.type === 'text') {
        return {
          ...base,
          data: {
            color: a.color,
            text: a.text ?? '',
            onTextChange: (text: string) => updateAnnotationMutation.mutate({ id: a.id, data: { text } }),
            onResizeEnd: (dims: { x: number; y: number; width: number; height: number }) =>
              updateAnnotationMutation.mutate({ id: a.id, data: dims }),
          },
        }
      }
      if (a.type === 'rectangle' || a.type === 'circle') {
        return {
          ...base,
          data: {
            color: a.color,
            onResizeEnd: (dims: { x: number; y: number; width: number; height: number }) =>
              updateAnnotationMutation.mutate({ id: a.id, data: dims }),
          },
        }
      }
      return {
        ...base,
        data: { color: a.color, points: a.points ?? [] },
      }
    })

    setNodes([...roadmapNodes, ...annotationNodes])
    setEdges(
      graph.edges.map((e) => ({
        id: String(e.id),
        source: String(e.source_node_id),
        target: String(e.target_node_id),
        ...edgeStyle(e.color),
      })),
    )
    setNameDraft(graph.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, setNodes, setEdges])

  const previewNode: Node | null = useMemo(() => {
    if (!drawingPoints || drawingPoints.length < 2) return null
    if (activeTool !== 'arrow' && activeTool !== 'freehand') return null
    const { x, y, width, height, localPoints } = normalizePoints(drawingPoints)
    return {
      id: '__preview__',
      type: activeTool === 'arrow' ? 'annotation-arrow' : 'annotation-freehand',
      position: { x, y },
      width,
      height,
      draggable: false,
      selectable: false,
      data: { color: toolColor, points: localPoints },
    }
  }, [drawingPoints, activeTool, toolColor])

  const displayNodes = useMemo(
    () => (previewNode ? [...nodes, previewNode] : nodes),
    [nodes, previewNode],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, ...edgeStyle(DEFAULT_EDGE_COLOR) }, eds))
      createEdgeMutation.mutate(connection)
    },
    [setEdges, createEdgeMutation],
  )

  const onNodeDragStop = useCallback(
    (_event: unknown, node: Node) => {
      if (isAnnotationNodeId(node.id)) {
        updateAnnotationMutation.mutate({
          id: annotationDbId(node.id),
          data: { x: node.position.x, y: node.position.y },
        })
      } else {
        updatePosition.mutate({ id: Number(node.id), x: node.position.x, y: node.position.y })
      }
    },
    [updatePosition, updateAnnotationMutation],
  )

  const onNodeClick = useCallback((_event: unknown, node: Node) => {
    if (isAnnotationNodeId(node.id)) {
      setSelectedAnnotationId(annotationDbId(node.id))
      setSelectedNodeId(null)
      setSelectedEdgeId(null)
    } else {
      setSelectedNodeId(Number(node.id))
      setSelectedAnnotationId(null)
      setSelectedEdgeId(null)
    }
  }, [])

  const onEdgeClick = useCallback((_event: unknown, edge: Edge) => {
    setSelectedEdgeId(Number(edge.id))
    setSelectedNodeId(null)
    setSelectedAnnotationId(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdgeId(null)
    setSelectedAnnotationId(null)
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
        if (isAnnotationNodeId(n.id)) {
          const id = annotationDbId(n.id)
          deleteAnnotationMutation.mutate(id)
          setSelectedAnnotationId((current) => (current === id ? null : current))
        } else {
          deleteNodeMutation.mutate(Number(n.id))
          setSelectedNodeId((current) => (current === Number(n.id) ? null : current))
        }
      })
    },
    [deleteNodeMutation, deleteAnnotationMutation],
  )

  const selectedNode = useMemo(
    () => graph?.nodes.find((n) => n.id === selectedNodeId) ?? null,
    [graph, selectedNodeId],
  )

  const selectedEdge = useMemo(
    () => graph?.edges.find((e) => e.id === selectedEdgeId) ?? null,
    [graph, selectedEdgeId],
  )

  const selectedAnnotation = useMemo(
    () => graph?.annotations.find((a) => a.id === selectedAnnotationId) ?? null,
    [graph, selectedAnnotationId],
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

  function handleOverlayClick(e: React.MouseEvent) {
    if (activeTool !== 'rectangle' && activeTool !== 'circle' && activeTool !== 'text') return
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    const size = DEFAULT_SHAPE_SIZE[activeTool]
    createAnnotationMutation.mutate({
      type: activeTool,
      x: pos.x - size.width / 2,
      y: pos.y - size.height / 2,
      width: size.width,
      height: size.height,
      color: toolColor,
      text: activeTool === 'text' ? '' : undefined,
    })
    setActiveTool('select')
  }

  function handleOverlayMouseDown(e: React.MouseEvent) {
    if (activeTool !== 'arrow' && activeTool !== 'freehand') return
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    isDrawingRef.current = true
    setDrawingPoints([[pos.x, pos.y]])
  }

  function handleOverlayMouseMove(e: React.MouseEvent) {
    if (!isDrawingRef.current) return
    const pos = rf.screenToFlowPosition({ x: e.clientX, y: e.clientY })
    setDrawingPoints((prev) => {
      if (!prev) return prev
      if (activeTool === 'arrow') return [prev[0], [pos.x, pos.y]]
      return [...prev, [pos.x, pos.y]]
    })
  }

  function handleOverlayMouseUp() {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    setDrawingPoints((current) => {
      if (current && current.length >= 2) {
        const { x, y, width, height, localPoints } = normalizePoints(current)
        createAnnotationMutation.mutate({
          type: activeTool === 'arrow' ? 'arrow' : 'freehand',
          x,
          y,
          width,
          height,
          points: localPoints,
          color: toolColor,
        })
      }
      return null
    })
    setActiveTool('select')
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
          nodes={displayNodes}
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

        <div
          className="absolute inset-0"
          style={{
            zIndex: 5,
            cursor: activeTool === 'select' ? undefined : 'crosshair',
            pointerEvents: activeTool === 'select' ? 'none' : 'auto',
          }}
          onClick={handleOverlayClick}
          onMouseDown={handleOverlayMouseDown}
          onMouseMove={handleOverlayMouseMove}
          onMouseUp={handleOverlayMouseUp}
        />

        <AnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          color={toolColor}
          onColorChange={setToolColor}
        />

        {selectedEdge && (
          <SelectionToolbar
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

        {selectedAnnotation && (
          <SelectionToolbar
            color={selectedAnnotation.color}
            onDelete={() => {
              deleteAnnotationMutation.mutate(selectedAnnotation.id)
              setSelectedAnnotationId(null)
            }}
            onColorChange={(color) =>
              updateAnnotationMutation.mutate({ id: selectedAnnotation.id, data: { color } })
            }
          />
        )}

        {selectedNode && (
          <TaskPanel
            key={selectedNode.id}
            node={selectedNode}
            projectId={projectId}
            onClose={() => setSelectedNodeId(null)}
          />
        )}
      </div>
    </div>
  )
}

export function ProjectRoadmap() {
  const { projectId: projectIdParam } = useParams()
  const projectId = Number(projectIdParam)
  return (
    <ReactFlowProvider>
      <ProjectRoadmapCanvas projectId={projectId} />
    </ReactFlowProvider>
  )
}
