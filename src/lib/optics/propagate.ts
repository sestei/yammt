import { freeSpace, refractionMatrix, thinLensMatrix, type ABCD } from './abcd'
import { applyABCD, qAtZ, wavelengthMm, type ComplexQ, type GaussianBeam } from './beam'
import { beamRadiusMm, gouyPhaseRad, wavefrontRadiusOfCurvatureMm } from './derived'
import type { SceneComponent } from '../scene/types'

export interface OpticalElement {
  id: string
  xMm: number
  matrix: ABCD
  /**
   * Refractive index of the medium after this element (defaults to 1/air).
   * Translation matrices use the physical distance regardless of medium (see
   * abcd.ts), but converting q to a physical radius/curvature requires the
   * *local* wavelength (vacuum wavelength / this index), which is why the
   * sampling loops below track it alongside q.
   */
  exitIndex?: number
}

/**
 * Matrix-affecting elements only (thin/thick lenses), sorted left-to-right.
 * A thick lens becomes two separate elements (one per surface) rather than a
 * single combined matrix at its left surface: the free-space step the sampling
 * loop already takes between elements naturally represents propagation through
 * the substrate, so the beam profile shows refraction distinctly at each surface
 * instead of one collapsed kink. Ties broken by id for a stable, deterministic order.
 */
export function buildElementList(components: SceneComponent[]): OpticalElement[] {
  const elements: OpticalElement[] = []
  for (const c of components) {
    if (c.kind === 'thin-lens') {
      if (c.disabled) continue
      elements.push({ id: c.id, xMm: c.xMm, matrix: thinLensMatrix(c.focalLengthMm) })
    } else if (c.kind === 'thick-lens') {
      if (c.disabled) continue
      elements.push({
        id: `${c.id}:1`,
        xMm: c.xMm,
        matrix: refractionMatrix(1, c.refractiveIndex, c.leftRocMm),
        exitIndex: c.refractiveIndex,
      })
      elements.push({
        id: `${c.id}:2`,
        xMm: c.xMm + c.centerThicknessMm,
        matrix: refractionMatrix(c.refractiveIndex, 1, c.rightRocMm),
        exitIndex: 1,
      })
    }
  }
  return elements.sort((a, b) => a.xMm - b.xMm || a.id.localeCompare(b.id))
}

export interface BeamStateAtZ {
  zMm: number
  q: ComplexQ
  radiusMm: number
  gouyPhaseRad: number
  curvatureRadiusMm: number
}

function toBeamState(zMm: number, q: ComplexQ, localLambdaMm: number): BeamStateAtZ {
  return {
    zMm,
    q,
    radiusMm: beamRadiusMm(q, localLambdaMm),
    gouyPhaseRad: gouyPhaseRad(q),
    curvatureRadiusMm: wavefrontRadiusOfCurvatureMm(q),
  }
}

/**
 * Propagates q from the beam's true waist up to (and including) zMm,
 * applying every element's matrix in order. Elements at exactly zMm are applied
 * (a beam analyzer/observation point sits after any lens at the same position).
 * Returns the medium index active at zMm too, since the caller needs it to pick
 * the correct local wavelength for interpreting q as a physical radius.
 */
function propagateToZ(
  beam: GaussianBeam,
  elements: OpticalElement[],
  zMm: number,
): { q: ComplexQ; mediumIndex: number } {
  let cursorZ = beam.waistZMm
  let q = qAtZ(beam, cursorZ)
  let mediumIndex = 1

  for (const el of elements) {
    if (el.xMm > zMm) break
    q = applyABCD(q, freeSpace(el.xMm - cursorZ))
    q = applyABCD(q, el.matrix)
    cursorZ = el.xMm
    mediumIndex = el.exitIndex ?? 1
  }

  q = applyABCD(q, freeSpace(zMm - cursorZ))
  return { q, mediumIndex }
}

export function beamStateAt(beam: GaussianBeam, elements: OpticalElement[], zMm: number): BeamStateAtZ {
  const { q, mediumIndex } = propagateToZ(beam, elements, zMm)
  return toBeamState(zMm, q, wavelengthMm(beam) / mediumIndex)
}

/**
 * The resulting Gaussian beam after passing through every element (i.e. as
 * observed beyond the rightmost component). Same wavelength; waist size and
 * position are re-derived from q at that point.
 */
export function computeOutputBeam(beam: GaussianBeam, elements: OpticalElement[]): GaussianBeam {
  if (elements.length === 0) return beam

  const lastElement = elements.reduce((a, b) => (b.xMm > a.xMm ? b : a))
  const { q, mediumIndex } = propagateToZ(beam, elements, lastElement.xMm)
  const localLambdaMm = wavelengthMm(beam) / mediumIndex

  const waistZMm = lastElement.xMm - q.re
  const zRMm = q.im
  const waistMm = Math.sqrt((zRMm * localLambdaMm) / Math.PI)

  return {
    wavelengthNm: beam.wavelengthNm,
    waistUm: waistMm * 1000,
    waistZMm,
  }
}

export function sampleBeamProfile(
  beam: GaussianBeam,
  elements: OpticalElement[],
  xMinMm: number,
  xMaxMm: number,
  sampleCount: number,
): BeamStateAtZ[] {
  if (sampleCount < 2) {
    return [beamStateAt(beam, elements, xMinMm)]
  }

  const vacuumLambdaMm = wavelengthMm(beam)
  const relevantElements = elements.filter((el) => el.xMm <= xMaxMm)

  const step = (xMaxMm - xMinMm) / (sampleCount - 1)
  const results: BeamStateAtZ[] = []

  let cursorZ = beam.waistZMm
  let q = qAtZ(beam, cursorZ)
  let mediumIndex = 1
  let elementIndex = 0

  // Advance q through every element that lies before the first sample point.
  while (elementIndex < relevantElements.length && relevantElements[elementIndex].xMm <= xMinMm) {
    const el = relevantElements[elementIndex]
    q = applyABCD(q, freeSpace(el.xMm - cursorZ))
    q = applyABCD(q, el.matrix)
    cursorZ = el.xMm
    mediumIndex = el.exitIndex ?? 1
    elementIndex += 1
  }

  for (let i = 0; i < sampleCount; i += 1) {
    const targetZ = xMinMm + i * step

    while (elementIndex < relevantElements.length && relevantElements[elementIndex].xMm <= targetZ) {
      const el = relevantElements[elementIndex]
      q = applyABCD(q, freeSpace(el.xMm - cursorZ))
      q = applyABCD(q, el.matrix)
      cursorZ = el.xMm
      mediumIndex = el.exitIndex ?? 1
      elementIndex += 1
    }

    const sampleQ = applyABCD(q, freeSpace(targetZ - cursorZ))
    results.push(toBeamState(targetZ, sampleQ, vacuumLambdaMm / mediumIndex))
  }

  return results
}
