import { createAnalyzer, createPlaceholder, createThickLens, createThinLens, instantiateFromDatabaseEntry } from './factory'
import { isXRangeFreeOfLenses, isXRangeFreeOfPlaceholders } from './placeholderCollision'
import { getLeftXMm, getRightXMm } from './positions'
import type { LensDatabaseEntry, SceneComponent } from './types'

export type PaletteComponentKind = 'thin-lens' | 'thick-lens' | 'analyzer' | 'placeholder'

const NEW_COMPONENT_GAP_MM = 50

/** Where a newly added component should land: just past the rightmost existing one, or 0 if the graph is empty. */
export function nextPlacementXMm(components: SceneComponent[]): number {
  if (components.length === 0) return 0
  return Math.max(...components.map(getRightXMm)) + NEW_COMPONENT_GAP_MM
}

const COMPONENT_FACTORIES: Record<PaletteComponentKind, (xMm: number) => SceneComponent> = {
  'thin-lens': createThinLens,
  'thick-lens': createThickLens,
  analyzer: createAnalyzer,
  placeholder: createPlaceholder,
}

export function isPaletteComponentKind(kind: string): kind is PaletteComponentKind {
  return kind in COMPONENT_FACTORIES
}

function isPlacementFree(component: SceneComponent, components: SceneComponent[]): boolean {
  // Analyzers are just a readout, not a physical component, so they're exempt
  // from placeholder collision entirely.
  if (component.kind === 'analyzer') return true

  const left = getLeftXMm(component)
  const right = getRightXMm(component)
  return component.kind === 'placeholder'
    ? isXRangeFreeOfLenses(components, left, right)
    : isXRangeFreeOfPlaceholders(components, left, right)
}

/** Builds a component of `kind` at `xMm`, validated against collision rules. Returns null if occupied. */
export function buildComponentAt(kind: PaletteComponentKind, xMm: number, components: SceneComponent[]): SceneComponent | null {
  const component = COMPONENT_FACTORIES[kind](xMm)
  return isPlacementFree(component, components) ? component : null
}

/** Builds a component from a lens database entry at `xMm`, validated against collision rules. Returns null if occupied. */
export function buildComponentFromDatabaseEntry(
  entry: LensDatabaseEntry,
  xMm: number,
  components: SceneComponent[],
): SceneComponent | null {
  const component = instantiateFromDatabaseEntry(entry, xMm)
  return isPlacementFree(component, components) ? component : null
}
