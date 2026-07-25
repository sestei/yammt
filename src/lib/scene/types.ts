import type { GaussianBeam } from '../optics/beam'

export type ComponentId = string

/** 0 = ungrouped */
export type GroupId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

interface ComponentBase {
  id: ComponentId
  label: string
  locked: boolean
  group: GroupId
}

export interface ThinLens extends ComponentBase {
  kind: 'thin-lens'
  xMm: number
  diameterMm: number
  focalLengthMm: number
  /** Temporarily excluded from raytracing and collision checks, but kept in place. */
  disabled: boolean
}

export interface ThickLens extends ComponentBase {
  kind: 'thick-lens'
  /** Position of the left (first) surface; right surface is xMm + centerThicknessMm. */
  xMm: number
  refractiveIndex: number
  leftRocMm: number
  rightRocMm: number
  diameterMm: number
  centerThicknessMm: number
  /** Temporarily excluded from raytracing and collision checks, but kept in place. */
  disabled: boolean
}

export interface BeamAnalyzer extends ComponentBase {
  kind: 'analyzer'
  xMm: number
}

export interface Placeholder extends ComponentBase {
  kind: 'placeholder'
  xStartMm: number
  xEndMm: number
  /** Temporarily excluded from collision checks, but kept in place. */
  disabled: boolean
}

export type SceneComponent = ThinLens | ThickLens | BeamAnalyzer | Placeholder

interface LensDatabaseEntryBase {
  id: string
  name: string
}

export interface ThinLensDatabaseEntry extends LensDatabaseEntryBase {
  kind: 'thin-lens'
  diameterMm: number
  focalLengthMm: number
}

export interface ThickLensDatabaseEntry extends LensDatabaseEntryBase {
  kind: 'thick-lens'
  refractiveIndex: number
  leftRocMm: number
  rightRocMm: number
  diameterMm: number
  centerThicknessMm: number
}

export type LensDatabaseEntry = ThinLensDatabaseEntry | ThickLensDatabaseEntry

export type LengthUnit = 'mm' | 'cm' | 'm' | 'holes'
export type HoleSpacing = '1inch' | '25mm'

export interface Viewport {
  xUnit: LengthUnit
  holeSpacing: HoleSpacing
  xMinMm: number
  xMaxMm: number
  /** Fixed y-axis reference range (mm); the displayed range is baseYMaxMm * yZoom. Not autoscaled. */
  baseYMaxMm: number
  yZoom: number
  secondaryAxis: 'none' | 'gouy-phase' | 'curvature'
}

export interface SceneDocument {
  schemaVersion: 1
  beam: GaussianBeam
  components: SceneComponent[]
  viewport: Viewport
  lensDatabase: LensDatabaseEntry[]
}
