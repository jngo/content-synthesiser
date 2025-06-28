"use client"

import { useCallback, useState, useEffect } from 'react'
import { track } from '@vercel/analytics'
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
import IdeaNode from './IdeaNode';
import SynthesisNode from './SynthesisNode';
import { useSynthesisHistory } from '@/hooks/useSynthesisHistory';

const nodeTypes = {
  idea: IdeaNode,
  synthesis: SynthesisNode,
}

interface FlowDiagramProps {
  nodes: Node[]
  edges: Edge[]
  zoom?: number
  pan?: { x: number; y: number }
  direction?: 'TB' | 'LR'
  currentHistoryId?: string
}

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: 'TB' | 'LR' = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  // Configure the direction of the layout
  dagreGraph.setGraph({ rankdir: direction, nodesep: 48, ranksep: 80 })

  // Add nodes to the dagre graph
  nodes.forEach((node) => {
    // Check if this node is a target in any edge
    const hasParents = edges.some(edge => edge.target === node.id)

    if (hasParents) {
      dagreGraph.setNode(node.id, { width: 224, height: 72 })
    } else {
      dagreGraph.setNode(node.id, { width: 320, height: 72 })
    }
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
    // Check if this node is a target in any edge
    const hasParents = edges.some(edge => edge.target === node.id)
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      type: hasParents ? 'idea' : 'synthesis',
    }
  })

  return { nodes: layoutedNodes, edges }
}

export default function FlowDiagram({ 
  nodes: initialNodes, 
  edges: initialEdges, 
  zoom = 1, 
  pan = { x: 0, y: 0 },
  direction = 'TB',
  currentHistoryId
}: FlowDiagramProps) {
  const { updateHistoryItem } = useSynthesisHistory();
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    initialNodes,
    initialEdges,
    direction
  )
  
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges)
  const [expandingNodeId, setExpandingNodeId] = useState<string | null>(null)

  // Add useEffect to update nodes and edges when props change
  useEffect(() => {
    const { nodes: newLayoutedNodes, edges: newLayoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges,
      direction
    )
    setNodes(newLayoutedNodes)
    setEdges(newLayoutedEdges)
  }, [initialNodes, initialEdges, direction, setNodes, setEdges])

  const onInit = useCallback((reactFlowInstance: ReactFlowInstance) => {
    if (zoom !== 1 || pan.x !== 0 || pan.y !== 0) {
      reactFlowInstance.setViewport({ x: pan.x, y: pan.y, zoom })
    }
  }, [zoom, pan])

  const handleExpandNode = useCallback(async (nodeId: string) => {
    setExpandingNodeId(nodeId)
    const nodeToExpand = nodes.find(n => n.id === nodeId)
    if (!nodeToExpand) return

    try {
      const response = await fetch('/api/expand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodeLabel: nodeToExpand.data.label,
          currentNodes: nodes,
          currentEdges: edges,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { nodes: newNodes, edges: newEdges } = await response.json()
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        [...nodes, ...newNodes],
        [...edges, ...newEdges],
        direction
      )

      setNodes(layoutedNodes)
      setEdges(layoutedEdges)
      track('node_expand', { title: nodeToExpand.data.label })

      // Update history if we have a current history ID
      if (currentHistoryId) {
        updateHistoryItem(currentHistoryId, layoutedNodes, layoutedEdges)
      }
    } catch (error) {
      console.error('Error expanding node:', error)
      track('node_expand_error', {
        message: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setExpandingNodeId(null)
    }
  }, [nodes, edges, direction, currentHistoryId, updateHistoryItem, setEdges, setNodes])

  // Update nodes to include onExpand handler and loading state
  const nodesWithHandlers = nodes.map(node => ({
    ...node,
    data: {
      ...node.data,
      onExpand: handleExpandNode,
      isExpanding: node.id === expandingNodeId,
    },
  }))

  return (
    <ReactFlowProvider>
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodesWithHandlers}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={onInit}
          fitView
          attributionPosition="bottom-left"
          nodeTypes={nodeTypes}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  )
} 