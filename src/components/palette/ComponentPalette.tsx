import type { DragEvent } from 'react'
import { Panel } from '../layout/Panel'
import { buildComponentAt, type PaletteComponentKind } from '../../lib/scene/placement'
import { getRightXMm } from '../../lib/scene/positions'
import { useSceneStore } from '../../state/sceneStore'

export const PALETTE_DRAG_TYPE = 'application/x-yammt-component'

const GAP_MM = 10
const VIEW_MARGIN_FRACTION = 0.1

const PALETTE_ITEMS: { kind: PaletteComponentKind; label: string }[] = [
  { kind: 'thin-lens', label: 'Thin Lens' },
  { kind: 'thick-lens', label: 'Thick Lens' },
  { kind: 'analyzer', label: 'Beam Analyzer' },
  { kind: 'placeholder', label: 'Placeholder' },
]

export function ComponentPalette() {
  const components = useSceneStore((s) => s.components)
  const viewport = useSceneStore((s) => s.viewport)
  const addComponent = useSceneStore((s) => s.addComponent)
  const select = useSceneStore((s) => s.select)
  const setViewport = useSceneStore((s) => s.setViewport)

  function onDragStart(e: DragEvent<HTMLDivElement>, kind: PaletteComponentKind) {
    e.dataTransfer.setData(PALETTE_DRAG_TYPE, kind)
    e.dataTransfer.effectAllowed = 'copy'
  }

  function onClick(kind: PaletteComponentKind) {
    const rightmostMm = components.length > 0 ? Math.max(...components.map(getRightXMm)) : undefined
    const xMm = rightmostMm !== undefined ? rightmostMm + GAP_MM : 0

    const component = buildComponentAt(kind, xMm, components)
    if (!component) return

    addComponent(component)
    select(component.id)

    const span = viewport.xMaxMm - viewport.xMinMm
    const margin = span * VIEW_MARGIN_FRACTION
    if (xMm > viewport.xMaxMm - margin || xMm < viewport.xMinMm + margin) {
      const xMinMm = xMm - span + margin
      setViewport({ xMinMm, xMaxMm: xMinMm + span })
    }
  }

  return (
    <Panel title="Components" className="component-palette-panel">
      {PALETTE_ITEMS.map(({ kind, label }) => (
        <div
          key={kind}
          className="palette-item"
          draggable
          onDragStart={(e) => onDragStart(e, kind)}
          onClick={() => onClick(kind)}
        >
          {label}
        </div>
      ))}
    </Panel>
  )
}
