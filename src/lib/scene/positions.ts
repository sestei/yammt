import type { SceneComponent } from './types'

/** The leftmost x position of a component, used for sorting/collision checks. */
export function getLeftXMm(c: SceneComponent): number {
  return c.kind === 'placeholder' ? c.xStartMm : c.xMm
}

/** The rightmost x position of a component's footprint. */
export function getRightXMm(c: SceneComponent): number {
  if (c.kind === 'placeholder') return c.xEndMm
  if (c.kind === 'thick-lens') return c.xMm + c.centerThicknessMm
  return c.xMm
}

/** Shifts a component's position(s) by deltaMm, preserving its shape/width. */
export function shiftXMm(c: SceneComponent, deltaMm: number): SceneComponent {
  if (c.kind === 'placeholder') {
    return { ...c, xStartMm: c.xStartMm + deltaMm, xEndMm: c.xEndMm + deltaMm }
  }
  return { ...c, xMm: c.xMm + deltaMm }
}

/** Sets a component's leading-edge position directly (drag-to-position). */
export function withLeftXMm(c: SceneComponent, xMm: number): SceneComponent {
  return shiftXMm(c, xMm - getLeftXMm(c))
}
