import type { HoleSpacing, LengthUnit } from '../scene/types'

const MM_PER_UNIT: Record<Exclude<LengthUnit, 'holes'>, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
}

export function holeSpacingMm(spacing: HoleSpacing): number {
  return spacing === '1inch' ? 25.4 : 25
}

/** Converts a millimeter value to the given display unit. */
export function mmToUnit(valueMm: number, unit: LengthUnit, holeSpacing: HoleSpacing): number {
  if (unit === 'holes') {
    return valueMm / holeSpacingMm(holeSpacing)
  }
  return valueMm / MM_PER_UNIT[unit]
}

/** Converts a value in the given display unit back to millimeters. */
export function unitToMm(value: number, unit: LengthUnit, holeSpacing: HoleSpacing): number {
  if (unit === 'holes') {
    return value * holeSpacingMm(holeSpacing)
  }
  return value * MM_PER_UNIT[unit]
}

export function unitLabel(unit: LengthUnit, holeSpacing: HoleSpacing): string {
  if (unit === 'holes') {
    return holeSpacing === '1inch' ? 'holes (1")' : 'holes (25mm)'
  }
  return unit
}

/**
 * Picks a "nice" tick interval (in display units) for the given visible span,
 * targeting roughly `targetTicks` gridlines across the span.
 */
export function niceTickInterval(spanInUnit: number, targetTicks = 8): number {
  if (spanInUnit <= 0) return 1
  const roughStep = spanInUnit / targetTicks
  const magnitude = 10 ** Math.floor(Math.log10(roughStep))
  const residual = roughStep / magnitude
  let niceResidual: number
  if (residual < 1.5) niceResidual = 1
  else if (residual < 3.5) niceResidual = 2
  else if (residual < 7.5) niceResidual = 5
  else niceResidual = 10
  return niceResidual * magnitude
}

/** Picks whether the y-axis should display in mm or um based on magnitude. */
export function autoYUnit(maxRadiusMm: number): 'mm' | 'um' {
  return maxRadiusMm < 1 ? 'um' : 'mm'
}

export function mmToDisplayY(valueMm: number, unit: 'mm' | 'um'): number {
  return unit === 'um' ? valueMm * 1000 : valueMm
}
