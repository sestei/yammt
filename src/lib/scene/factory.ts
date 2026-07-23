import type { BeamAnalyzer, Placeholder, ThickLens, ThinLens } from './types'

const DEFAULT_PLACEHOLDER_WIDTH_MM = 10

let fallbackCounter = 0

function nextId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  fallbackCounter += 1
  return `component-${fallbackCounter}`
}

export function createThinLens(xMm: number): ThinLens {
  return {
    id: nextId(),
    kind: 'thin-lens',
    label: 'Lens',
    locked: false,
    group: 0,
    xMm,
    diameterMm: 25,
    focalLengthMm: 100,
  }
}

export function createThickLens(xMm: number): ThickLens {
  return {
    id: nextId(),
    kind: 'thick-lens',
    label: 'Thick Lens',
    locked: false,
    group: 0,
    xMm,
    refractiveIndex: 1.5,
    leftRocMm: 50,
    rightRocMm: -50,
    diameterMm: 25,
    centerThicknessMm: 5,
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
