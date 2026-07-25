import type { BeamAnalyzer, LensDatabaseEntry, Placeholder, SceneComponent, ThickLens, ThinLens } from './types'

const DEFAULT_PLACEHOLDER_WIDTH_MM = 10

let fallbackCounter = 0

export function nextId(): string {
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
    disabled: false,
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
    disabled: false,
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
    disabled: false,
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

/** Inverse of instantiateFromDatabaseEntry -- captures a graph lens's shape as a new, independent database entry. */
export function createDatabaseEntryFromLens(lens: ThinLens | ThickLens): LensDatabaseEntry {
  if (lens.kind === 'thin-lens') {
    return { id: nextId(), name: lens.label, kind: 'thin-lens', diameterMm: lens.diameterMm, focalLengthMm: lens.focalLengthMm }
  }
  return {
    id: nextId(),
    name: lens.label,
    kind: 'thick-lens',
    refractiveIndex: lens.refractiveIndex,
    leftRocMm: lens.leftRocMm,
    rightRocMm: lens.rightRocMm,
    diameterMm: lens.diameterMm,
    centerThicknessMm: lens.centerThicknessMm,
  }
}
