import type { MouseEvent } from 'react'
import type { Placeholder } from '../../../lib/scene/types'
import type { Scales } from '../scales'
import { useComponentDrag } from '../useComponentDrag'
import { useEdgeResizeDrag } from '../useEdgeResizeDrag'

const HANDLE_WIDTH_PX = 8
const LABEL_OFFSET_PX = 10

interface PlaceholderGlyphProps {
  component: Placeholder
  scales: Scales
  selected: boolean
  onSelect: () => void
}

export function PlaceholderGlyph({ component, scales, selected, onSelect }: PlaceholderGlyphProps) {
  const leftX = scales.xToSvg(component.xStartMm)
  const rightX = scales.xToSvg(component.xEndMm)
  const centerX = (leftX + rightX) / 2

  const { onPointerDown, onPointerMove, onPointerUp } = useComponentDrag(component, scales)
  const leftHandle = useEdgeResizeDrag(component, 'start', scales)
  const rightHandle = useEdgeResizeDrag(component, 'end', scales)

  function handleClick(e: MouseEvent<SVGGElement>) {
    e.stopPropagation()
    onSelect()
  }

  const className = [
    'component',
    'placeholder',
    component.locked && 'locked',
    component.disabled && 'disabled',
    selected && 'selected',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <g
      className={className}
      data-component-id={component.id}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={handleClick}
    >
      <rect
        className="placeholder-fill"
        x={leftX}
        y={0}
        width={Math.max(rightX - leftX, 0)}
        height={scales.height}
      />
      <line className="placeholder-edge" x1={leftX} y1={0} x2={leftX} y2={scales.height} />
      <line className="placeholder-edge" x1={rightX} y1={0} x2={rightX} y2={scales.height} />
      <rect
        className="placeholder-handle"
        x={leftX - HANDLE_WIDTH_PX / 2}
        y={0}
        width={HANDLE_WIDTH_PX}
        height={scales.height}
        onPointerDown={leftHandle.onPointerDown}
        onPointerMove={leftHandle.onPointerMove}
        onPointerUp={leftHandle.onPointerUp}
        onPointerCancel={leftHandle.onPointerUp}
      />
      <rect
        className="placeholder-handle"
        x={rightX - HANDLE_WIDTH_PX / 2}
        y={0}
        width={HANDLE_WIDTH_PX}
        height={scales.height}
        onPointerDown={rightHandle.onPointerDown}
        onPointerMove={rightHandle.onPointerMove}
        onPointerUp={rightHandle.onPointerUp}
        onPointerCancel={rightHandle.onPointerUp}
      />
      <text className="component-label" x={centerX} y={LABEL_OFFSET_PX + 4}>
        {component.label}
      </text>
    </g>
  )
}
