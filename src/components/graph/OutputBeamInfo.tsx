import { mmToUnit, unitLabel } from '../../lib/units/length'
import type { HoleSpacing, LengthUnit } from '../../lib/scene/types'
import { useOutputBeam } from '../../state/selectors'

export function OutputBeamInfo({ xUnit, holeSpacing }: { xUnit: LengthUnit; holeSpacing: HoleSpacing }) {
  const outputBeam = useOutputBeam()

  return (
    <div className="output-beam-info">
      <div className="output-beam-info-row">
        <span className="output-beam-info-label">Output waist</span>
        <span>{outputBeam.waistUm.toFixed(1)} µm</span>
      </div>
      <div className="output-beam-info-row">
        <span className="output-beam-info-label">at</span>
        <span>
          {mmToUnit(outputBeam.waistZMm, xUnit, holeSpacing).toFixed(3)} {unitLabel(xUnit, holeSpacing)}
        </span>
      </div>
    </div>
  )
}
