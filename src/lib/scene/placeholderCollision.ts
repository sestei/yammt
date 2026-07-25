import { getLeftXMm, getRightXMm } from './positions'
import type { ComponentId, SceneComponent } from './types'

function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/**
 * True if [xStartMm, xEndMm) does not overlap any placeholder in `components`
 * (excluding `excludeId`, e.g. the placeholder/lens being moved itself).
 */
export function isXRangeFreeOfPlaceholders(
  components: SceneComponent[],
  xStartMm: number,
  xEndMm: number,
  excludeId?: ComponentId,
): boolean {
  return components.every((c) => {
    if (c.kind !== 'placeholder' || c.id === excludeId || c.disabled) return true
    return !rangesOverlap(xStartMm, xEndMm, c.xStartMm, c.xEndMm)
  })
}

/**
 * True if a placeholder spanning [xStartMm, xEndMm) does not overlap any lens
 * (thin or thick) in `components`. Symmetric counterpart to
 * isXRangeFreeOfPlaceholders, used when moving/resizing a placeholder itself.
 */
export function isXRangeFreeOfLenses(
  components: SceneComponent[],
  xStartMm: number,
  xEndMm: number,
  excludeId?: ComponentId,
): boolean {
  return components.every((c) => {
    if ((c.kind !== 'thin-lens' && c.kind !== 'thick-lens') || c.id === excludeId || c.disabled) return true
    return !rangesOverlap(xStartMm, xEndMm, getLeftXMm(c), getRightXMm(c))
  })
}
