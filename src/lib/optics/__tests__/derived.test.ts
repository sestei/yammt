import { describe, expect, it } from 'vitest'
import { qAtWaist, qAtZ, rayleighRangeMm, type GaussianBeam } from '../beam'
import { gouyPhaseRad, wavefrontRadiusOfCurvatureMm } from '../derived'

const beam: GaussianBeam = { wavelengthNm: 1064, waistUm: 337, waistZMm: 0 }

describe('wavefrontRadiusOfCurvatureMm', () => {
  it('is infinite at the waist', () => {
    const q = qAtWaist(beam)
    expect(wavefrontRadiusOfCurvatureMm(q)).toBe(Infinity)
  })
})

describe('gouyPhaseRad', () => {
  it('is zero at the waist', () => {
    expect(gouyPhaseRad(qAtWaist(beam))).toBeCloseTo(0, 10)
  })

  it('is +-pi/4 at z = +-zR', () => {
    const zR = rayleighRangeMm(beam)
    expect(gouyPhaseRad(qAtZ(beam, zR))).toBeCloseTo(Math.PI / 4, 8)
    expect(gouyPhaseRad(qAtZ(beam, -zR))).toBeCloseTo(-Math.PI / 4, 8)
  })

  it('approaches +-pi/2 far from the waist', () => {
    const zR = rayleighRangeMm(beam)
    expect(gouyPhaseRad(qAtZ(beam, 1000 * zR))).toBeCloseTo(Math.PI / 2, 2)
    expect(gouyPhaseRad(qAtZ(beam, -1000 * zR))).toBeCloseTo(-Math.PI / 2, 2)
  })
})
