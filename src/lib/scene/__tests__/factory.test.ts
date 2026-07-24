import { describe, expect, it } from 'vitest'
import { createLensDatabaseEntry, DEFAULT_LENS_DATABASE, instantiateFromDatabaseEntry } from '../factory'
import type { ThickLensDatabaseEntry, ThinLensDatabaseEntry } from '../types'

describe('createLensDatabaseEntry', () => {
  it('creates a thin lens entry with default shape values', () => {
    const entry = createLensDatabaseEntry('thin-lens') as ThinLensDatabaseEntry
    expect(entry.kind).toBe('thin-lens')
    expect(entry.diameterMm).toBe(25.4)
    expect(entry.focalLengthMm).toBe(100)
    expect(entry.id).toBeTruthy()
  })

  it('creates a thick lens entry with default shape values', () => {
    const entry = createLensDatabaseEntry('thick-lens') as ThickLensDatabaseEntry
    expect(entry.kind).toBe('thick-lens')
    expect(entry.refractiveIndex).toBe(1.5)
    expect(entry.leftRocMm).toBe(50)
    expect(entry.rightRocMm).toBe(-50)
  })

  it('creates entries with distinct ids', () => {
    const a = createLensDatabaseEntry('thin-lens')
    const b = createLensDatabaseEntry('thin-lens')
    expect(a.id).not.toBe(b.id)
  })
})

describe('instantiateFromDatabaseEntry', () => {
  it('builds an independent thin lens component from a thin lens entry', () => {
    const entry: ThinLensDatabaseEntry = {
      id: 'e1',
      name: 'f=250mm',
      kind: 'thin-lens',
      diameterMm: 30,
      focalLengthMm: 250,
    }
    const component = instantiateFromDatabaseEntry(entry, 42)
    expect(component).toMatchObject({
      kind: 'thin-lens',
      xMm: 42,
      diameterMm: 30,
      focalLengthMm: 250,
      label: 'f=250mm',
      locked: false,
      group: 0,
    })
    expect(component.id).not.toBe(entry.id)
  })

  it('builds an independent thick lens component from a thick lens entry', () => {
    const entry: ThickLensDatabaseEntry = {
      id: 'e2',
      name: 'BK7 lens',
      kind: 'thick-lens',
      refractiveIndex: 1.52,
      leftRocMm: 80,
      rightRocMm: -80,
      diameterMm: 20,
      centerThicknessMm: 6,
    }
    const component = instantiateFromDatabaseEntry(entry, 10)
    expect(component).toMatchObject({
      kind: 'thick-lens',
      xMm: 10,
      refractiveIndex: 1.52,
      leftRocMm: 80,
      rightRocMm: -80,
      diameterMm: 20,
      centerThicknessMm: 6,
      label: 'BK7 lens',
    })
  })
})

describe('DEFAULT_LENS_DATABASE', () => {
  it('seeds 8 thin lenses at the expected focal lengths', () => {
    expect(DEFAULT_LENS_DATABASE).toHaveLength(8)
    expect(DEFAULT_LENS_DATABASE.every((e) => e.kind === 'thin-lens')).toBe(true)
    const focalLengths = DEFAULT_LENS_DATABASE.map((e) => (e as ThinLensDatabaseEntry).focalLengthMm).sort(
      (a, b) => a - b,
    )
    expect(focalLengths).toEqual([-500, -250, -100, -50, 50, 100, 250, 500])
  })
})
