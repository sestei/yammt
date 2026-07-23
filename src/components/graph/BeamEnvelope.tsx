import type { BeamStateAtZ } from '../../lib/optics/propagate'
import type { Scales } from './scales'

// Painted outer-to-inner so the 1-sigma band ends up on top, giving a
// naturally denser/brighter core with fainter rings toward the edge.
const SIGMA_LEVELS = [3, 2, 1] as const

/**
 * beamRadiusMm is the 1/e^2 intensity radius w(z); by convention w = 2*sigma
 * for a Gaussian, so the n-sigma envelope radius is n * w / 2.
 */
function sigmaRadiusMm(radiusMm: number, sigmaLevel: number): number {
  return (sigmaLevel * radiusMm) / 2
}

/** Closed path tracing the +sigma boundary forward, then the -sigma boundary back. */
function bandPath(profile: BeamStateAtZ[], scales: Scales, sigmaLevel: number): string {
  const top = profile.map((s) => [scales.xToSvg(s.zMm), scales.yToSvg(sigmaRadiusMm(s.radiusMm, sigmaLevel))])
  const bottom = profile.map((s) => [scales.xToSvg(s.zMm), scales.yToSvg(-sigmaRadiusMm(s.radiusMm, sigmaLevel))])

  const forward = top.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const backward = bottom
    .slice()
    .reverse()
    .map(([x, y]) => `L${x},${y}`)
    .join(' ')

  return `${forward} ${backward} Z`
}

export function BeamEnvelope({ profile, scales }: { profile: BeamStateAtZ[]; scales: Scales }) {
  if (profile.length === 0) return null

  return (
    <g className="beam-envelope">
      {SIGMA_LEVELS.map((level) => (
        <path key={level} className={`sigma-${level} band`} d={bandPath(profile, scales, level)} />
      ))}
      <line
        className="optical-axis"
        x1={scales.xToSvg(profile[0].zMm)}
        y1={scales.yToSvg(0)}
        x2={scales.xToSvg(profile[profile.length - 1].zMm)}
        y2={scales.yToSvg(0)}
      />
    </g>
  )
}
