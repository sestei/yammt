import { recoverNullRoc } from './rocRecovery'
import type { SceneDocument } from './types'

export const CURRENT_SCHEMA_VERSION = 1

// JSON has no representation for Infinity (a flat lens surface's radius of
// curvature) -- JSON.stringify silently turns it into `null`, which would
// come back as `null` (not Infinity) on load and poison the optics/geometry
// math with NaN. Round-trip it through sentinel strings instead.
const INFINITY_SENTINEL = '__Infinity__'
const NEG_INFINITY_SENTINEL = '__-Infinity__'

function replacer(_key: string, value: unknown): unknown {
  if (value === Infinity) return INFINITY_SENTINEL
  if (value === -Infinity) return NEG_INFINITY_SENTINEL
  return value
}

function reviver(_key: string, value: unknown): unknown {
  if (value === INFINITY_SENTINEL) return Infinity
  if (value === NEG_INFINITY_SENTINEL) return -Infinity
  return value
}

export function serializeScene(doc: SceneDocument): string {
  return JSON.stringify(doc, replacer, 2)
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid scene file: ${message}`)
}

// Additive field: older save files predate per-component disable and simply
// don't have it. Doesn't apply to analyzers (readout only, never disableable).
function withDefaultDisabled(entry: Record<string, unknown>): Record<string, unknown> {
  if (entry.kind === 'analyzer') return entry
  return { disabled: false, ...entry }
}

/**
 * Structural validation only (not full deep schema checking) -- enough to fail
 * clearly on a corrupt or unrelated JSON file rather than silently producing a
 * broken store state.
 */
function migrateScene(raw: unknown): SceneDocument {
  assert(typeof raw === 'object' && raw !== null, 'not a JSON object')
  const doc = raw as Record<string, unknown>

  assert('schemaVersion' in doc, 'missing schemaVersion')
  switch (doc.schemaVersion) {
    case 1: {
      assert(typeof doc.beam === 'object' && doc.beam !== null, 'missing or invalid "beam"')
      assert(Array.isArray(doc.components), 'missing or invalid "components"')
      assert(typeof doc.viewport === 'object' && doc.viewport !== null, 'missing or invalid "viewport"')
      // Additive field: older save files predate the lens database and simply don't have it.
      const lensDatabase = 'lensDatabase' in doc ? doc.lensDatabase : []
      assert(Array.isArray(lensDatabase), 'invalid "lensDatabase"')
      const components = (doc.components as unknown[]).map((c) =>
        withDefaultDisabled(recoverNullRoc(c as Record<string, unknown>)),
      )
      const recoveredLensDatabase = lensDatabase.map((e) => recoverNullRoc(e as Record<string, unknown>))
      return { ...doc, components, lensDatabase: recoveredLensDatabase } as unknown as SceneDocument
    }
    default:
      throw new Error(`Invalid scene file: unsupported schemaVersion "${String(doc.schemaVersion)}"`)
  }
}

export function deserializeScene(json: string): SceneDocument {
  const raw = JSON.parse(json, reviver)
  return migrateScene(raw)
}
