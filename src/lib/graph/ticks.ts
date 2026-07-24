/**
 * Ticks from `min` up to `max`, spaced by `step`. Guards against non-finite/non-positive
 * step and floating-point-precision stalls (step too small to advance `t` at extreme magnitudes).
 */
export function buildTicks(min: number, max: number, step: number, maxTicks = 500): number[] {
  if (!Number.isFinite(step) || step <= 0) return []
  const ticks: number[] = []
  let t = Math.ceil(min / step) * step
  while (t <= max && ticks.length < maxTicks) {
    ticks.push(t)
    const next = t + step
    if (next <= t) break
    t = next
  }
  return ticks
}

/**
 * Formats a tick value with just enough decimals to distinguish it from its neighbors,
 * given the spacing between ticks (in the same unit as `value`).
 */
export function formatTickValue(value: number, stepInUnit: number): string {
  if (!Number.isFinite(stepInUnit) || stepInUnit <= 0) return value.toFixed(2)
  const decimals = Math.min(6, Math.max(0, Math.ceil(-Math.log10(stepInUnit))))
  return value.toFixed(decimals)
}
