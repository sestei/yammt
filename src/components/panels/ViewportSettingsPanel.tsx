import type { ChangeEvent } from 'react'
import type { HoleSpacing, LengthUnit, Viewport } from '../../lib/scene/types'
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

  function onSecondaryAxisChange(e: ChangeEvent<HTMLSelectElement>) {
    setViewport({ secondaryAxis: e.target.value as Viewport['secondaryAxis'] })
  }

  return (
    <Panel title="View" className="viewport-settings-panel" defaultCollapsed>
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
      <label>
        Secondary y-axis
        <select value={viewport.secondaryAxis} onChange={onSecondaryAxisChange}>
          <option value="none">None</option>
          <option value="gouy-phase">Gouy phase</option>
          <option value="curvature">Wavefront curvature</option>
        </select>
      </label>
    </Panel>
  )
}
