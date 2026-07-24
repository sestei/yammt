import { useEffect } from 'react'
import { getLeftXMm } from '../../lib/scene/positions'
import { useSceneStore } from '../../state/sceneStore'

const DEFAULT_STEP_MM = 1
const FINE_STEP_MM = 0.1

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

/** Left/Right arrow keys nudge the selected component along the x-axis (Shift for a finer 0.1mm step). */
export function useNudgeKeyboardShortcut() {
  const selectedComponentId = useSceneStore((s) => s.selectedComponentId)
  const components = useSceneStore((s) => s.components)
  const moveComponent = useSceneStore((s) => s.moveComponent)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedComponentId || isTypingTarget(e.target)) return
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const component = components.find((c) => c.id === selectedComponentId)
      if (!component) return

      e.preventDefault()
      const step = e.shiftKey ? FINE_STEP_MM : DEFAULT_STEP_MM
      const deltaMm = e.key === 'ArrowLeft' ? -step : step
      moveComponent(selectedComponentId, getLeftXMm(component) + deltaMm)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedComponentId, components, moveComponent])
}
