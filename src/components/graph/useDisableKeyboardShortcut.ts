import { useEffect } from 'react'
import { useSceneStore } from '../../state/sceneStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

/** Pressing "d" toggles whether the selected lens/placeholder is temporarily disabled. */
export function useDisableKeyboardShortcut() {
  const selectedComponentId = useSceneStore((s) => s.selectedComponentId)
  const components = useSceneStore((s) => s.components)
  const toggleDisabled = useSceneStore((s) => s.toggleDisabled)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedComponentId || isTypingTarget(e.target)) return
      if (e.key !== 'd' && e.key !== 'D') return
      const component = components.find((c) => c.id === selectedComponentId)
      if (!component || component.kind === 'analyzer') return

      e.preventDefault()
      toggleDisabled(selectedComponentId)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedComponentId, components, toggleDisabled])
}
