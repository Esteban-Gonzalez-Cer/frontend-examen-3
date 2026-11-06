import { STATUS_LABEL } from './presentation'
import type { GraphEdge, GraphNode, NodeStatus } from './types'

export const COL_WIDTH = 210
export const ROW_HEIGHT = 96
export const NODE_WIDTH = 184
export const NODE_HEIGHT = 72

export interface SubjectNodeData extends Record<string, unknown> {
  clave: string
  name: string
  credits: number
  status: NodeStatus
  statusLabel: string
  caption: string
  critical: boolean
  selected: boolean
  gatePct: number | null
}

/** Library-agnostic node/edge descriptions; the UI adapts them to the graph component. */
export interface SubjectFlowNode {
  id: string
  type: 'subject'
  position: { x: number; y: number }
  data: SubjectNodeData
  draggable: boolean
  connectable: boolean
  width: number
  height: number
}

export interface FlowEdgeSpec {
  id: string
  source: string
  target: string
  sourceHandle: string
  targetHandle: string
  animated: boolean
  zIndex: number
  color: string
  width: number
  dashed: boolean
}

function caption(node: GraphNode): string {
  switch (node.status) {
    case 'approved':
      return node.gradeLabel ? `Calif. ${node.gradeLabel}` : 'Aprobada'
    case 'in_progress':
      return 'Cursando'
    case 'failed_sim':
      return node.plannedLabel ? `Recursa ${node.plannedLabel}` : 'Reprobada'
    case 'available':
    case 'planned':
      return node.plannedLabel ?? STATUS_LABEL[node.status]
    default:
      return 'Sin programar'
  }
}

export function toFlowNodes(nodes: GraphNode[], selected: string | null): SubjectFlowNode[] {
  return nodes.map((node) => ({
    id: node.clave,
    type: 'subject',
    position: {
      x: (node.gridCol - 1) * COL_WIDTH,
      // Row 8 holds the special requirements (Servicio Social, Actividades Complementarias).
      y: (node.gridRow - 1) * ROW_HEIGHT + (node.gridRow >= 8 ? 24 : 0),
    },
    data: {
      clave: node.clave,
      name: node.name,
      credits: node.credits,
      status: node.status,
      statusLabel: STATUS_LABEL[node.status],
      caption: caption(node),
      critical: node.onCriticalPath,
      selected: node.clave === selected,
      gatePct: node.minCreditPct,
    },
    draggable: false,
    connectable: false,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  }))
}

export function toFlowEdges(edges: GraphEdge[], nodes: GraphNode[], focus: string | null): FlowEdgeSpec[] {
  const rows = new Map(nodes.map((n) => [n.clave, n]))
  return edges.map((edge) => {
    const source = rows.get(edge.source)
    const target = rows.get(edge.target)
    const sameColumn = source && target && source.gridCol === target.gridCol
    const goesDown = source && target && source.gridRow < target.gridRow
    const touchesFocus = focus !== null && (edge.source === focus || edge.target === focus)
    const color = edge.critical ? '#b57ab8' : touchesFocus ? '#1f1f1f' : 'rgba(31,31,31,0.22)'
    return {
      id: `${edge.type}:${edge.source}->${edge.target}`,
      source: edge.source,
      target: edge.target,
      sourceHandle: sameColumn ? (goesDown ? 'out-bottom' : 'out-top') : 'out-right',
      targetHandle: sameColumn ? (goesDown ? 'in-top' : 'in-bottom') : 'in-left',
      animated: edge.critical,
      zIndex: edge.critical ? 2 : touchesFocus ? 1 : 0,
      color,
      width: edge.critical ? 3 : touchesFocus ? 1.8 : 1.2,
      dashed: edge.type === 'coreq',
    }
  })
}

/** Initial camera: what is still ahead of the student, not the whole history. */
export function focusNodeIds(nodes: GraphNode[]): string[] {
  const ahead = nodes.filter((n) => n.status !== 'approved').map((n) => n.clave)
  return ahead.length ? ahead : nodes.map((n) => n.clave)
}
