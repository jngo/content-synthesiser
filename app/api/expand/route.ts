import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { Node, Edge } from 'reactflow'
import { generateObject } from 'ai'
import { synthesisSchema } from '@/lib/synthesis'

export async function POST(req: Request) {
  try {
    const { nodeLabel, currentNodes, currentEdges }: { 
      nodeLabel: string, 
      currentNodes: Node[], 
      currentEdges: Edge[] 
    } = await req.json()

    if (!nodeLabel) {
      return NextResponse.json({ error: "Node label is required" }, { status: 400 })
    }

    const systemPrompt = `Given a node from a concept map and its context, expand on the node by going one level deeper.
Return only the additional nodes and their connections to the parent node.
Ensure that all node IDs remain unique within the scope of the entire diagram.
Format the response as a React Flow diagram with nodes and edges.`

    const prompt = `Further expand on this node: ${nodeLabel}

Go one level deeper.
Return only the additional nodes.
Ensure that all ids remain unique within the scope of the entire diagram.
Make sure the additional nodes are connected to the parent node.

Current diagram context:
${JSON.stringify({ nodes: currentNodes, edges: currentEdges }, null, 2)}`

    const response = await generateObject({
      model: openai("o3"),
      system: systemPrompt,
      prompt: prompt,
      schema: synthesisSchema
    })

    if (!response) {
      throw new Error("No content generated from OpenAI")
    }

    return NextResponse.json(response.object)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    )
  }
} 