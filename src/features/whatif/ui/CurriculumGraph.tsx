import '@xyflow/react/dist/style.css'

import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from '@xyflow/react'
import { memo, useMemo, useState } from 'react'

import { cn } from '@/shared/lib/cn'
import { focusNodeIds, toFlowEdges, toFlowNodes, type SubjectNodeData } from '../model/graphLayout'
import type { GraphEdge, GraphNode, NodeStatus } from '../model/types'

const STATUS_CLASSES: Record<NodeStatus, string> = {
  approved: 'bg-ink text-white border-ink',
  in_progress: 'bg-accent text-ink border-accent-strong',
  failed_sim: 'bg-white text-risk border-risk border-2',
  available: 'bg-white text-ink border-ink/25',
  planned: 'bg-white/70 text-ink border-ink/15',
  unreachable: 'stripes bg-white/40 text-muted border-ink/10',
}

const hidden = { opacity: 0, width: 6, height: 6, border: 0, minWidth: 0, minHeight: 0 }

type SubjectNodeType = Node<SubjectNodeData, 'subject'>

const SubjectNode = memo(function SubjectNode({ data }: NodeProps<SubjectNodeType>) {
  return (
    <div
      className={cn(
        'flex h-[72px] w-[184px] cursor-pointer flex-col justify-between rounded-2xl border px-3 py-2 text-left shadow-sm transition',
        STATUS_CLASSES[data.status],
        data.critical && 'ring-[3px] ring-accent ring-offset-2 ring-offset-[#f3eef4]',
        data.selected && 'outline-2 outline-offset-4 outline-ink',
      )}
      title={`${data.name} · ${data.statusLabel}`}
    >
      <Handle type="target" position={Position.Left} id="in-left" style={hidden} />
      <Handle type="target" position={Position.Top} id="in-top" style={hidden} />
      <Handle type="target" position={Position.Bottom} id="in-bottom" style={hidden} />
      <p className="line-clamp-2 text-[12px] leading-tight">{data.name}</p>
      <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
        <span className="font-mono">{data.clave}</span>
        <span className="truncate">
          {data.gatePct !== null && data.status !== 'approved' ? `${data.gatePct}% · ` : ''}
          {data.caption}
        </span>
      </div>
      <Handle type="source" position={Position.Right} id="out-right" style={hidden} />
      <Handle type="source" position={Position.Bottom} id="out-bottom" style={hidden} />
      <Handle type="source" position={Position.Top} id="out-top" style={hidden} />
    </div>
  )
})

const nodeTypes: NodeTypes = { subject: SubjectNode }

interface CurriculumGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selected: string | null
  onSelect: (clave: string | null) => void
}

export function CurriculumGraph({ nodes, edges, selected, onSelect }: CurriculumGraphProps) {
  const flowNodes = useMemo<SubjectNodeType[]>(() => toFlowNodes(nodes, selected), [nodes, selected])
  // Only computed for the first render: fitView runs once on mount.
  const [focus] = useState(() => focusNodeIds(nodes).map((id) => ({ id })))
  const flowEdges = useMemo<Edge[]>(
    () =>
      toFlowEdges(edges, nodes, selected).map(({ color, width, dashed, ...edge }) => ({
        ...edge,
        type: 'smoothstep',
        style: { stroke: color, strokeWidth: width, strokeDasharray: dashed ? '5 4' : undefined },
        markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color },
      })),
    [edges, nodes, selected],
  )

  return (
    <div className="h-[520px] overflow-hidden rounded-[22px] bg-[#f3eef4]/80 ring-1 ring-ink/5 sm:h-[600px] xl:h-auto xl:min-h-[600px] xl:flex-1">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelect(node.id)}
        onPaneClick={() => onSelect(null)}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnScroll
        fitView
        fitViewOptions={{ nodes: focus, padding: 0.12, maxZoom: 1 }}
        minZoom={0.25}
        maxZoom={1.6}
      >
        <Background gap={24} size={1} color="rgba(31,31,31,0.12)" />
        <Controls showInteractive={false} position="bottom-right" />
      </ReactFlow>
    </div>
  )
}

export function GraphLegend() {
  const items: { status: NodeStatus; label: string }[] = [
    { status: 'approved', label: 'Aprobada' },
    { status: 'in_progress', label: 'Cursando' },
    { status: 'available', label: 'Disponible' },
    { status: 'planned', label: 'Planeada' },
    { status: 'failed_sim', label: 'Reprobada (sim.)' },
    { status: 'unreachable', label: 'Bloqueada' },
  ]
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink/80">
      {items.map((item) => (
        <li key={item.status} className="flex items-center gap-1.5">
          <span className={cn('size-3.5 rounded-md border', STATUS_CLASSES[item.status])} aria-hidden />
          {item.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="h-1 w-5 rounded-full bg-accent-strong" aria-hidden />
        Ruta crítica
      </li>
      <li className="flex items-center gap-1.5">
        <span className="w-5 border-t-2 border-dashed border-ink/40" aria-hidden />
        Co-requisito
      </li>
    </ul>
  )
}
