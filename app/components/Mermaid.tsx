"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface MermaidProps {
  chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("Received chart:", chart) // Debug log

    mermaid.initialize({
      startOnLoad: false,
      theme: "default",
      securityLevel: "loose",
    })

    const renderDiagram = async () => {
      if (mermaidRef.current) {
        try {
          const { svg } = await mermaid.render(
            `mermaid-${Math.random().toString(36).substring(7)}`,
            chart
          )
          mermaidRef.current.innerHTML = svg
          
          // Get the SVG element and make it responsive
          const svgElement = mermaidRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.width = '100%'
            svgElement.style.height = '100%'
            svgElement.style.maxWidth = '100%'
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
          }
        } catch (error) {
          console.error("Mermaid rendering error:", error)
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<pre class="text-red-500">Failed to render diagram: ${error}</pre>`
          }
        }
      }
    }

    renderDiagram()
  }, [chart])

  return (
    <div className="flex justify-center w-full h-full min-h-[400px] p-4">
      <div ref={mermaidRef} className="w-full h-full" />
    </div>
  )
}

