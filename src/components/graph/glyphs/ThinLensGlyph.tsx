import type { MouseEvent } from 'react'
import type { ThinLens } from '../../../lib/scene/types'
import type { Scales } from '../scales'
import { useComponentDrag } from '../useComponentDrag'

// 1/mm; clamps the drawn curvature so very strong lenses don't balloon the glyph.
const MIN_CURVATURE = 0.002
const MAX_CURVATURE = 0.02

const HALF_WIDTH_PX = 8
const MIN_BOW_PX = 3
// Convex surfaces bulge outward (away from center) and can grow freely without risk
// of crossing. Concave surfaces bulge inward and must stay well short of HALF_WIDTH_PX
// or the two surfaces cross each other, producing a self-overlapping path.
const MAX_OUTWARD_BOW_PX = 26
const MAX_INWARD_BOW_PX = 9

const LABEL_OFFSET_PX = 10
// Drawn height is at least this fraction of the graph's vertical extent (so the
// lens stays visible zoomed out), and at least the beam's local 3-sigma diameter
// (so the lens always visually encompasses the beam) -- but never more than the
// lens's own defined diameter.
const MIN_HEIGHT_FRACTION = 1 / 3

interface ThinLensGlyphProps {
  component: ThinLens
  scales: Scales
  selected: boolean
  /** Local beam 3-sigma radius (mm) at the lens's position, used to size the glyph. */
  threeSigmaRadiusMm: number
  onSelect: () => void
}

export function ThinLensGlyph({ component, scales, selected, threeSigmaRadiusMm, onSelect }: ThinLensGlyphProps) {
  const x = scales.xToSvg(component.xMm)
  const axisY = scales.yToSvg(0)

  const trueHalfHeightPx = axisY - scales.yToSvg(component.diameterMm / 2)
  const minWindowHalfHeightPx = (scales.height * MIN_HEIGHT_FRACTION) / 2
  const beamHalfHeightPx = axisY - scales.yToSvg(threeSigmaRadiusMm)
  const desiredHalfHeightPx = Math.max(minWindowHalfHeightPx, beamHalfHeightPx)
  const halfHeightPx = Math.min(desiredHalfHeightPx, trueHalfHeightPx)
  const isClamped = halfHeightPx < trueHalfHeightPx - 0.5
  const apertureWarning = threeSigmaRadiusMm > component.diameterMm / 2

  const topY = axisY - halfHeightPx
  const bottomY = axisY + halfHeightPx

  const invF = Math.abs(1 / component.focalLengthMm)
  const clampedCurvature = Math.min(Math.max(invF, MIN_CURVATURE), MAX_CURVATURE)
  const normalized = (clampedCurvature - MIN_CURVATURE) / (MAX_CURVATURE - MIN_CURVATURE)

  const isConverging = component.focalLengthMm > 0
  const maxBow = isConverging ? MAX_OUTWARD_BOW_PX : MAX_INWARD_BOW_PX
  const bowMagnitude = MIN_BOW_PX + normalized * (maxBow - MIN_BOW_PX)
  const leftBow = isConverging ? -bowMagnitude : bowMagnitude
  const rightBow = isConverging ? bowMagnitude : -bowMagnitude

  const leftX = x - HALF_WIDTH_PX
  const rightX = x + HALF_WIDTH_PX

  const bodyD = [
    `M ${leftX},${topY}`,
    `Q ${leftX + leftBow},${axisY} ${leftX},${bottomY}`,
    `L ${rightX},${bottomY}`,
    `Q ${rightX + rightBow},${axisY} ${rightX},${topY}`,
    'Z',
  ].join(' ')
  const leftSurfaceD = `M ${leftX},${topY} Q ${leftX + leftBow},${axisY} ${leftX},${bottomY}`
  const rightSurfaceD = `M ${rightX},${bottomY} Q ${rightX + rightBow},${axisY} ${rightX},${topY}`

  const { onPointerDown, onPointerMove, onPointerUp } = useComponentDrag(component, scales)

  function handleClick(e: MouseEvent<SVGGElement>) {
    e.stopPropagation()
    onSelect()
  }

  const className = [
    'component',
    'thin-lens',
    component.locked && 'locked',
    selected && 'selected',
    apertureWarning && 'aperture-warning',
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
      {apertureWarning && <title>Beam 3-sigma diameter exceeds the lens aperture</title>}
      <path className="lens-body" d={bodyD} />
      <path className="lens-surface" d={leftSurfaceD} />
      <path className="lens-surface" d={rightSurfaceD} />
      {/* Dashed caps indicate the drawn height is clamped and doesn't represent
          the full physical diameter; solid once the true diameter fits. */}
      <line className={`lens-cap${isClamped ? ' clamped' : ''}`} x1={leftX} y1={topY} x2={rightX} y2={topY} />
      <line
        className={`lens-cap${isClamped ? ' clamped' : ''}`}
        x1={leftX}
        y1={bottomY}
        x2={rightX}
        y2={bottomY}
      />
      <text className="component-label" x={x} y={topY - LABEL_OFFSET_PX}>
        {component.label}
      </text>
    </g>
  )
}
