import { NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { synthesisSchema } from "@/lib/synthesis"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const title = formData.get('title') as string
    const file = formData.get('file') as File | null

    if (!title && !file) {
      return NextResponse.json({ error: "Either title or file is required" }, { status: 400 })
    }

    const systemPrompt = `Given the title of a book, publication, article, or other content, synthesise the key insight by taking the following steps:

- Identify the important ideas. Ensure each idea is MECE (mutually exclusive and comprehensively exhaustive).
- Group the same kinds of ideas into logical categories. Ensure each idea is ordered logically either deductively, chronologically, structurally, or comparatively.
- For each grouping, summarise the ideas into a single sentence. This is the label for each group. These labels form the key line.
- Synthesise these labels into a single sentence that provides a new perspective based on insights and implications of these ideas.
- Present your key insight as a Minto Pyramid structured flowchart, with synthesis at the top, key line in the middle, and ideas at the bottom. Format as a React Flow diagram with nodes and edges.`

    let response
    if (file) {
      const fileBuffer = await file.arrayBuffer()
      response = await generateObject({
        model: openai("o3"),
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this document and create a synthesis diagram:",
              },
              {
                type: "file",
                data: Buffer.from(fileBuffer),
                mimeType: "application/pdf",
                filename: file.name,
              },
            ],
          },
        ],
        schema: synthesisSchema,
      })
    } else {
      response = await generateObject({
        model: openai("o3"),
        system: systemPrompt,
        prompt: title,
        schema: synthesisSchema,
      })
    }

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