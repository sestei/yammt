import { useEffect } from 'react'
import { useSceneStore } from '../../state/sceneStore'

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

/** Pressing Delete/Backspace removes the currently selected component. */
export function useDeleteKeyboardShortcut() {
  const selectedComponentId = useSceneStore((s) => s.selectedComponentId)
  const removeComponent = useSceneStore((s) => s.removeComponent)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedComponentId || isTypingTarget(e.target)) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removeComponent(selectedComponentId)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedComponentId, removeComponent])
}
