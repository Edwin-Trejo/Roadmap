import { Handle, Position, type NodeProps } from '@xyflow/react'
import { statusDisplay } from '../lib/statusDisplay'
import type { NodeStatus } from '../api/types'

export interface RoadmapNodeData extends Record<string, unknown> {
  title: string
  status: NodeStatus
  totalTasks: number
  doneTasks: number
}

export function RoadmapNode({ data, selected }: NodeProps) {
  const nodeData = data as RoadmapNodeData
  const { label, color } = statusDisplay(nodeData.status)
  const progress =
    nodeData.totalTasks === 0 ? 0 : Math.round((nodeData.doneTasks / nodeData.totalTasks) * 100)

  return (
    <div
      className="min-w-[180px] rounded-lg border-2 bg-white px-4 py-3 shadow-sm dark:bg-slate-800"
      style={{ borderColor: color, boxShadow: selected ? `0 0 0 2px ${color}` : undefined }}
    >
      <Handle type="target" position={Position.Left} />
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {nodeData.title}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span style={{ color }} className="font-medium">
          {label}
        </span>
        <span className="text-slate-400">
          {nodeData.doneTasks}/{nodeData.totalTasks}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
