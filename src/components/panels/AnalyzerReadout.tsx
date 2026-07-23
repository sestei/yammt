import { autoYUnit, mmToDisplayY } from '../../lib/units/length'
import { beamStateAt, buildElementList } from '../../lib/optics/propagate'
import type { BeamAnalyzer } from '../../lib/scene/types'
import { useSceneStore } from '../../state/sceneStore'

function formatMm(value: number, digits = 3): string {
  return Number.isFinite(value) ? value.toFixed(digits) : '∞'
}

export function AnalyzerReadout({ component }: { component: BeamAnalyzer }) {
  const beam = useSceneStore((s) => s.beam)
  const components = useSceneStore((s) => s.components)

  const elements = buildElementList(components)
  const state = beamStateAt(beam, elements, component.xMm)

  const diameterMm = 2 * state.radiusMm
  const diameterUnit = autoYUnit(state.radiusMm)
  const gouyDeg = (state.gouyPhaseRad * 180) / Math.PI

  return (
    <div className="analyzer-readout">
      <div className="readout-row">
        <span className="readout-label">Beam radius (1σ)</span>
        <span>
          {mmToDisplayY(state.radiusMm, diameterUnit).toFixed(diameterUnit === 'um' ? 1 : 3)} {diameterUnit}
        </span>
      </div>
      <div className="readout-row">
        <span className="readout-label">Beam diameter</span>
        <span>
          {mmToDisplayY(diameterMm, diameterUnit).toFixed(diameterUnit === 'um' ? 1 : 3)} {diameterUnit}
        </span>
      </div>
      <div className="readout-row">
        <span className="readout-label">Gouy phase</span>
        <span>{gouyDeg.toFixed(1)}°</span>
      </div>
      <div className="readout-row">
        <span className="readout-label">Wavefront R</span>
        <span>{formatMm(state.curvatureRadiusMm)} mm</span>
      </div>
      <div className="readout-row">
        <span className="readout-label">q</span>
        <span>
          {formatMm(state.q.re)} + {formatMm(state.q.im)}i mm
        </span>
      </div>
      <div className="readout-row">
        <span className="readout-label">Rayleigh range</span>
        <span>{formatMm(state.q.im)} mm</span>
      </div>
      <div className="readout-row">
        <span className="readout-label">Distance to waist</span>
        <span>{formatMm(state.q.re)} mm</span>
      </div>
    </div>
  )
}
