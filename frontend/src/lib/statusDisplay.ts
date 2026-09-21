import type { NodeStatus } from '../api/types'

interface StatusDisplay {
  label: string
  color: string
}

const STATUS_DISPLAY: Record<NodeStatus, StatusDisplay> = {
  complete: { label: 'Complete', color: '#5f7a3d' },
  in_progress: { label: 'In Progress', color: '#b8860b' },
  next: { label: 'Next Step', color: '#a0522d' },
  locked: { label: 'Locked', color: '#8a7f6a' },
}

export function statusDisplay(status: NodeStatus): StatusDisplay {
  return STATUS_DISPLAY[status]
}
