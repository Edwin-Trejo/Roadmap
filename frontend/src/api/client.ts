const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'roadmap_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new ApiError(res.status, body.detail ?? 'Request failed')
  }

  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  listProjects: () => request<import('./types').ProjectSummary[]>('/projects'),

  createProject: (name: string, description?: string) =>
    request<import('./types').ProjectSummary>('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    }),

  updateProject: (id: number, data: Partial<{ name: string; description: string }>) =>
    request<import('./types').ProjectSummary>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProject: (id: number) => request<void>(`/projects/${id}`, { method: 'DELETE' }),

  getGraph: (projectId: number) =>
    request<import('./types').ProjectGraph>(`/projects/${projectId}/graph`),

  createNode: (
    projectId: number,
    data: { title: string; description?: string; position_x?: number; position_y?: number },
  ) =>
    request<import('./types').RoadmapNode>(`/projects/${projectId}/nodes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateNode: (
    nodeId: number,
    data: Partial<{
      title: string
      description: string
      position_x: number
      position_y: number
    }>,
  ) =>
    request<import('./types').RoadmapNode>(`/nodes/${nodeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteNode: (nodeId: number) => request<void>(`/nodes/${nodeId}`, { method: 'DELETE' }),

  createEdge: (projectId: number, sourceNodeId: number, targetNodeId: number) =>
    request<import('./types').Edge>(`/projects/${projectId}/edges`, {
      method: 'POST',
      body: JSON.stringify({ source_node_id: sourceNodeId, target_node_id: targetNodeId }),
    }),

  updateEdge: (edgeId: number, color: string) =>
    request<import('./types').Edge>(`/edges/${edgeId}`, {
      method: 'PUT',
      body: JSON.stringify({ color }),
    }),

  deleteEdge: (edgeId: number) => request<void>(`/edges/${edgeId}`, { method: 'DELETE' }),

  createTask: (nodeId: number, title: string) =>
    request<import('./types').Task>(`/nodes/${nodeId}/tasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    }),

  updateTask: (taskId: number, data: Partial<{ title: string; done: boolean }>) =>
    request<import('./types').Task>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteTask: (taskId: number) => request<void>(`/tasks/${taskId}`, { method: 'DELETE' }),
}
