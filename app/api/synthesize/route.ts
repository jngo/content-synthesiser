import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod";

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
      reasoningSteps: z
        .array(z.string())
        .describe("The reasoning steps taken by the model to generate the synthesis."),
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
            })
            .strict()
        )
        .describe("Array of nodes in the tree diagram."),
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
    })
    .strict();

    const response = await generateObject({
      model: openai("o3"),
      system: systemPrompt,
      prompt: title,
      schema: schema
    })

    if (!response) {
      throw new Error("No content generated from OpenAI")
    }

    return NextResponse.json(response.object)
  } catch (error) {
    console.error("Detailed error:", error)

    let errorMessage = "An error occurred while synthesizing the content."
    if (error instanceof Error) {
      errorMessage += ` Details: ${error.message}`
    }

    // Return appropriate status code based on error type
    const status = error instanceof Error && error.message.includes("timeout") ? 504 : 500

    return NextResponse.json({ error: errorMessage }, { status })
  }
}