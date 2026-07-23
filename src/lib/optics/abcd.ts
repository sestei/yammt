export interface ABCD {
  A: number
  B: number
  C: number
  D: number
}

export const identity: ABCD = { A: 1, B: 0, C: 0, D: 1 }

/** Composes m2 * m1, i.e. a beam encounters m1 first, then m2. */
export function multiplyABCD(m2: ABCD, m1: ABCD): ABCD {
  return {
    A: m2.A * m1.A + m2.B * m1.C,
    B: m2.A * m1.B + m2.B * m1.D,
    C: m2.C * m1.A + m2.D * m1.C,
    D: m2.C * m1.B + m2.D * m1.D,
  }
}

export function freeSpace(distanceMm: number): ABCD {
  return { A: 1, B: distanceMm, C: 0, D: 1 }
}

export function thinLensMatrix(focalLengthMm: number): ABCD {
  return { A: 1, B: 0, C: -1 / focalLengthMm, D: 1 }
}

/** Refraction at a single spherical surface, going from index n1 into n2. */
export function refractionMatrix(n1: number, n2: number, radiusMm: number): ABCD {
  return { A: 1, B: 0, C: (n1 - n2) / (n2 * radiusMm), D: n1 / n2 }
}

export interface ThickLensParams {
  n: number
  r1Mm: number
  r2Mm: number
  thicknessMm: number
}

/**
 * Left surface (air -> glass, R1) then translation through the glass, then
 * right surface (glass -> air, R2). Composed left-to-right along beam travel.
 * In this standard (non-reduced, actual-angle) convention paired with
 * refractionMatrix's n1,n2-asymmetric form, translation uses B=d (physical
 * distance) regardless of medium -- the index-dependence lives in the
 * refraction matrices and in which wavelength is used to interpret q as a
 * physical radius while inside that medium (handled in propagate.ts).
 */
export function thickLensMatrix({ n, r1Mm, r2Mm, thicknessMm }: ThickLensParams): ABCD {
  const surface1 = refractionMatrix(1, n, r1Mm)
  const travel = freeSpace(thicknessMm)
  const surface2 = refractionMatrix(n, 1, r2Mm)
  return multiplyABCD(surface2, multiplyABCD(travel, surface1))
}
