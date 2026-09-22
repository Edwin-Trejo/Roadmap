export interface EdgeLike {
  source_node_id: number
  target_node_id: number
}

export interface ConnectionsInput {
  nodeId: number
  edges: EdgeLike[]
  titleById: Record<number, string>
}

export interface NodeConnections {
  dependsOn: string[]
  leadsTo: string[]
}

export function getNodeConnections({ nodeId, edges, titleById }: ConnectionsInput): NodeConnections {
  const dependsOn = edges
    .filter((e) => e.target_node_id === nodeId)
    .map((e) => titleById[e.source_node_id])
    .filter((title): title is string => Boolean(title))

  const leadsTo = edges
    .filter((e) => e.source_node_id === nodeId)
    .map((e) => titleById[e.target_node_id])
    .filter((title): title is string => Boolean(title))

  return { dependsOn, leadsTo }
}
