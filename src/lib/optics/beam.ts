import type { ABCD } from './abcd'

export interface GaussianBeam {
  wavelengthNm: number
  waistUm: number
  waistZMm: number
}

/** Complex beam parameter q, real/imaginary parts in mm. */
export interface ComplexQ {
  re: number
  im: number
}

export function wavelengthMm(beam: GaussianBeam): number {
  return beam.wavelengthNm * 1e-6
}

export function waistMm(beam: GaussianBeam): number {
  return beam.waistUm * 1e-3
}

export function rayleighRangeMm(beam: GaussianBeam): number {
  const w0 = waistMm(beam)
  return (Math.PI * w0 * w0) / wavelengthMm(beam)
}

export function qAtWaist(beam: GaussianBeam): ComplexQ {
  return { re: 0, im: rayleighRangeMm(beam) }
}

/** q at position z, assuming free-space propagation from the beam's waist. */
export function qAtZ(beam: GaussianBeam, zMm: number): ComplexQ {
  const zR = rayleighRangeMm(beam)
  return { re: zMm - beam.waistZMm, im: zR }
}

export function addComplex(a: ComplexQ, b: ComplexQ): ComplexQ {
  return { re: a.re + b.re, im: a.im + b.im }
}

export function reciprocalComplex(q: ComplexQ): ComplexQ {
  const denom = q.re * q.re + q.im * q.im
  return { re: q.re / denom, im: -q.im / denom }
}

/** q' = (A*q + B) / (C*q + D) */
export function applyABCD(q: ComplexQ, m: ABCD): ComplexQ {
  const numerator: ComplexQ = { re: m.A * q.re + m.B, im: m.A * q.im }
  const denominator: ComplexQ = { re: m.C * q.re + m.D, im: m.C * q.im }
  const invDenom = reciprocalComplex(denominator)
  return {
    re: numerator.re * invDenom.re - numerator.im * invDenom.im,
    im: numerator.re * invDenom.im + numerator.im * invDenom.re,
  }
}
