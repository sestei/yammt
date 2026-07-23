import type { DragEvent } from 'react'

export const PALETTE_DRAG_TYPE = 'application/x-yammt-component'

export function ComponentPalette() {
  function onDragStart(e: DragEvent<HTMLDivElement>, kind: string) {
    e.dataTransfer.setData(PALETTE_DRAG_TYPE, kind)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <section className="panel component-palette">
      <h2>Components</h2>
      <div className="palette-item" draggable onDragStart={(e) => onDragStart(e, 'thin-lens')}>
        Thin Lens
      </div>
      <div className="palette-item" draggable onDragStart={(e) => onDragStart(e, 'thick-lens')}>
        Thick Lens
      </div>
      <div className="palette-item" draggable onDragStart={(e) => onDragStart(e, 'analyzer')}>
        Beam Analyzer
      </div>
      <div className="palette-item" draggable onDragStart={(e) => onDragStart(e, 'placeholder')}>
        Placeholder
      </div>
    </section>
  )
}
