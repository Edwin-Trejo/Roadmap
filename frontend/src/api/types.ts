export type NodeStatus = 'complete' | 'in_progress' | 'next' | 'locked'

export interface Task {
  id: number
  node_id: number
  parent_task_id: number | null
  title: string
  done: boolean
  notes: string | null
  created_at: string
  subtasks: Task[]
}

export interface RoadmapNode {
  id: number
  project_id: number
  title: string
  description: string | null
  position_x: number
  position_y: number
  status: NodeStatus
  total_tasks: number
  done_tasks: number
  tasks: Task[]
}

export interface Edge {
  id: number
  project_id: number
  source_node_id: number
  target_node_id: number
  color: string
}

export type AnnotationType = 'rectangle' | 'circle' | 'arrow' | 'text' | 'freehand'

export interface Annotation {
  id: number
  project_id: number
  type: AnnotationType
  x: number
  y: number
  width: number
  height: number
  points: [number, number][] | null
  text: string | null
  color: string
}

export interface ProjectSummary {
  id: number
  name: string
  description: string | null
  created_at: string
  percent_complete: number
  next_step_titles: string[]
}

export interface ProjectGraph {
  id: number
  name: string
  description: string | null
  nodes: RoadmapNode[]
  edges: Edge[]
  annotations: Annotation[]
}
