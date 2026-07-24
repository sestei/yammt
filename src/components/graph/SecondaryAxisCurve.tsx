import type { SecondaryAxisSpec } from '../../lib/graph/secondaryAxis'
import type { BeamStateAtZ } from '../../lib/optics/propagate'
import type { Scales, SecondaryScale } from './scales'

export function SecondaryAxisCurve({
  profile,
  scales,
  secondaryScale,
  spec,
}: {
  profile: BeamStateAtZ[]
  scales: Scales
  secondaryScale: SecondaryScale
  spec: SecondaryAxisSpec
}) {
  if (profile.length === 0) return null

  const d = profile
    .map((s, i) => `${i === 0 ? 'M' : 'L'}${scales.xToSvg(s.zMm)},${secondaryScale.yToSvg(spec.valueOf(s))}`)
    .join(' ')

  return <path className="secondary-axis-curve" d={d} fill="none" />
}
