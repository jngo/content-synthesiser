"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Mermaid from "./components/Mermaid"

export default function Home() {
  const [title, setTitle] = useState("")
  const [mermaidCode, setMermaidCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMermaidCode("")

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

      if (!data.mermaidCode) {
        throw new Error("No Mermaid code received from the server")
      }

      setMermaidCode(data.mermaidCode)
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
        {mermaidCode && <Mermaid chart={mermaidCode} />}
      </div>
    </main>
  )
}

