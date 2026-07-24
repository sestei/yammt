import { describe, expect, it } from 'vitest'
import { buildComponentAt } from '../placement'
import type { Placeholder } from '../types'

function placeholder(xStartMm: number, xEndMm: number): Placeholder {
  return { id: 'p', kind: 'placeholder', label: 'p', locked: false, group: 0, xStartMm, xEndMm }
}

describe('buildComponentAt', () => {
  it('allows placing an analyzer inside a placeholder region', () => {
    const component = buildComponentAt('analyzer', 10, [placeholder(0, 20)])
    expect(component).not.toBeNull()
    expect(component?.kind).toBe('analyzer')
  })

  it('still blocks a lens from being placed inside a placeholder region', () => {
    expect(buildComponentAt('thin-lens', 10, [placeholder(0, 20)])).toBeNull()
  })

  it('still blocks a placeholder from being placed over a lens', () => {
    const lens = { id: 'l', kind: 'thin-lens' as const, label: 'l', locked: false, group: 0 as const, xMm: 10, diameterMm: 25, focalLengthMm: 100 }
    expect(buildComponentAt('placeholder', 10, [lens])).toBeNull()
  })
})
