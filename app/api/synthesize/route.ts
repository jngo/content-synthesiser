import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText, Output } from "ai"
import { z } from "zod";

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { title } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const systemPrompt = `Given the title of a book, publication, article, or other content, synthesise the key insight by taking the following steps:

- Identify the important ideas. Ensure each idea is MECE (mutually exclusive and comprehensively exhaustive).
- Group the same kinds of ideas into logical categories. Ensure each idea is ordered logically either deductively, chronologically, structurally, or comparatively.
- For each grouping, summarise the ideas into a single sentence. This is the label for each group. These labels form the key line.
- Synthesise these labels into a single sentence that provides a new perspective based on insights and implications of these ideas.
- Present your key insight as a Minto Pyramid structured flowchart, with synthesis at the top, key line in the middle, and ideas at the bottom. Format as a React Flow diagram with nodes and edges.`

    const schema = z
    .object({
      pan: z
        .object({
          x: z.number().describe("Current pan offset on the x-axis."),
          y: z.number().describe("Current pan offset on the y-axis."),
        })
        .strict(),
      zoom: z.number().describe("Current zoom level of the tree diagram."),
      edges: z
        .array(
          z
            .object({
              id: z.string().describe("Unique identifier for the edge."),
              source: z.string().describe("The ID of the source node."),
              target: z.string().describe("The ID of the target node."),
            })
            .strict()
        )
        .describe("Array of edges connecting the nodes in the diagram."),
      nodes: z
        .array(
          z
            .object({
              id: z.string().describe("Unique identifier for the node."),
              data: z
                .object({
                  label: z.string().describe("Label of the node."),
                })
                .strict(),
              position: z
                .object({
                  x: z.number().describe("X coordinate of the node."),
                  y: z.number().describe("Y coordinate of the node."),
                })
                .strict(),
            })
            .strict()
        )
        .describe("Array of nodes in the tree diagram."),
    })
    .strict();

    const { text: diagramData } = await generateText({
      model: openai("o1"),
      system: systemPrompt,
      prompt: title,
      experimental_output: Output.object({
        schema: schema
      })
    })

    if (!diagramData) {
      throw new Error("No content generated from OpenAI")
    }

    return NextResponse.json(JSON.parse(diagramData))
  } catch (error) {
    console.error("Detailed error:", error)

    let errorMessage = "An error occurred while synthesizing the content."
    if (error instanceof Error) {
      errorMessage += ` Details: ${error.message}`
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

