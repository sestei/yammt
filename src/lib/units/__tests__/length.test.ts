import { describe, expect, it } from 'vitest'
import { mmToUnit, niceTickInterval, unitToMm } from '../length'

describe('mm <-> unit round-trips', () => {
  it('round-trips through cm', () => {
    const mm = 123.45
    expect(unitToMm(mmToUnit(mm, 'cm', '25mm'), 'cm', '25mm')).toBeCloseTo(mm, 8)
  })

  it('round-trips through m', () => {
    const mm = 4321
    expect(unitToMm(mmToUnit(mm, 'm', '25mm'), 'm', '25mm')).toBeCloseTo(mm, 8)
  })

  it('round-trips through holes, 25mm spacing', () => {
    const mm = 250
    expect(mmToUnit(mm, 'holes', '25mm')).toBeCloseTo(10, 8)
    expect(unitToMm(10, 'holes', '25mm')).toBeCloseTo(mm, 8)
  })

  it('round-trips through holes, 1 inch spacing', () => {
    const mm = 254
    expect(mmToUnit(mm, 'holes', '1inch')).toBeCloseTo(10, 8)
    expect(unitToMm(10, 'holes', '1inch')).toBeCloseTo(mm, 8)
  })
})

describe('niceTickInterval', () => {
  it('picks a round number close to span/targetTicks', () => {
    expect(niceTickInterval(100, 10)).toBe(10)
    expect(niceTickInterval(50, 10)).toBe(5)
    expect(niceTickInterval(1000, 10)).toBe(100)
  })
})
