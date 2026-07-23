import { describe, expect, it } from 'vitest'
import { multiplyABCD, thickLensMatrix, thinLensMatrix, type ABCD } from '../abcd'
import { applyABCD, qAtZ, rayleighRangeMm, wavelengthMm, type GaussianBeam } from '../beam'
import { beamRadiusMm } from '../derived'
import { beamStateAt, buildElementList, computeOutputBeam, sampleBeamProfile } from '../propagate'
import type { SceneComponent, ThickLens, ThinLens } from '../../scene/types'

const beam: GaussianBeam = { wavelengthNm: 1064, waistUm: 337, waistZMm: 0 }

function makeThinLens(id: string, xMm: number, focalLengthMm: number): ThinLens {
  return { id, kind: 'thin-lens', label: id, locked: false, group: 0, xMm, diameterMm: 25, focalLengthMm }
}

function makeThickLens(id: string, xMm: number): ThickLens {
  return {
    id,
    kind: 'thick-lens',
    label: id,
    locked: false,
    group: 0,
    xMm,
    refractiveIndex: 1.5,
    leftRocMm: 50,
    rightRocMm: -50,
    diameterMm: 25,
    centerThicknessMm: 5,
  }
}

describe('buildElementList', () => {
  it('sorts by x position, ignoring analyzers and placeholders', () => {
    const components: SceneComponent[] = [
      makeThinLens('b', 100, 50),
      { id: 'ph', kind: 'placeholder', label: 'ph', locked: false, group: 0, xStartMm: 0, xEndMm: 10 },
      makeThinLens('a', 20, 75),
      { id: 'an', kind: 'analyzer', label: 'an', locked: false, group: 0, xMm: 50 },
    ]
    const elements = buildElementList(components)
    expect(elements.map((e) => e.id)).toEqual(['a', 'b'])
    expect(elements[0].xMm).toBe(20)
    expect(elements[1].xMm).toBe(100)
  })

  it('breaks ties at the same x by id', () => {
    const components: SceneComponent[] = [makeThinLens('z', 50, 50), makeThinLens('a', 50, 50)]
    const elements = buildElementList(components)
    expect(elements.map((e) => e.id)).toEqual(['a', 'z'])
  })
})

describe('beamStateAt with a thin lens of f -> infinity', () => {
  it('behaves as if the lens were not present', () => {
    const elements = buildElementList([makeThinLens('l1', 100, 1e9)])
    const withLens = beamStateAt(beam, elements, 500)
    const withoutLens = beamStateAt(beam, [], 500)
    expect(withLens.radiusMm).toBeCloseTo(withoutLens.radiusMm, 6)
  })
})

describe('afocal two-lens system (separation = f1 + f2)', () => {
  it('has zero net optical power (C = 0) and matches the angular magnification', () => {
    const f1 = 50
    const f2 = 80
    const elements = buildElementList([makeThinLens('l1', 0, f1), makeThinLens('l2', f1 + f2, f2)])
    // Compose the elements' matrices manually the same way propagate.ts does,
    // to cross-check against the closed-form afocal relations.
    const freeSpace = (d: number): ABCD => ({ A: 1, B: d, C: 0, D: 1 })
    const system = multiplyABCD(elements[1].matrix, multiplyABCD(freeSpace(f1 + f2), elements[0].matrix))
    expect(system.C).toBeCloseTo(0, 8)
    expect(system.A).toBeCloseTo(-f2 / f1, 8)
    expect(system.D).toBeCloseTo(-f1 / f2, 8)
    // Sanity: matches the standalone thinLensMatrix helper too.
    expect(elements[0].matrix).toEqual(thinLensMatrix(f1))
  })
})

describe('sampleBeamProfile', () => {
  it('matches beamStateAt at each sample point for a lens-free system', () => {
    const samples = sampleBeamProfile(beam, [], -10, 10, 5)
    for (const s of samples) {
      const direct = beamStateAt(beam, [], s.zMm)
      expect(s.radiusMm).toBeCloseTo(direct.radiusMm, 8)
    }
  })

  it('accounts for elements before the visible window when seeding the starting q', () => {
    // A strong lens placed before the visible window should still bend the beam
    // inside the window, compared to no lens at all.
    const lensBefore = buildElementList([makeThinLens('l1', -50, 30)])
    const withLens = sampleBeamProfile(beam, lensBefore, 0, 100, 20)
    const withoutLens = sampleBeamProfile(beam, [], 0, 100, 20)
    const anyDifferent = withLens.some((s, i) => Math.abs(s.radiusMm - withoutLens[i].radiusMm) > 1e-6)
    expect(anyDifferent).toBe(true)
  })

  it('produces a discontinuous radius derivative at a lens position (refraction kink)', () => {
    const zR = rayleighRangeMm(beam)
    const elements = buildElementList([makeThinLens('l1', zR, 20)])
    const justBefore = beamStateAt(beam, elements, zR - 1e-6)
    const justAfter = beamStateAt(beam, elements, zR + 1e-6)
    // Radius itself is continuous across a thin lens (only wavefront curvature jumps).
    expect(justAfter.radiusMm).toBeCloseTo(justBefore.radiusMm, 4)
    expect(justAfter.curvatureRadiusMm).not.toBeCloseTo(justBefore.curvatureRadiusMm, 2)
  })
})

