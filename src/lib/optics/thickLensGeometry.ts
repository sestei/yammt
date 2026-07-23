import type { ThickLens } from '../scene/types'

/**
 * Sag (mm) of a spherical surface at the given half-aperture height, in the
 * standard sign convention (R>0 -> positive/+x sag). Null if the aperture
 * exceeds what this ROC can physically support (surface doesn't reach that high).
 * Exported so the glyph can render the exact same true-to-scale curve that this
 * validity check is based on -- the two must never disagree.
 */
export function surfaceSagMm(rocMm: number, halfApertureMm: number): number | null {
  if (!Number.isFinite(rocMm)) return 0
  if (Math.abs(rocMm) < halfApertureMm) return null
  const sign = Math.sign(rocMm)
  return rocMm - sign * Math.sqrt(rocMm * rocMm - halfApertureMm * halfApertureMm)
}

export type ThickLensGeometryIssue =
  | { kind: 'ok' }
  /** |ROC| < half the diameter: that surface's sphere can't physically span the aperture. */
  | { kind: 'aperture-exceeds-roc'; surface: 'left' | 'right' }
  /** Both surfaces individually fit the aperture, but centerThickness is too small for them not to intersect. */
  | { kind: 'surfaces-cross'; edgeThicknessMm: number }

export function checkThickLensGeometry(component: ThickLens): ThickLensGeometryIssue {
  const halfApertureMm = component.diameterMm / 2

  const leftSag = surfaceSagMm(component.leftRocMm, halfApertureMm)
  if (leftSag === null) return { kind: 'aperture-exceeds-roc', surface: 'left' }

  const rightSag = surfaceSagMm(component.rightRocMm, halfApertureMm)
  if (rightSag === null) return { kind: 'aperture-exceeds-roc', surface: 'right' }

  const edgeThicknessMm = component.centerThicknessMm + rightSag - leftSag
  if (edgeThicknessMm <= 0) return { kind: 'surfaces-cross', edgeThicknessMm }

  return { kind: 'ok' }
}

export function isThickLensGeometryValid(component: ThickLens): boolean {
  return checkThickLensGeometry(component).kind === 'ok'
}
