import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { isXRangeFreeOfLenses } from '../../lib/scene/placeholderCollision'
import type { Placeholder } from '../../lib/scene/types'
import { useSceneStore } from '../../state/sceneStore'
import type { Scales } from './scales'

interface EdgeDragOrigin {
  pointerId: number
  clientX: number
  startValueMm: number
}

const MIN_WIDTH_MM = 0.5

/** Drag-to-resize for one edge of a placeholder (start or end boundary). */
export function useEdgeResizeDrag(component: Placeholder, edge: 'start' | 'end', scales: Scales) {
  const updateComponent = useSceneStore((s) => s.updateComponent)
  const components = useSceneStore((s) => s.components)
  const origin = useRef<EdgeDragOrigin | null>(null)
  const mmPerPx = scales.svgToX(1) - scales.svgToX(0)

  function onPointerDown(e: ReactPointerEvent<SVGElement>) {
    e.stopPropagation()
    if (component.locked) return
    e.currentTarget.setPointerCapture(e.pointerId)
    origin.current = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      startValueMm: edge === 'start' ? component.xStartMm : component.xEndMm,
    }
  }

  function onPointerMove(e: ReactPointerEvent<SVGElement>) {
    const o = origin.current
    if (!o || o.pointerId !== e.pointerId) return
    const deltaMm = (e.clientX - o.clientX) * mmPerPx
    let newValue = o.startValueMm + deltaMm

    if (edge === 'start') {
      newValue = Math.min(newValue, component.xEndMm - MIN_WIDTH_MM)
    } else {
      newValue = Math.max(newValue, component.xStartMm + MIN_WIDTH_MM)
    }

    const newStart = edge === 'start' ? newValue : component.xStartMm
    const newEnd = edge === 'end' ? newValue : component.xEndMm
    const others = components.filter((c) => c.id !== component.id)
    if (!isXRangeFreeOfLenses(others, newStart, newEnd, component.id)) return

    updateComponent(component.id, edge === 'start' ? { xStartMm: newValue } : { xEndMm: newValue })
  }

  function onPointerUp(e: ReactPointerEvent<SVGElement>) {
    if (origin.current?.pointerId === e.pointerId) {
      origin.current = null
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}
