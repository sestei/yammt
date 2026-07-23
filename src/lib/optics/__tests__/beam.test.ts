import { describe, expect, it } from 'vitest'
import { freeSpace } from '../abcd'
import { applyABCD, qAtWaist, qAtZ, rayleighRangeMm, type GaussianBeam } from '../beam'
import { beamRadiusMm } from '../derived'

const beam: GaussianBeam = { wavelengthNm: 1064, waistUm: 337, waistZMm: 0 }

describe('rayleighRangeMm', () => {
  it('matches pi*w0^2/lambda', () => {
    const w0 = 337e-3 // mm
    const lambda = 1064e-6 // mm
    expect(rayleighRangeMm(beam)).toBeCloseTo((Math.PI * w0 * w0) / lambda, 6)
  })
})

describe('qAtWaist', () => {
  it('is purely imaginary and equals i*zR', () => {
    const q = qAtWaist(beam)
    expect(q.re).toBeCloseTo(0, 10)
    expect(q.im).toBeCloseTo(rayleighRangeMm(beam), 10)
  })
})

describe('qAtZ / beam radius', () => {
  it('matches the analytic w(z) = w0*sqrt(1+((z-z0)/zR)^2)', () => {
    const zR = rayleighRangeMm(beam)
    const w0 = 337e-3
    for (const z of [-2 * zR, -zR, 0, zR, 2 * zR, 5 * zR]) {
      const q = qAtZ(beam, z)
      const w = beamRadiusMm(q, beam.wavelengthNm * 1e-6)
      const expected = w0 * Math.sqrt(1 + ((z - beam.waistZMm) / zR) ** 2)
      expect(w).toBeCloseTo(expected, 6)
    }
  })
})

describe('applyABCD with free space', () => {
  it('matches qAtZ shifted by the propagation distance', () => {
    const q0 = qAtZ(beam, 10)
    const propagated = applyABCD(q0, freeSpace(25))
    const expected = qAtZ(beam, 35)
    expect(propagated.re).toBeCloseTo(expected.re, 8)
    expect(propagated.im).toBeCloseTo(expected.im, 8)
  })
})
