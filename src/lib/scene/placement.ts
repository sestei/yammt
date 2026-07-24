import { createAnalyzer, createPlaceholder, createThickLens, createThinLens } from './factory'
import { isXRangeFreeOfLenses, isXRangeFreeOfPlaceholders } from './placeholderCollision'
import { getLeftXMm, getRightXMm } from './positions'
import type { SceneComponent } from './types'

export type PaletteComponentKind = 'thin-lens' | 'thick-lens' | 'analyzer' | 'placeholder'

const COMPONENT_FACTORIES: Record<PaletteComponentKind, (xMm: number) => SceneComponent> = {
  'thin-lens': createThinLens,
  'thick-lens': createThickLens,
  analyzer: createAnalyzer,
  placeholder: createPlaceholder,
}

export function isPaletteComponentKind(kind: string): kind is PaletteComponentKind {
  return kind in COMPONENT_FACTORIES
}

/** Builds a component of `kind` at `xMm`, validated against collision rules. Returns null if occupied. */
export function buildComponentAt(kind: PaletteComponentKind, xMm: number, components: SceneComponent[]): SceneComponent | null {
  const component = COMPONENT_FACTORIES[kind](xMm)

  const left = getLeftXMm(component)
  const right = getRightXMm(component)
  const isFree =
    component.kind === 'placeholder'
      ? isXRangeFreeOfLenses(components, left, right)
      : isXRangeFreeOfPlaceholders(components, left, right)

  return isFree ? component : null
}
