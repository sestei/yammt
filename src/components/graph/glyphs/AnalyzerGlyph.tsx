import type { MouseEvent } from 'react'
import { autoYUnit, mmToDisplayY } from '../../../lib/units/length'
import type { BeamAnalyzer } from '../../../lib/scene/types'
import type { Scales } from '../scales'
import { useComponentDrag } from '../useComponentDrag'

// The analyzer has no physical aperture; its marker spans a fixed fraction of
// the graph height, centered on the optical axis, purely for visibility/click target.
const MARKER_HEIGHT_FRACTION = 0.8
const ICON_RADIUS_PX = 5
const LABEL_OFFSET_PX = 10
const RADIUS_LABEL_OFFSET_PX = 14

interface AnalyzerGlyphProps {
  component: BeamAnalyzer
  scales: Scales
  selected: boolean
  /** Local beam 1/e^2 intensity radius (mm) at the analyzer's position. */
  radiusMm: number
  onSelect: () => void
}

export function AnalyzerGlyph({ component, scales, selected, radiusMm, onSelect }: AnalyzerGlyphProps) {
  const x = scales.xToSvg(component.xMm)
  const axisY = scales.yToSvg(0)
  const halfHeightPx = (scales.height * MARKER_HEIGHT_FRACTION) / 2
  const topY = axisY - halfHeightPx
  const bottomY = axisY + halfHeightPx

  const radiusUnit = autoYUnit(radiusMm)
  const radiusLabel = `${mmToDisplayY(radiusMm, radiusUnit).toFixed(radiusUnit === 'um' ? 1 : 3)} ${radiusUnit}`

  const { onPointerDown, onPointerMove, onPointerUp } = useComponentDrag(component, scales)

  function handleClick(e: MouseEvent<SVGGElement>) {
    e.stopPropagation()
    onSelect()
  }

  const className = ['component', 'analyzer', component.locked && 'locked', selected && 'selected']
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
      <line className="analyzer-marker" x1={x} y1={topY} x2={x} y2={bottomY} />
      <circle className="analyzer-icon" cx={x} cy={axisY} r={ICON_RADIUS_PX} />
      <text className="component-label" x={x} y={topY - LABEL_OFFSET_PX}>
        {component.label}
      </text>
      <text className="analyzer-radius-label" x={x} y={bottomY + RADIUS_LABEL_OFFSET_PX}>
        {radiusLabel}
      </text>
    </g>
  )
}
