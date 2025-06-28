"use client"

import type React from "react"
import { useState, useRef } from "react"
import { track } from "@vercel/analytics"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { History, Upload } from "lucide-react"
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [diagramData, setDiagramData] = useState<DiagramData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { history, addToHistory, reloadHistory } = useSynthesisHistory()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (file.type !== 'application/pdf') {
      setError("Please select a PDF file")
      return
    }

    // Check file size (32 MB = 32 * 1024 * 1024 bytes)
    const maxSize = 32 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size must be less than 32 MB")
      return
    }

    setSelectedFile(file)
    setTitle(file.name)
    setError("")
    track('file_selected', { name: file.name, size: file.size })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    track('synthesis_new_text', { query: title })
    setIsLoading(true)
    setError("")
    setDiagramData(null)

    // Check if the input is "EXAMPLE"
    if (title.trim().toUpperCase() === "EXAMPLE") {
      const newHistoryId = crypto.randomUUID()
      setDiagramData({ ...exampleData, historyId: newHistoryId })
      addToHistory("Example", exampleData.nodes, exampleData.edges)
      track('synthesize_example')
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      if (selectedFile) {
        formData.append('file', selectedFile)
      } else {
        formData.append('title', title)
      }

      const response = await fetch("/api/synthesize", {
        method: "POST",
        body: formData,
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
      track('synthesize_success')
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      track('synthesize_error', { message: error instanceof Error ? error.message : String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistorySelect = (item: typeof history[0]) => {
    reloadHistory(); // Reload history from localStorage
    track('history_select', { title: item.title })
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
                {selectedFile ? (
                  <div className="flex items-center gap-2 p-2 border rounded-md">
                    <span className="truncate">{selectedFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null)
                        setTitle("")
                      }}
                    >
                      ×
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      ref={inputRef}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title of book, article, or publication"
                      className="w-full pr-8"
                      disabled={isLoading}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {history.length > 0 && !selectedFile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="absolute right-10 top-1/2 -translate-y-1/2 h-6 w-6"
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

