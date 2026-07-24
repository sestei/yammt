import type { BeamStateAtZ } from '../optics/propagate'
import type { Viewport } from '../scene/types'

export type SecondaryAxisKind = Exclude<Viewport['secondaryAxis'], 'none'>

export interface SecondaryAxisSpec {
  domainMin: number
  domainMax: number
  unitLabel: string
  formatTick(value: number): string
  valueOf(state: BeamStateAtZ): number
}

const CURVATURE_CLAMP_FACTOR = 2

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function getSecondaryAxisSpec(kind: SecondaryAxisKind, xMinMm: number, xMaxMm: number): SecondaryAxisSpec {
  if (kind === 'gouy-phase') {
    return {
      domainMin: -90,
      domainMax: 90,
      unitLabel: 'deg',
      formatTick: (value) => value.toFixed(0),
      valueOf: (state) => (state.gouyPhaseRad * 180) / Math.PI,
    }
  }

  const span = xMaxMm - xMinMm || 1
  const domainMax = CURVATURE_CLAMP_FACTOR * span
  return {
    domainMin: -domainMax,
    domainMax,
    unitLabel: 'mm',
    formatTick: (value) => value.toFixed(0),
    valueOf: (state) => clamp(state.curvatureRadiusMm, -domainMax, domainMax),
  }
}
