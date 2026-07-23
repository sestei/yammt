import type { MouseEvent } from 'react'
import { checkThickLensGeometry, surfaceSagMm } from '../../../lib/optics/thickLensGeometry'
import type { ThickLens } from '../../../lib/scene/types'
import type { Scales } from '../scales'
import { useComponentDrag } from '../useComponentDrag'

// Ensures the lens stays visible/selectable even when its physical thickness
// maps to a near-zero pixel width at low zoom (spec: "minimum extent if zoom
// is too small"). Curvature itself is drawn true-to-scale, not exaggerated.
const MIN_VERTEX_GAP_PX = 8

const LABEL_OFFSET_PX = 10
const MIN_HEIGHT_FRACTION = 1 / 3

interface ThickLensGlyphProps {
  component: ThickLens
  scales: Scales
  selected: boolean
  threeSigmaRadiusMm: number
  onSelect: () => void
}

/**
 * Cubic Bezier control-point x shared by both control points, chosen so the
 * curve's t=0.5 point lands exactly on vertexX -- the center-thickness reference
 * belongs at the axis (y=0), not at the aperture edges:
 * B(0.5).x = (edgeX + 3*cx)/4 = vertexX  =>  cx = (4*vertexX - edgeX)/3.
 */
function surfaceControlX(edgeX: number, vertexX: number): number {
  return (4 * vertexX - edgeX) / 3
}

/** Curve command only (no leading M), from (edgeX,fromY) to (edgeX,toY), passing through the vertex at the midpoint. */
function surfaceCurveCommand(edgeX: number, vertexX: number, fromY: number, toY: number): string {
  const heightPx = toY - fromY
  const cx = surfaceControlX(edgeX, vertexX)
  return `C ${cx},${fromY + heightPx / 3} ${cx},${toY - heightPx / 3} ${edgeX},${toY}`
}

export function ThickLensGlyph({ component, scales, selected, threeSigmaRadiusMm, onSelect }: ThickLensGlyphProps) {
  const axisY = scales.yToSvg(0)
  const pxPerMm = scales.xToSvg(1) - scales.xToSvg(0)

  const trueHalfHeightPx = axisY - scales.yToSvg(component.diameterMm / 2)
  const minWindowHalfHeightPx = (scales.height * MIN_HEIGHT_FRACTION) / 2
  const beamHalfHeightPx = axisY - scales.yToSvg(threeSigmaRadiusMm)
  const desiredHalfHeightPx = Math.max(minWindowHalfHeightPx, beamHalfHeightPx)
  const halfHeightPx = Math.min(desiredHalfHeightPx, trueHalfHeightPx)
  const isHeightClamped = halfHeightPx < trueHalfHeightPx - 0.5
  const apertureWarning = threeSigmaRadiusMm > component.diameterMm / 2
  const geometryIssue = checkThickLensGeometry(component)

  const topY = axisY - halfHeightPx
  const bottomY = axisY + halfHeightPx

  // The half-aperture actually being drawn, in mm (<= the true diameter/2 when
  // the height above is clamped), so the rendered curve's sag is true-to-scale
  // for whatever height is currently shown.
  const drawnHalfApertureMm =
    trueHalfHeightPx > 0 ? (halfHeightPx / trueHalfHeightPx) * (component.diameterMm / 2) : 0

  // Vertex positions (on-axis, at y=0) are separated by exactly centerThicknessMm,
  // padded to a minimum visible/selectable gap at low zoom.
  const trueLeftVertexX = scales.xToSvg(component.xMm)
  const trueRightVertexX = scales.xToSvg(component.xMm + component.centerThicknessMm)
  const vertexCenterX = (trueLeftVertexX + trueRightVertexX) / 2
  const vertexGapPx = Math.max(trueRightVertexX - trueLeftVertexX, MIN_VERTEX_GAP_PX)
  const leftVertexX = vertexCenterX - vertexGapPx / 2
  const rightVertexX = vertexCenterX + vertexGapPx / 2

  // True-to-scale sag, clamped only so a too-small aperture-vs-ROC combination
  // (which is itself flagged by geometryWarning) doesn't produce NaN.
  const maxSupportedApertureMm = Math.min(Math.abs(component.leftRocMm), Math.abs(component.rightRocMm)) * 0.999
  const clampedApertureMm = Math.min(drawnHalfApertureMm, maxSupportedApertureMm)
  const leftSagMm = surfaceSagMm(component.leftRocMm, clampedApertureMm) ?? 0
  const rightSagMm = surfaceSagMm(component.rightRocMm, clampedApertureMm) ?? 0
  const leftEdgeX = leftVertexX + leftSagMm * pxPerMm
  const rightEdgeX = rightVertexX + rightSagMm * pxPerMm

  const leftCurve = surfaceCurveCommand(leftEdgeX, leftVertexX, topY, bottomY)
  const rightCurve = surfaceCurveCommand(rightEdgeX, rightVertexX, bottomY, topY)
  const leftSurfaceD = `M ${leftEdgeX},${topY} ${leftCurve}`
  const rightSurfaceD = `M ${rightEdgeX},${bottomY} ${rightCurve}`
  const bodyD = `M ${leftEdgeX},${topY} ${leftCurve} L ${rightEdgeX},${bottomY} ${rightCurve} Z`

  const { onPointerDown, onPointerMove, onPointerUp } = useComponentDrag(component, scales)

  function handleClick(e: MouseEvent<SVGGElement>) {
    e.stopPropagation()
    onSelect()
  }

  const className = [
    'component',
    'thick-lens',
    component.locked && 'locked',
    selected && 'selected',
    (apertureWarning || geometryIssue.kind !== 'ok') && 'aperture-warning',
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
      {geometryIssue.kind === 'aperture-exceeds-roc' && (
        <title>{`${geometryIssue.surface === 'left' ? 'Left' : 'Right'} ROC is smaller than half the diameter: that surface can't physically span this aperture`}</title>
      )}
      {geometryIssue.kind === 'surfaces-cross' && (
        <title>Center thickness is too small for this curvature: surfaces would intersect within the aperture</title>
      )}
      <path className="lens-body" d={bodyD} />
      <path className="lens-surface" d={leftSurfaceD} />
      <path className="lens-surface" d={rightSurfaceD} />
      <line
        className={`lens-cap${isHeightClamped ? ' clamped' : ''}`}
        x1={leftEdgeX}
        y1={topY}
        x2={rightEdgeX}
        y2={topY}
      />
      <line
        className={`lens-cap${isHeightClamped ? ' clamped' : ''}`}
        x1={leftEdgeX}
        y1={bottomY}
        x2={rightEdgeX}
        y2={bottomY}
      />
      <text className="component-label" x={vertexCenterX} y={topY - LABEL_OFFSET_PX}>
        {component.label}
      </text>
    </g>
  )
}
