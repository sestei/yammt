import type { ChangeEvent } from 'react'
import type { HoleSpacing, LengthUnit } from '../../lib/scene/types'
import { Panel } from '../layout/Panel'
import { useSceneStore } from '../../state/sceneStore'

const UNIT_OPTIONS: LengthUnit[] = ['mm', 'cm', 'm', 'holes']

export function ViewportSettingsPanel() {
  const viewport = useSceneStore((s) => s.viewport)
  const setViewport = useSceneStore((s) => s.setViewport)

  function onUnitChange(e: ChangeEvent<HTMLSelectElement>) {
    setViewport({ xUnit: e.target.value as LengthUnit })
  }

  function onHoleSpacingChange(e: ChangeEvent<HTMLSelectElement>) {
    setViewport({ holeSpacing: e.target.value as HoleSpacing })
  }

  return (
    <Panel title="View" className="viewport-settings-panel">
      <label>
        X-axis units
        <select value={viewport.xUnit} onChange={onUnitChange}>
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </label>
      {viewport.xUnit === 'holes' && (
        <label>
          Hole spacing
          <select value={viewport.holeSpacing} onChange={onHoleSpacingChange}>
            <option value="25mm">25 mm</option>
            <option value="1inch">1 inch</option>
          </select>
        </label>
      )}
    </Panel>
  )
}
