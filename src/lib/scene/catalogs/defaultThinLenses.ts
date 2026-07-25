import { nextId } from '../factory'
import type { LensDatabaseEntry } from '../types'
import type { LensCatalog } from './catalog'

const SEED_FOCAL_LENGTHS_MM = [50, 100, 250, 500, -50, -100, -250, -500]

const entries: LensDatabaseEntry[] = SEED_FOCAL_LENGTHS_MM.map((focalLengthMm) => ({
  id: nextId(),
  name: `f=${focalLengthMm}mm`,
  kind: 'thin-lens',
  diameterMm: 25,
  focalLengthMm,
}))

export const DEFAULT_THIN_LENSES_CATALOG: LensCatalog = {
  id: 'default-thin-lenses',
  name: 'Default thin lenses',
  entries,
}
