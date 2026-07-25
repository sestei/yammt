const ROC_FIELDS = ['leftRocMm', 'rightRocMm'] as const

// Recovers thick-lens entries whose flat surface's ROC is a literal `null` --
// either from files saved before Infinity round-tripping was fixed, or from
// bundled catalogue JSON authored by hand/tooling that isn't aware of the
// app's Infinity-sentinel convention. `null` is not a valid ROC and would
// otherwise poison the optics/geometry math with NaN.
export function recoverNullRoc(entry: Record<string, unknown>): Record<string, unknown> {
  if (entry.kind !== 'thick-lens') return entry
  const fixed = { ...entry }
  for (const field of ROC_FIELDS) {
    if (fixed[field] === null) fixed[field] = Infinity
  }
  return fixed
}
