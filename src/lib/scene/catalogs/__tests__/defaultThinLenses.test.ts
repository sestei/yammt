import { describe, expect, it } from 'vitest'
import { DEFAULT_THIN_LENSES_CATALOG } from '../defaultThinLenses'
import type { ThinLensDatabaseEntry } from '../../types'

describe('DEFAULT_THIN_LENSES_CATALOG', () => {
  it('is named "Default thin lenses" and seeds 8 thin lenses at the expected focal lengths', () => {
    expect(DEFAULT_THIN_LENSES_CATALOG.name).toBe('Default thin lenses')
    expect(DEFAULT_THIN_LENSES_CATALOG.entries).toHaveLength(8)
    expect(DEFAULT_THIN_LENSES_CATALOG.entries.every((e) => e.kind === 'thin-lens')).toBe(true)
    const focalLengths = DEFAULT_THIN_LENSES_CATALOG.entries
      .map((e) => (e as ThinLensDatabaseEntry).focalLengthMm)
      .sort((a, b) => a - b)
    expect(focalLengths).toEqual([-500, -250, -100, -50, 50, 100, 250, 500])
  })
})
