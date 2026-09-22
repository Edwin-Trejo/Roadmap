import { describe, expect, it } from 'vitest'
import { getNodeConnections } from './connections'

const titleById = { 1: 'Design', 2: 'Build', 3: 'Launch' }

describe('getNodeConnections', () => {
  it('returns empty arrays when a node has no edges', () => {
    const result = getNodeConnections({ nodeId: 1, edges: [], titleById })
    expect(result).toEqual({ dependsOn: [], leadsTo: [] })
  })

  it('lists outgoing edges as leadsTo', () => {
    const result = getNodeConnections({
      nodeId: 1,
      edges: [{ source_node_id: 1, target_node_id: 2 }],
      titleById,
    })
    expect(result.leadsTo).toEqual(['Build'])
    expect(result.dependsOn).toEqual([])
  })

  it('lists incoming edges as dependsOn', () => {
    const result = getNodeConnections({
      nodeId: 2,
      edges: [{ source_node_id: 1, target_node_id: 2 }],
      titleById,
    })
    expect(result.dependsOn).toEqual(['Design'])
    expect(result.leadsTo).toEqual([])
  })

  it('handles a node that both depends on and leads to others', () => {
    const result = getNodeConnections({
      nodeId: 2,
      edges: [
        { source_node_id: 1, target_node_id: 2 },
        { source_node_id: 2, target_node_id: 3 },
      ],
      titleById,
    })
    expect(result.dependsOn).toEqual(['Design'])
    expect(result.leadsTo).toEqual(['Launch'])
  })
})
