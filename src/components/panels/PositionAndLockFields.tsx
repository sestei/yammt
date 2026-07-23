import type { HoleSpacing, LengthUnit } from '../../lib/scene/types'
import { mmToUnit, unitLabel, unitToMm } from '../../lib/units/length'
import { NumberField } from './NumberField'

export function PositionAndLockFields({
  xMm,
  locked,
  xUnit,
  holeSpacing,
  onPositionCommit,
  onLockToggle,
}: {
  xMm: number
  locked: boolean
  xUnit: LengthUnit
  holeSpacing: HoleSpacing
  onPositionCommit: (xMm: number) => void
  onLockToggle: () => void
}) {
  return (
    <>
      <NumberField
        label={`Position (${unitLabel(xUnit, holeSpacing)})`}
        value={mmToUnit(xMm, xUnit, holeSpacing)}
        onCommit={(v) => onPositionCommit(unitToMm(v, xUnit, holeSpacing))}
      />
      <label className="checkbox-label">
        <input type="checkbox" checked={locked} onChange={onLockToggle} />
        Locked
      </label>
    </>
  )
}
