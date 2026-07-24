import { describe, expect, it } from 'vitest'
import { getSecondaryAxisSpec } from '../secondaryAxis'
import type { BeamStateAtZ } from '../../optics/propagate'

function stateWith(overrides: Partial<BeamStateAtZ>): BeamStateAtZ {
  return {
    zMm: 0,
    q: { re: 0, im: 100 },
    radiusMm: 1,
    gouyPhaseRad: 0,
    curvatureRadiusMm: 0,
    ...overrides,
  }
}

describe('getSecondaryAxisSpec', () => {
  it('gouy-phase: fixed +/-90 degree domain, converts radians to degrees', () => {
    const spec = getSecondaryAxisSpec('gouy-phase', -500, 500)
    expect(spec.domainMin).toBe(-90)
    expect(spec.domainMax).toBe(90)
    expect(spec.valueOf(stateWith({ gouyPhaseRad: Math.PI / 2 }))).toBeCloseTo(90)
    expect(spec.valueOf(stateWith({ gouyPhaseRad: -Math.PI / 4 }))).toBeCloseTo(-45)
  })

  it('curvature: domain scales with the visible x-span', () => {
    const spec = getSecondaryAxisSpec('curvature', -100, 100)
    expect(spec.domainMax).toBe(400) // 2 * span(200)
    expect(spec.domainMin).toBe(-400)
  })

  it('curvature: clamps finite values exceeding the domain', () => {
    const spec = getSecondaryAxisSpec('curvature', -100, 100)
    expect(spec.valueOf(stateWith({ curvatureRadiusMm: 10000 }))).toBe(400)
    expect(spec.valueOf(stateWith({ curvatureRadiusMm: -10000 }))).toBe(-400)
  })

  it('curvature: clamps +/-Infinity at the waist', () => {
    const spec = getSecondaryAxisSpec('curvature', -100, 100)
    expect(spec.valueOf(stateWith({ curvatureRadiusMm: Infinity }))).toBe(400)
    expect(spec.valueOf(stateWith({ curvatureRadiusMm: -Infinity }))).toBe(-400)
  })

  it('curvature: passes through values within the domain unchanged', () => {
    const spec = getSecondaryAxisSpec('curvature', -100, 100)
    expect(spec.valueOf(stateWith({ curvatureRadiusMm: 150 }))).toBe(150)
  })
})
