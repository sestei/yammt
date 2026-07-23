import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { getLeftXMm } from '../../lib/scene/positions'
import type { SceneComponent } from '../../lib/scene/types'
import { useSceneStore } from '../../state/sceneStore'
import type { Scales } from './scales'

interface DragOrigin {
  pointerId: number
  clientX: number
  startLeftXMm: number
}

/** Drag-to-reposition for a component glyph; respects locked state and group sync (via moveComponent). */
export function useComponentDrag(component: SceneComponent, scales: Scales) {
  const moveComponent = useSceneStore((s) => s.moveComponent)
  const origin = useRef<DragOrigin | null>(null)
  const mmPerPx = scales.svgToX(1) - scales.svgToX(0)

  function onPointerDown(e: ReactPointerEvent<SVGGElement>) {
    e.stopPropagation()
    if (component.locked) return
    e.currentTarget.setPointerCapture(e.pointerId)
    origin.current = {
      pointerId: e.pointerId,
      clientX: e.clientX,
      startLeftXMm: getLeftXMm(component),
    }
  }

  function onPointerMove(e: ReactPointerEvent<SVGGElement>) {
    const o = origin.current
    if (!o || o.pointerId !== e.pointerId) return
    const deltaMm = (e.clientX - o.clientX) * mmPerPx
    moveComponent(component.id, o.startLeftXMm + deltaMm)
  }

  function onPointerUp(e: ReactPointerEvent<SVGGElement>) {
    if (origin.current?.pointerId === e.pointerId) {
      origin.current = null
    }
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}
