import { useEffect } from 'react'
import type { GroupId } from '../../lib/scene/types'
import { useSceneStore } from '../../state/sceneStore'

const DIGIT_KEYS = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'])

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
}

/** Pressing 0-9 assigns the selected component to that group (0 = ungrouped). */
export function useGroupKeyboardShortcut() {
  const selectedComponentId = useSceneStore((s) => s.selectedComponentId)
  const setGroup = useSceneStore((s) => s.setGroup)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selectedComponentId || !DIGIT_KEYS.has(e.key) || isTypingTarget(e.target)) return
      setGroup(selectedComponentId, Number(e.key) as GroupId)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedComponentId, setGroup])
}
