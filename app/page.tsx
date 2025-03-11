"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FlowDiagram from "./components/FlowDiagram"
import type { Node, Edge } from 'reactflow'
import exampleData from '@/lib/example.json'

interface DiagramData {
  nodes: Node[]
  edges: Edge[]
  zoom: number
  pan: { x: number; y: number }
}

export default function Home() {
  const [title, setTitle] = useState("")
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDiagramData(null)

    // Check if the input is "EXAMPLE"
    if (title.trim().toUpperCase() === "EXAMPLE") {
      setDiagramData(exampleData)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.nodes || !data.edges) {
        throw new Error("Invalid diagram data received from the server")
      }

      setDiagramData(data)
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Floating form container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
          <h1 className="text-2xl font-bold mb-4">Content Synthesizer</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title of book, article, or publication"
                className="flex-grow"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Synthesizing..." : "Synthesize"}
              </Button>
            </div>
          </form>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>

      {/* Diagram container */}
      <div className="absolute inset-0">
        {diagramData && (
          <FlowDiagram
            nodes={diagramData.nodes}
            edges={diagramData.edges}
            zoom={diagramData.zoom}
            pan={diagramData.pan}
          />
        )}
      </div>
    </main>
  )
}

