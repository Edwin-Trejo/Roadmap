import type { ProjectGraph } from '../api/types'
import { getNodeConnections } from '../lib/connections'
import { NodeCard } from './NodeCard'
import { StatusBoard } from './StatusBoard'

export function TableView({ graph, projectId }: { graph: ProjectGraph; projectId: number }) {
  const titleById = Object.fromEntries(graph.nodes.map((n) => [n.id, n.title]))

  return (
    <StatusBoard
      nodes={graph.nodes}
      renderCard={(node) => {
        const { dependsOn, leadsTo } = getNodeConnections({
          nodeId: node.id,
          edges: graph.edges,
          titleById,
        })
        return (
          <NodeCard
            key={node.id}
            node={node}
            projectId={projectId}
            dependsOn={dependsOn}
            leadsTo={leadsTo}
          />
        )
      }}
    />
  )
}
