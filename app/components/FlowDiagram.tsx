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
import dagre from 'dagre'
import 'reactflow/dist/style.css'

interface FlowDiagramProps {
  nodes: Node[]
  edges: Edge[]
  zoom?: number
  pan?: { x: number; y: number }
  direction?: 'TB' | 'LR'
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  const nodeWidth = 200
  const nodeHeight = 100

  // Configure the direction of the layout
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 })

  // Add nodes to the dagre graph
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  })

  // Add edges to the dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // Apply the layout
  dagre.layout(dagreGraph)

  // Get the positioned nodes
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    }
  })

  return { nodes: layoutedNodes, edges }
}

export default function FlowDiagram({ 
  nodes: initialNodes, 
  edges: initialEdges, 
  zoom = 1, 
  pan = { x: 0, y: 0 },
  direction = 'TB'
}: FlowDiagramProps) {
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
    direction
  )
  
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)

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