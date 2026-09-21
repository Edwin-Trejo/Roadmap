import type { NodeStatus } from '../api/types'

interface StatusDisplay {
  label: string
  color: string
}

const STATUS_DISPLAY: Record<NodeStatus, StatusDisplay> = {
  complete: { label: 'Complete', color: '#16a34a' },
  in_progress: { label: 'In Progress', color: '#d97706' },
  next: { label: 'Next Step', color: '#2563eb' },
  locked: { label: 'Locked', color: '#64748b' },
}

export function statusDisplay(status: NodeStatus): StatusDisplay {
  return STATUS_DISPLAY[status]
}
