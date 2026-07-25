import { surfaceSagMm } from '../../optics/thickLensGeometry'
import { nextId } from '../factory'
import { recoverNullRoc } from '../rocRecovery'
import type { LensDatabaseEntry } from '../types'

export interface LensCatalog {
  id: string
  name: string
  entries: LensDatabaseEntry[]
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid lens catalogue "${message}"`)
}

/**
 * Some vendor data gives edge thickness (the physically measured quantity)
 * rather than center thickness (what the app's optics/geometry model uses).
 * Derived once here from the surface sags so only centerThicknessMm ever
 * needs to flow through the rest of the app -- edgeThicknessMm - rightSag +
 * leftSag is the inverse of thickLensGeometry.ts's own
 * `edgeThicknessMm = centerThicknessMm + rightSag - leftSag`.
 */
function centerThicknessFromEdge(entry: Record<string, unknown>, label: string): number {
  const { diameterMm, leftRocMm, rightRocMm, edgeThicknessMm } = entry
  assert(typeof diameterMm === 'number', `${label}: invalid "diameterMm"`)
  assert(typeof leftRocMm === 'number', `${label}: invalid "leftRocMm"`)
  assert(typeof rightRocMm === 'number', `${label}: invalid "rightRocMm"`)
  assert(typeof edgeThicknessMm === 'number', `${label}: invalid "edgeThicknessMm"`)
  const halfApertureMm = diameterMm / 2
  const leftSag = surfaceSagMm(leftRocMm, halfApertureMm) ?? 0
  const rightSag = surfaceSagMm(rightRocMm, halfApertureMm) ?? 0
  return edgeThicknessMm - rightSag + leftSag
}

/**
 * Parses a bundled catalogue JSON file (shaped like a scene file's
 * `lensDatabase` entries, tolerating a literal `null` ROC for a flat
 * surface). Structural validation only -- these files are build-time
 * bundled, so a thrown error here is a development-time bug, not something
 * a user can trigger.
 */
export function parseLensCatalog(id: string, name: string, raw: unknown): LensCatalog {
  assert(Array.isArray(raw), `${name}: not an array`)
  const entries = raw.map((rawEntry, index) => {
    assert(typeof rawEntry === 'object' && rawEntry !== null, `${name}[${index}]: not an object`)
    let entry = recoverNullRoc(rawEntry as Record<string, unknown>)
    assert(entry.kind === 'thin-lens' || entry.kind === 'thick-lens', `${name}[${index}]: invalid "kind"`)
    assert(typeof entry.name === 'string', `${name}[${index}]: invalid "name"`)
    if (entry.kind === 'thick-lens' && entry.centerThicknessMm === undefined && entry.edgeThicknessMm !== undefined) {
      const { edgeThicknessMm: _edgeThicknessMm, ...rest } = entry
      entry = { ...rest, centerThicknessMm: centerThicknessFromEdge(entry, `${name}[${index}]`) }
    }
    // Fresh id every load -- catalogue entries aren't persisted, so any id
    // present in the source JSON is irrelevant and discarded.
    return { ...entry, id: nextId() } as unknown as LensDatabaseEntry
  })
  return { id, name, entries }
}

export function filterCatalogEntries(entries: LensDatabaseEntry[], query: string): LensDatabaseEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return entries
  return entries.filter((e) => e.name.toLowerCase().includes(q))
}
