import { describe, expect, it } from 'vitest'
import { filterCatalogEntries, parseLensCatalog } from '../catalog'

describe('parseLensCatalog', () => {
  it('parses valid entries and assigns fresh ids', () => {
    const raw = [
      { name: 'f=100mm', kind: 'thin-lens', diameterMm: 25.4, focalLengthMm: 100 },
      {
        name: 'LA4001-1064',
        kind: 'thick-lens',
        refractiveIndex: 1.444,
        leftRocMm: 6.88,
        rightRocMm: null,
        diameterMm: 12.7,
        centerThicknessMm: 6.03,
      },
    ]
    const catalog = parseLensCatalog('test', 'Test Catalogue', raw)

    expect(catalog.id).toBe('test')
    expect(catalog.name).toBe('Test Catalogue')
    expect(catalog.entries).toHaveLength(2)
    expect(catalog.entries[0].id).toBeTruthy()
    expect(catalog.entries[1].id).toBeTruthy()
    expect(catalog.entries[0].id).not.toBe(catalog.entries[1].id)
  })

  it('recovers a literal null ROC to Infinity', () => {
    const raw = [
      {
        name: 'flat',
        kind: 'thick-lens',
        refractiveIndex: 1.444,
        leftRocMm: 10,
        rightRocMm: null,
        diameterMm: 12.7,
        centerThicknessMm: 5,
      },
    ]
    const catalog = parseLensCatalog('test', 'Test Catalogue', raw)
    expect(catalog.entries[0]).toMatchObject({ rightRocMm: Infinity })
  })

  it('throws a clear error on non-array input', () => {
    expect(() => parseLensCatalog('test', 'Test Catalogue', { not: 'an array' })).toThrow(/not an array/)
  })

  it('throws a clear error on an entry with an invalid kind', () => {
    const raw = [{ name: 'bad', kind: 'placeholder' }]
    expect(() => parseLensCatalog('test', 'Test Catalogue', raw)).toThrow(/invalid "kind"/)
  })

  it('infers centerThicknessMm from edgeThicknessMm and drops edgeThicknessMm', () => {
    const raw = [
      {
        name: 'R=+25mm',
        kind: 'thick-lens',
        refractiveIndex: 1.45,
        leftRocMm: 25.0,
        rightRocMm: null,
        diameterMm: 25.4,
        edgeThicknessMm: 2.0,
      },
    ]
    const catalog = parseLensCatalog('test', 'Test Catalogue', raw)
    expect(catalog.entries[0]).toMatchObject({ centerThicknessMm: 5.466073279589715 })
    expect(catalog.entries[0]).not.toHaveProperty('edgeThicknessMm')
  })

  it('leaves centerThicknessMm untouched when already present, ignoring the missing edgeThicknessMm case', () => {
    const raw = [
      {
        name: 'R=+150mm',
        kind: 'thick-lens',
        refractiveIndex: 1.45,
        leftRocMm: 150.0,
        rightRocMm: null,
        diameterMm: 25.4,
        centerThicknessMm: 2.0,
      },
    ]
    const catalog = parseLensCatalog('test', 'Test Catalogue', raw)
    expect(catalog.entries[0]).toMatchObject({ centerThicknessMm: 2.0 })
  })
})

describe('filterCatalogEntries', () => {
  const entries = [
    { id: '1', name: 'LA4001-1064', kind: 'thin-lens' as const, diameterMm: 25, focalLengthMm: 100 },
    { id: '2', name: 'LA4002-1064', kind: 'thin-lens' as const, diameterMm: 25, focalLengthMm: 200 },
    { id: '3', name: 'f=50mm', kind: 'thin-lens' as const, diameterMm: 25, focalLengthMm: 50 },
  ]

  it('returns all entries for an empty query', () => {
    expect(filterCatalogEntries(entries, '')).toEqual(entries)
  })

  it('filters case-insensitively by substring match on name', () => {
    expect(filterCatalogEntries(entries, 'la40')).toEqual([entries[0], entries[1]])
  })

  it('excludes entries that do not match', () => {
    expect(filterCatalogEntries(entries, 'nomatch')).toEqual([])
  })
})