describe('buildElementList for a thick lens', () => {
  it('splits into two elements, one per surface, at the correct positions', () => {
    const elements = buildElementList([makeThickLens('tl', 10)])
    expect(elements).toHaveLength(2)
    expect(elements[0].xMm).toBe(10)
    expect(elements[1].xMm).toBe(15) // xMm + centerThicknessMm
  })

  it('produces the same net effect as the combined thickLensMatrix (physics unchanged)', () => {
    const lens = makeThickLens('tl', 10)
    const elements = buildElementList([lens])
    const afterSplit = beamStateAt(beam, elements, lens.xMm + lens.centerThicknessMm)

    const combined = thickLensMatrix({
      n: lens.refractiveIndex,
      r1Mm: lens.leftRocMm,
      r2Mm: lens.rightRocMm,
      thicknessMm: lens.centerThicknessMm,
    })
    const qBeforeLens = qAtZ(beam, lens.xMm)
    const qAfterCombined = applyABCD(qBeforeLens, combined)
    const expectedRadius = beamRadiusMm(qAfterCombined, wavelengthMm(beam))

    expect(afterSplit.radiusMm).toBeCloseTo(expectedRadius, 8)
  })

  it('uses the local wavelength (vacuum / n) to interpret q as a radius while inside the substrate', () => {
    const lens = makeThickLens('tl', 10) // n = 1.5
    const elements = buildElementList([lens])
    const midpointZ = lens.xMm + lens.centerThicknessMm / 2

    const state = beamStateAt(beam, elements, midpointZ)
    const expectedWithLocalLambda = beamRadiusMm(state.q, wavelengthMm(beam) / lens.refractiveIndex)
    const wrongWithVacuumLambda = beamRadiusMm(state.q, wavelengthMm(beam))

    expect(state.radiusMm).toBeCloseTo(expectedWithLocalLambda, 8)
    expect(state.radiusMm).not.toBeCloseTo(wrongWithVacuumLambda, 4)
  })

  it('shows a distinct curvature discontinuity at each surface, not one collapsed kink', () => {
    const lens = makeThickLens('tl', 10)
    const elements = buildElementList([lens])

    const beforeSurface1 = beamStateAt(beam, elements, lens.xMm - 1e-6)
    const afterSurface1 = beamStateAt(beam, elements, lens.xMm + 1e-6)
    const beforeSurface2 = beamStateAt(beam, elements, lens.xMm + lens.centerThicknessMm - 1e-6)
    const afterSurface2 = beamStateAt(beam, elements, lens.xMm + lens.centerThicknessMm + 1e-6)

    expect(afterSurface1.curvatureRadiusMm).not.toBeCloseTo(beforeSurface1.curvatureRadiusMm, 2)
    expect(afterSurface2.curvatureRadiusMm).not.toBeCloseTo(beforeSurface2.curvatureRadiusMm, 2)
    // The state right after surface 1 should differ from right before surface 2 --
    // i.e. there's a genuine propagation gap between the two kinks, not one point.
    expect(afterSurface1.curvatureRadiusMm).not.toBeCloseTo(beforeSurface2.curvatureRadiusMm, 2)
  })
})

describe('computeOutputBeam', () => {
  it('returns the input beam unchanged when there are no elements', () => {
    expect(computeOutputBeam(beam, [])).toEqual(beam)
  })

  it('produces a beam whose free-space q at the last element matches the true propagated q', () => {
    const lens = makeThinLens('l1', 30, 50)
    const elements = buildElementList([lens])
    const outputBeam = computeOutputBeam(beam, elements)

    const trueQAtLens = beamStateAt(beam, elements, lens.xMm).q
    const reconstructedQ = qAtZ(outputBeam, lens.xMm)

    expect(reconstructedQ.re).toBeCloseTo(trueQAtLens.re, 8)
    expect(reconstructedQ.im).toBeCloseTo(trueQAtLens.im, 8)
  })

  it('accounts for a thick lens substrate, matching q right after the second surface', () => {
    const lens = makeThickLens('tl', 10)
    const elements = buildElementList([lens])
    const outputBeam = computeOutputBeam(beam, elements)

    const exitZ = lens.xMm + lens.centerThicknessMm
    const trueQAtExit = beamStateAt(beam, elements, exitZ).q
    const reconstructedQ = qAtZ(outputBeam, exitZ)

    expect(reconstructedQ.re).toBeCloseTo(trueQAtExit.re, 6)
    expect(reconstructedQ.im).toBeCloseTo(trueQAtExit.im, 6)
  })
})

describe('cross-check against direct qAtZ for a lens-free beam', () => {
  it('agrees with the analytic radius formula', () => {
    const z = 3.7
    const state = beamStateAt(beam, [], z)
    const direct = beamRadiusMm(qAtZ(beam, z), beam.wavelengthNm * 1e-6)
    expect(state.radiusMm).toBeCloseTo(direct, 8)
  })
})
