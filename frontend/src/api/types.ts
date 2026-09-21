export type NodeStatus = 'complete' | 'in_progress' | 'next' | 'locked'

export interface Task {
  id: number
  node_id: number
  title: string
  done: boolean
  created_at: string
}

export interface RoadmapNode {
  id: number
  project_id: number
  title: string
  description: string | null
  position_x: number
  position_y: number
  status_override: NodeStatus | null
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
}
