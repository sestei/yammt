import type { BeamAnalyzer, LensDatabaseEntry, Placeholder, SceneComponent, ThickLens, ThinLens } from './types'

const DEFAULT_PLACEHOLDER_WIDTH_MM = 10

let fallbackCounter = 0

function nextId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  fallbackCounter += 1
  return `component-${fallbackCounter}`
}

interface ThinLensShape {
  diameterMm: number
  focalLengthMm: number
}

interface ThickLensShape {
  refractiveIndex: number
  leftRocMm: number
  rightRocMm: number
  diameterMm: number
  centerThicknessMm: number
}

const DEFAULT_THIN_LENS_SHAPE: ThinLensShape = { diameterMm: 25.4, focalLengthMm: 100 }

const DEFAULT_THICK_LENS_SHAPE: ThickLensShape = {
  refractiveIndex: 1.5,
  leftRocMm: 50,
  rightRocMm: -50,
  diameterMm: 25.4,
  centerThicknessMm: 5,
}

export function createThinLens(xMm: number, shape: ThinLensShape = DEFAULT_THIN_LENS_SHAPE): ThinLens {
  return {
    id: nextId(),
    kind: 'thin-lens',
    label: 'Lens',
    locked: false,
    group: 0,
    xMm,
    ...shape,
  }
}

export function createThickLens(xMm: number, shape: ThickLensShape = DEFAULT_THICK_LENS_SHAPE): ThickLens {
  return {
    id: nextId(),
    kind: 'thick-lens',
    label: 'Thick Lens',
    locked: false,
    group: 0,
    xMm,
    ...shape,
  }
}

export function createAnalyzer(xMm: number): BeamAnalyzer {
  return {
    id: nextId(),
    kind: 'analyzer',
    label: 'Analyzer',
    locked: false,
    group: 0,
    xMm,
  }
}

export function createPlaceholder(xMm: number): Placeholder {
  return {
    id: nextId(),
    kind: 'placeholder',
    label: 'Placeholder',
    locked: false,
    group: 0,
    xStartMm: xMm - DEFAULT_PLACEHOLDER_WIDTH_MM / 2,
    xEndMm: xMm + DEFAULT_PLACEHOLDER_WIDTH_MM / 2,
  }
}

export function createLensDatabaseEntry(kind: 'thin-lens' | 'thick-lens'): LensDatabaseEntry {
  if (kind === 'thin-lens') {
    return { id: nextId(), name: 'New thin lens', kind: 'thin-lens', ...DEFAULT_THIN_LENS_SHAPE }
  }
  return { id: nextId(), name: 'New thick lens', kind: 'thick-lens', ...DEFAULT_THICK_LENS_SHAPE }
}

/** Builds a fresh, independent graph component from a database entry's shape — no ongoing link to the entry. */
export function instantiateFromDatabaseEntry(entry: LensDatabaseEntry, xMm: number): SceneComponent {
  if (entry.kind === 'thin-lens') {
    return {
      ...createThinLens(xMm, { diameterMm: entry.diameterMm, focalLengthMm: entry.focalLengthMm }),
      label: entry.name,
    }
  }
  return {
    ...createThickLens(xMm, {
      refractiveIndex: entry.refractiveIndex,
      leftRocMm: entry.leftRocMm,
      rightRocMm: entry.rightRocMm,
      diameterMm: entry.diameterMm,
      centerThicknessMm: entry.centerThicknessMm,
    }),
    label: entry.name,
  }
}

const SEED_FOCAL_LENGTHS_MM = [50, 100, 250, 500, -50, -100, -250, -500]

export const DEFAULT_LENS_DATABASE: LensDatabaseEntry[] = SEED_FOCAL_LENGTHS_MM.map((focalLengthMm) => ({
  id: nextId(),
  name: `f=${focalLengthMm}mm`,
  kind: 'thin-lens',
  diameterMm: 25,
  focalLengthMm,
}))
