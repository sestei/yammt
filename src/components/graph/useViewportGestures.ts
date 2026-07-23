import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useSceneStore } from '../../state/sceneStore'
import type { Scales } from './scales'

const ZOOM_SENSITIVITY = 0.0015
const MIN_SPAN_MM = 1e-3
const MAX_SPAN_MM = 1e12
const MIN_Y_ZOOM = 0.01
const MAX_Y_ZOOM = 100

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

interface DragOrigin {
  pointerId: number
  clientX: number
  xMinMm: number
  xMaxMm: number
}

export function useViewportGestures(
  containerRef: React.RefObject<HTMLElement | null>,
  scales: Scales,
  width: number,
) {
  const viewport = useSceneStore((s) => s.viewport)
  const setViewport = useSceneStore((s) => s.setViewport)
  const dragOrigin = useRef<DragOrigin | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el || width <= 0) return

    function handleWheel(e: WheelEvent) {
      e.preventDefault()
      const rect = el!.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const factor = Math.exp(e.deltaY * ZOOM_SENSITIVITY)

      if (e.ctrlKey) {
        setViewport({ yZoom: clamp(viewport.yZoom * factor, MIN_Y_ZOOM, MAX_Y_ZOOM) })
        return
      }

      const span = viewport.xMaxMm - viewport.xMinMm

      if (e.shiftKey) {
        const panDelta = (e.deltaX !== 0 ? e.deltaX : e.deltaY) * (span / width)
        setViewport({ xMinMm: viewport.xMinMm + panDelta, xMaxMm: viewport.xMaxMm + panDelta })
        return
      }

      const newSpan = clamp(span * factor, MIN_SPAN_MM, MAX_SPAN_MM)
      const anchorDataX = scales.svgToX(offsetX)
      const newXMin = anchorDataX - (offsetX / width) * newSpan
      setViewport({ xMinMm: newXMin, xMaxMm: newXMin + newSpan })
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [containerRef, scales, viewport, width, setViewport])

  function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragOrigin.current = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      xMinMm: viewport.xMinMm,
      xMaxMm: viewport.xMaxMm,
    }
    setIsDragging(true)
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const origin = dragOrigin.current
    if (!origin || origin.pointerId !== e.pointerId || width <= 0) return
    const span = origin.xMaxMm - origin.xMinMm
    const deltaMm = -(e.clientX - origin.clientX) * (span / width)
    setViewport({ xMinMm: origin.xMinMm + deltaMm, xMaxMm: origin.xMaxMm + deltaMm })
  }

  function onPointerUp(e: ReactPointerEvent<HTMLElement>) {
    if (dragOrigin.current?.pointerId === e.pointerId) {
      dragOrigin.current = null
      setIsDragging(false)
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp, isDragging }
}
