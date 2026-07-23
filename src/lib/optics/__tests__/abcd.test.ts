import { describe, expect, it } from 'vitest'
import { freeSpace, identity, multiplyABCD, thickLensMatrix, thinLensMatrix, type ABCD } from '../abcd'

function determinant(m: ABCD): number {
  return m.A * m.D - m.B * m.C
}

describe('multiplyABCD', () => {
  it('identity is a no-op composed on either side', () => {
    const m = thinLensMatrix(50)
    expect(multiplyABCD(identity, m)).toEqual(m)
    expect(multiplyABCD(m, identity)).toEqual(m)
  })
})

describe('freeSpace', () => {
  it('has determinant 1', () => {
    expect(determinant(freeSpace(123.4))).toBeCloseTo(1, 10)
  })
})

describe('thinLensMatrix', () => {
  it('has determinant 1', () => {
    expect(determinant(thinLensMatrix(75))).toBeCloseTo(1, 10)
  })

  it('C = -1/f', () => {
    const m = thinLensMatrix(200)
    expect(m.C).toBeCloseTo(-1 / 200, 10)
  })
})

describe('thickLensMatrix', () => {
  it('reduces to free space when n=1 (no refraction)', () => {
    const m = thickLensMatrix({ n: 1, r1Mm: 50, r2Mm: -50, thicknessMm: 10 })
    const fs = freeSpace(10)
    expect(m.A).toBeCloseTo(fs.A, 10)
    expect(m.B).toBeCloseTo(fs.B, 10)
    expect(m.C).toBeCloseTo(fs.C, 10)
    expect(m.D).toBeCloseTo(fs.D, 10)
  })

  it('has determinant 1', () => {
    const m = thickLensMatrix({ n: 1.5, r1Mm: 50, r2Mm: -50, thicknessMm: 5 })
    expect(determinant(m)).toBeCloseTo(1, 8)
  })

  it('approaches the thin-lens formula as thickness -> 0', () => {
    const n = 1.5
    const r1 = 50
    const r2 = -50
    const m = thickLensMatrix({ n, r1Mm: r1, r2Mm: r2, thicknessMm: 1e-6 })
    const expectedInvF = (n - 1) * (1 / r1 - 1 / r2)
    expect(-m.C).toBeCloseTo(expectedInvF, 4)
  })
})
