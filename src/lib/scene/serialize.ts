import type { SceneDocument } from './types'

export const CURRENT_SCHEMA_VERSION = 1

export function serializeScene(doc: SceneDocument): string {
  return JSON.stringify(doc, null, 2)
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid scene file: ${message}`)
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
      return { ...doc, lensDatabase } as unknown as SceneDocument
    }
    default:
      throw new Error(`Invalid scene file: unsupported schemaVersion "${String(doc.schemaVersion)}"`)
  }
}

export function deserializeScene(json: string): SceneDocument {
  const raw = JSON.parse(json)
  return migrateScene(raw)
}
