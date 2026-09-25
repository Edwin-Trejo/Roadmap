export const BADGE_TEXT = '#fdfbf5'

export const STATUS_COLUMNS = [
  { key: 'complete', label: 'Completed', statuses: ['complete'], badgeColor: '#5f7a3d' },
  { key: 'active', label: 'In Progress', statuses: ['in_progress', 'next'], badgeColor: '#c07a1e' },
  { key: 'locked', label: 'Locked', statuses: ['locked'], badgeColor: '#a13a2b' },
] as const
