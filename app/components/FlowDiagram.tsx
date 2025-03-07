"use client"

import { useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  ReactFlowInstance
} from 'reactflow'
import 'reactflow/dist/style.css'

interface FlowDiagramProps {
  nodes: Node[]
  edges: Edge[]
  zoom?: number
  pan?: { x: number; y: number }
}

export default function FlowDiagram({ nodes: initialNodes, edges: initialEdges, zoom = 1, pan = { x: 0, y: 0 } }: FlowDiagramProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    if (zoom !== 1 || pan.x !== 0 || pan.y !== 0) {
      reactFlowInstance.setViewport({ x: pan.x, y: pan.y, zoom })
    }
  }, [zoom, pan])

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          fitView
          attributionPosition="bottom-left"
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
} 