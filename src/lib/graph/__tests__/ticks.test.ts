import { describe, expect, it } from 'vitest'
import { buildTicks, formatTickValue } from '../ticks'

describe('buildTicks', () => {
  it('generates ticks at the expected positions', () => {
    expect(buildTicks(0, 10, 2)).toEqual([0, 2, 4, 6, 8, 10])
  })

  it('starts at the first multiple of step >= min', () => {
    expect(buildTicks(3, 10, 2)).toEqual([4, 6, 8, 10])
  })

  it('returns [] for non-finite, zero, or negative step', () => {
    expect(buildTicks(0, 10, 0)).toEqual([])
    expect(buildTicks(0, 10, -1)).toEqual([])
    expect(buildTicks(0, 10, NaN)).toEqual([])
    expect(buildTicks(0, 10, Infinity)).toEqual([])
  })

  it('terminates instead of hanging when step cannot advance t at extreme magnitude', () => {
    const ticks = buildTicks(1e13, 1e13 + 1e-3, 1e-4)
    expect(ticks.length).toBeLessThan(10)
  })

  it('respects the maxTicks cap', () => {
    expect(buildTicks(0, 1000, 1, 5)).toHaveLength(5)
  })
})

describe('formatTickValue', () => {
  it('uses 0 decimals when step is 1', () => {
    expect(formatTickValue(100, 1)).toBe('100')
  })

  it('uses 1 decimal when step is 0.5', () => {
    expect(formatTickValue(100, 0.5)).toBe('100.0')
  })

  it('uses 3 decimals when step is 0.001', () => {
    expect(formatTickValue(100, 0.001)).toBe('100.000')
  })

  it('clamps decimals at 6', () => {
    expect(formatTickValue(1, 1e-12)).toBe('1.000000')
  })

  it('falls back to 2 decimals for non-finite or non-positive step', () => {
    expect(formatTickValue(1.2345, 0)).toBe('1.23')
    expect(formatTickValue(1.2345, NaN)).toBe('1.23')
  })
})
