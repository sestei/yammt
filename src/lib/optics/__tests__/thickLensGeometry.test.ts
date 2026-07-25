import { describe, expect, it } from 'vitest'
import { checkThickLensGeometry, flippedThickLensRoc, isThickLensGeometryValid } from '../thickLensGeometry'
import type { ThickLens } from '../../scene/types'

function thickLens(overrides: Partial<ThickLens>): ThickLens {
  return {
    id: 'l1',
    kind: 'thick-lens',
    label: 'l1',
    locked: false,
    group: 0,
    disabled: false,
    xMm: 0,
    refractiveIndex: 1.5,
    leftRocMm: 50,
    rightRocMm: -50,
    diameterMm: 25,
    centerThicknessMm: 5,
    ...overrides,
  }
}

describe('checkThickLensGeometry', () => {
  it('is ok for a reasonable biconvex lens', () => {
    expect(checkThickLensGeometry(thickLens({}))).toEqual({ kind: 'ok' })
  })

  it('is ok for a biconcave lens (edge thicker than center)', () => {
    expect(checkThickLensGeometry(thickLens({ leftRocMm: -50, rightRocMm: 50, centerThicknessMm: 5 }))).toEqual({
      kind: 'ok',
    })
  })

  it('flags aperture-exceeds-roc on the left surface when |leftRoc| < half the diameter', () => {
    const issue = checkThickLensGeometry(thickLens({ leftRocMm: 5, diameterMm: 100 }))
    expect(issue).toEqual({ kind: 'aperture-exceeds-roc', surface: 'left' })
  })

  it('flags aperture-exceeds-roc on the right surface when |rightRoc| < half the diameter', () => {
    const issue = checkThickLensGeometry(thickLens({ rightRocMm: -5, diameterMm: 100 }))
    expect(issue).toEqual({ kind: 'aperture-exceeds-roc', surface: 'right' })
  })

  it('prefers the aperture-exceeds-roc diagnosis over surfaces-cross when both surfaces are too small for the aperture', () => {
    // A tiny centerThickness would also make edge thickness negative here, but the
    // more specific/actionable diagnosis (ROC too small for this diameter) should win.
    const issue = checkThickLensGeometry(thickLens({ leftRocMm: 5, diameterMm: 100, centerThicknessMm: 0.01 }))
    expect(issue.kind).toBe('aperture-exceeds-roc')
  })

  it('flags surfaces-cross when both surfaces individually fit but center thickness is too small', () => {
    const issue = checkThickLensGeometry(thickLens({ leftRocMm: 20, rightRocMm: -20, centerThicknessMm: 0.1 }))
    expect(issue.kind).toBe('surfaces-cross')
    if (issue.kind === 'surfaces-cross') {
      expect(issue.edgeThicknessMm).toBeLessThan(0)
    }
  })
})

describe('isThickLensGeometryValid', () => {
  it('is true for a well-formed lens', () => {
    expect(isThickLensGeometryValid(thickLens({}))).toBe(true)
  })

  it('is false when the edge thickness would be negative', () => {
    expect(isThickLensGeometryValid(thickLens({ leftRocMm: 20, rightRocMm: -20, centerThicknessMm: 0.1 }))).toBe(
      false,
    )
  })

  it('is false when the aperture exceeds a ROC', () => {
    expect(isThickLensGeometryValid(thickLens({ leftRocMm: 5, diameterMm: 100 }))).toBe(false)
  })
})

describe('flippedThickLensRoc', () => {
  it('swaps and negates the two ROCs', () => {
    expect(flippedThickLensRoc({ leftRocMm: 25, rightRocMm: -80 })).toEqual({ leftRocMm: 80, rightRocMm: -25 })
  })

  it('is self-inverse: flipping twice restores the original values', () => {
    const original = { leftRocMm: 13.799, rightRocMm: -47.2 }
    expect(flippedThickLensRoc(flippedThickLensRoc(original))).toEqual(original)
  })

  it('leaves a symmetric biconvex lens unchanged (its own mirror image)', () => {
    expect(flippedThickLensRoc({ leftRocMm: 50, rightRocMm: -50 })).toEqual({ leftRocMm: 50, rightRocMm: -50 })
  })

  it('keeps a flat surface flat after flipping', () => {
    const flipped = flippedThickLensRoc({ leftRocMm: 25, rightRocMm: Infinity })
    expect(Number.isFinite(flipped.leftRocMm)).toBe(false)
    expect(flipped.leftRocMm).toBe(-Infinity)
    expect(flipped.rightRocMm).toBe(-25)
  })
})
