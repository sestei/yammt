import { describe, expect, it } from 'vitest'
import { isXRangeFreeOfLenses, isXRangeFreeOfPlaceholders } from '../placeholderCollision'
import type { Placeholder, SceneComponent, ThinLens } from '../types'

function placeholder(id: string, xStartMm: number, xEndMm: number): Placeholder {
  return { id, kind: 'placeholder', label: id, locked: false, group: 0, xStartMm, xEndMm }
}

function thinLens(id: string, xMm: number): ThinLens {
  return { id, kind: 'thin-lens', label: id, locked: false, group: 0, xMm, diameterMm: 25, focalLengthMm: 100 }
}

describe('isXRangeFreeOfPlaceholders', () => {
  const components: SceneComponent[] = [placeholder('p1', 10, 20)]

  it('rejects a lens point strictly inside the placeholder', () => {
    expect(isXRangeFreeOfPlaceholders(components, 15, 15)).toBe(false)
  })

  it('allows a lens point outside the placeholder', () => {
    expect(isXRangeFreeOfPlaceholders(components, 25, 25)).toBe(true)
  })

  it('allows touching the boundary exactly', () => {
    expect(isXRangeFreeOfPlaceholders(components, 20, 20)).toBe(true)
  })

  it('excludes the given id from the check', () => {
    expect(isXRangeFreeOfPlaceholders(components, 15, 15, 'p1')).toBe(true)
  })
})

describe('isXRangeFreeOfLenses', () => {
  const components: SceneComponent[] = [thinLens('l1', 15)]

  it('rejects a placeholder range that contains a lens', () => {
    expect(isXRangeFreeOfLenses(components, 10, 20)).toBe(false)
  })

  it('allows a placeholder range that does not contain a lens', () => {
    expect(isXRangeFreeOfLenses(components, 20, 30)).toBe(true)
  })

  it('excludes the given id from the check', () => {
    expect(isXRangeFreeOfLenses(components, 10, 20, 'l1')).toBe(true)
  })
})
