import type { ChangeEvent } from 'react'
import { checkThickLensGeometry } from '../../lib/optics/thickLensGeometry'
import { isXRangeFreeOfLenses } from '../../lib/scene/placeholderCollision'
import { mmToUnit, unitLabel, unitToMm } from '../../lib/units/length'
import { useSelectedComponent } from '../../state/selectors'
import { useSceneStore } from '../../state/sceneStore'
import { AnalyzerReadout } from './AnalyzerReadout'
import { GroupSelector } from './GroupSelector'
import { NumberField } from './NumberField'
import { PositionAndLockFields } from './PositionAndLockFields'
import { RocField } from './RocField'

export function PropertiesPanel() {
  const selected = useSelectedComponent()
  const components = useSceneStore((s) => s.components)
  const xUnit = useSceneStore((s) => s.viewport.xUnit)
  const holeSpacing = useSceneStore((s) => s.viewport.holeSpacing)
  const updateComponent = useSceneStore((s) => s.updateComponent)
  const toggleLock = useSceneStore((s) => s.toggleLock)
  const setGroup = useSceneStore((s) => s.setGroup)
  const removeComponent = useSceneStore((s) => s.removeComponent)

  if (!selected) {
    return (
      <section className="panel properties-panel">
        <h2>Properties</h2>
        <p className="empty-state">No component selected</p>
      </section>
    )
  }

  return (
    <section className="panel properties-panel">
      <div className="panel-header">
        <h2>Properties</h2>
        <button
          type="button"
          className="icon-button"
          title="Delete component"
          aria-label="Delete component"
          onClick={() => removeComponent(selected.id)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path
              d="M3 4h10M6.5 4V2.5h3V4M4.5 4l.5 9.5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1L11.5 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <label>
        Label
        <input
          type="text"
          value={selected.label}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateComponent(selected.id, { label: e.target.value })}
        />
      </label>

      {(selected.kind === 'thin-lens' || selected.kind === 'thick-lens' || selected.kind === 'analyzer') && (
        <PositionAndLockFields
          xMm={selected.xMm}
          locked={selected.locked}
          xUnit={xUnit}
          holeSpacing={holeSpacing}
          onPositionCommit={(xMm) => updateComponent(selected.id, { xMm })}
          onLockToggle={() => toggleLock(selected.id)}
        />
      )}

      {selected.kind === 'thin-lens' && (
        <>
          <NumberField
            label="Diameter (mm)"
            value={selected.diameterMm}
            min={0}
            onCommit={(diameterMm) => updateComponent(selected.id, { diameterMm })}
          />
          <NumberField
            label="Focal length (mm)"
            value={selected.focalLengthMm}
            isValid={(v) => v !== 0}
            onCommit={(focalLengthMm) => updateComponent(selected.id, { focalLengthMm })}
          />
        </>
      )}

      {selected.kind === 'thick-lens' &&
        (() => {
          const geometryIssue = checkThickLensGeometry(selected)
          return (
            <>
              <NumberField
                label="Diameter (mm)"
                value={selected.diameterMm}
                min={0}
                warn={geometryIssue.kind === 'aperture-exceeds-roc'}
                onCommit={(diameterMm) => updateComponent(selected.id, { diameterMm })}
              />
              <NumberField
                label="Center thickness (mm)"
                value={selected.centerThicknessMm}
                min={0}
                warn={geometryIssue.kind === 'surfaces-cross'}
                onCommit={(centerThicknessMm) => updateComponent(selected.id, { centerThicknessMm })}
              />
              <NumberField
                label="Refractive index"
                value={selected.refractiveIndex}
                min={1}
                onCommit={(refractiveIndex) => updateComponent(selected.id, { refractiveIndex })}
              />
              <RocField
                label="Left ROC (mm)"
                value={selected.leftRocMm}
                warn={geometryIssue.kind === 'aperture-exceeds-roc' && geometryIssue.surface === 'left'}
                onCommit={(leftRocMm) => updateComponent(selected.id, { leftRocMm })}
              />
              <RocField
                label="Right ROC (mm)"
                value={selected.rightRocMm}
                warn={geometryIssue.kind === 'aperture-exceeds-roc' && geometryIssue.surface === 'right'}
                onCommit={(rightRocMm) => updateComponent(selected.id, { rightRocMm })}
              />
            </>
          )
        })()}

      {selected.kind === 'analyzer' && <AnalyzerReadout component={selected} />}

      {selected.kind === 'placeholder' &&
        (() => {
          const placeholder = selected
          const others = components.filter((c) => c.id !== placeholder.id)
          return (
            <>
              <NumberField
                label={`Start (${unitLabel(xUnit, holeSpacing)})`}
                value={mmToUnit(placeholder.xStartMm, xUnit, holeSpacing)}
                isValid={(v) => {
                  const startMm = unitToMm(v, xUnit, holeSpacing)
                  return startMm < placeholder.xEndMm && isXRangeFreeOfLenses(others, startMm, placeholder.xEndMm)
                }}
                onCommit={(v) => updateComponent(placeholder.id, { xStartMm: unitToMm(v, xUnit, holeSpacing) })}
              />
              <NumberField
                label={`End (${unitLabel(xUnit, holeSpacing)})`}
                value={mmToUnit(placeholder.xEndMm, xUnit, holeSpacing)}
                isValid={(v) => {
                  const endMm = unitToMm(v, xUnit, holeSpacing)
                  return endMm > placeholder.xStartMm && isXRangeFreeOfLenses(others, placeholder.xStartMm, endMm)
                }}
                onCommit={(v) => updateComponent(placeholder.id, { xEndMm: unitToMm(v, xUnit, holeSpacing) })}
              />
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={placeholder.locked}
                  onChange={() => toggleLock(placeholder.id)}
                />
                Locked
              </label>
            </>
          )
        })()}

      <GroupSelector value={selected.group} onChange={(group) => setGroup(selected.id, group)} />
    </section>
  )
}
