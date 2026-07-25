import { useEffect } from 'react'
import { flippedThickLensRoc } from '../../lib/optics/thickLensGeometry'
import { useSceneStore } from '../../state/sceneStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

/** Pressing "f" turns the selected thick lens end-for-end (swaps and negates its ROCs). */
export function useFlipKeyboardShortcut() {
  const selectedComponentId = useSceneStore((s) => s.selectedComponentId)
  const components = useSceneStore((s) => s.components)
  const updateComponent = useSceneStore((s) => s.updateComponent)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedComponentId || isTypingTarget(e.target)) return
      if (e.key !== 'f' && e.key !== 'F') return
      const component = components.find((c) => c.id === selectedComponentId)
      if (!component || component.kind !== 'thick-lens') return

      e.preventDefault()
      updateComponent(selectedComponentId, flippedThickLensRoc(component))
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedComponentId, components, updateComponent])
}
