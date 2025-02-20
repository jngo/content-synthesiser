"use client"

import { useEffect, useRef } from "react"
import mermaid from "mermaid"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"

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
            svgElement.style.maxWidth = 'none'
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
    <TransformWrapper
      initialScale={1}
      minScale={0.5}
      maxScale={2}
      centerOnInit={true}
      smooth={true}
      limitToBounds={false}
      centerZoomedOut={false}
      wheel={{
        step: 0.05,
        smoothStep: 0.001,
        disabled: false,
        wheelDisabled: false,
        touchPadDisabled: false,
        activationKeys: [],
        excluded: [],
      }}
      pinch={{
        disabled: false
      }}
    >
      <TransformComponent
        wrapperStyle={{ width: "100%", height: "100%" }}
        contentStyle={{ width: "100%", height: "100%" }}
      >
        <div ref={mermaidRef} className="w-full h-full" />
      </TransformComponent>
    </TransformWrapper>
  )
}

