import { NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
- Present your key insight as a Minto Pyramid structured flowchart, with synthesis at the top, key line in the middle, and ideas at the bottom. Format the diagram using Mermaid syntax.
- Only output the raw Mermaid diagram syntax without the Markdown code block, nothing else.`

    const completion = await openai.chat.completions.create({
      model: "o1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: title },
      ],
    })

    let mermaidCode = completion.choices[0].message.content

    if (mermaidCode) {
      const match = mermaidCode.match(/```mermaid\n([\s\S]*?)\n```/)
      if (match) {
        mermaidCode = match[1]
      }
    }

    if (!mermaidCode) {
      throw new Error("No content generated from OpenAI")
    }

    return NextResponse.json({ mermaidCode })
  } catch (error) {
    console.error("Detailed error:", error)

    let errorMessage = "An error occurred while synthesizing the content."
    if (error instanceof Error) {
      errorMessage += ` Details: ${error.message}`
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

