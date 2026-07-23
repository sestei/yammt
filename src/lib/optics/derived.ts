import type { ComplexQ } from './beam'

/** 1/q = 1/R - i*wavelength/(pi*w^2); returns w (1/e^2 intensity radius, mm). */
export function beamRadiusMm(q: ComplexQ, wavelengthMm: number): number {
  const denom = q.re * q.re + q.im * q.im
  const imInvQ = -q.im / denom
  return Math.sqrt(-wavelengthMm / (Math.PI * imInvQ))
}

/** Wavefront radius of curvature R(z) = 1/Re(1/q). Infinity at the waist. */
export function wavefrontRadiusOfCurvatureMm(q: ComplexQ): number {
  const denom = q.re * q.re + q.im * q.im
  const reInvQ = q.re / denom
  return 1 / reInvQ
}

/** Local Gouy phase, treating the current q as z' + i*zR of an equivalent free beam. */
export function gouyPhaseRad(q: ComplexQ): number {
  return Math.atan2(q.re, q.im)
}
