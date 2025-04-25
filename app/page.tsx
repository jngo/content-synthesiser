"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { History } from "lucide-react"
import FlowDiagram from "./components/FlowDiagram"
import type { Node, Edge } from 'reactflow'
import exampleData from '@/lib/example.json'
import { useSynthesisHistory } from "@/hooks/useSynthesisHistory"

interface DiagramData {
  nodes: Node[]
  edges: Edge[]
  zoom: number
  pan: { x: number; y: number }
  historyId?: string
}

export default function Home() {
  const [title, setTitle] = useState("")
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const { history, addToHistory, updateHistoryItem, reloadHistory } = useSynthesisHistory()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDiagramData(null)

    // Check if the input is "EXAMPLE"
    if (title.trim().toUpperCase() === "EXAMPLE") {
      const newHistoryId = crypto.randomUUID()
      setDiagramData({ ...exampleData, historyId: newHistoryId })
      addToHistory("Example", exampleData.nodes, exampleData.edges)
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.nodes || !data.edges) {
        throw new Error("Invalid diagram data received from the server")
      }

      const newHistoryId = crypto.randomUUID()
      setDiagramData({ ...data, historyId: newHistoryId })
      addToHistory(title, data.nodes, data.edges)
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistorySelect = (item: typeof history[0]) => {
    reloadHistory(); // Reload history from localStorage
    setTitle(item.title)
    setDiagramData({
      nodes: item.nodes,
      edges: item.edges,
      zoom: 1,
      pan: { x: 0, y: 0 },
      historyId: item.id
    })
  }

  return (
    <main className="h-screen w-screen overflow-hidden relative">
      {/* Floating form container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
          <h1 className="text-2xl font-bold mb-4">Content Synthesizer</h1>
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <Input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title of book, article, or publication"
                  className="w-full pr-8"
                  disabled={isLoading}
                />
                {history.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-96">
                      {history.map((item) => (
                        <DropdownMenuItem
                          key={item.id}
                          onClick={() => handleHistorySelect(item)}
                          className="flex flex-col items-start gap-1"
                        >
                          <span className="font-medium truncate w-full">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
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
            currentHistoryId={diagramData.historyId}
          />
        )}
      </div>
    </main>
  )
}

