import type { ChangeEvent, ReactNode } from 'react'
import { buildComponentFromDatabaseEntry } from '../../lib/scene/placement'
import { isXRangeFreeOfLenses } from '../../lib/scene/placeholderCollision'
import { getRightXMm } from '../../lib/scene/positions'
import { mmToUnit, unitLabel, unitToMm } from '../../lib/units/length'
import { PlusIcon } from '../icons/PlusIcon'
import { TrashIcon } from '../icons/TrashIcon'
import { Panel } from '../layout/Panel'
import { useSelectedComponent, useSelectedLensDatabaseEntry } from '../../state/selectors'
import { useSceneStore } from '../../state/sceneStore'
import { AnalyzerReadout } from './AnalyzerReadout'
import { GroupSelector } from './GroupSelector'
import { NumberField } from './NumberField'
import { PositionAndLockFields } from './PositionAndLockFields'
import { ThickLensShapeFields } from './ThickLensShapeFields'
import { ThinLensShapeFields } from './ThinLensShapeFields'

const NEW_COMPONENT_GAP_MM = 10

function IconButton({
  title,
  onClick,
  children,
}: {
  title: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button type="button" className="icon-button" title={title} aria-label={title} onClick={onClick}>
      {children}
    </button>
  )
}

function LensDatabaseEntryEditor() {
  const entry = useSelectedLensDatabaseEntry()
  const components = useSceneStore((s) => s.components)
  const updateDatabaseEntry = useSceneStore((s) => s.updateDatabaseEntry)
  const removeDatabaseEntry = useSceneStore((s) => s.removeDatabaseEntry)
  const addComponent = useSceneStore((s) => s.addComponent)
  const select = useSceneStore((s) => s.select)

  if (!entry) return null

  function handleAddToGraph() {
    if (!entry) return
    const rightmostMm = components.length > 0 ? Math.max(...components.map(getRightXMm)) : undefined
    const xMm = rightmostMm !== undefined ? rightmostMm + NEW_COMPONENT_GAP_MM : 0
    const component = buildComponentFromDatabaseEntry(entry, xMm, components)
    if (!component) return
    addComponent(component)
    select(component.id)
  }

  const headerButtons = (
    <>
      <IconButton title="Add to graph" onClick={handleAddToGraph}>
        <PlusIcon />
      </IconButton>
      <IconButton title="Remove from database" onClick={() => removeDatabaseEntry(entry.id)}>
        <TrashIcon />
      </IconButton>
    </>
  )

  return (
    <Panel title="Properties" extra={headerButtons} className="properties-panel">
      <label>
        Name
        <input
          type="text"
          value={entry.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => updateDatabaseEntry(entry.id, { name: e.target.value })}
        />
      </label>

      {entry.kind === 'thin-lens' && (
        <ThinLensShapeFields shape={entry} onChange={(patch) => updateDatabaseEntry(entry.id, patch)} />
      )}
      {entry.kind === 'thick-lens' && (
        <ThickLensShapeFields shape={entry} onChange={(patch) => updateDatabaseEntry(entry.id, patch)} />
      )}
    </Panel>
  )
}

export function PropertiesPanel() {
  const selected = useSelectedComponent()
  const selectedEntry = useSelectedLensDatabaseEntry()
  const components = useSceneStore((s) => s.components)
  const xUnit = useSceneStore((s) => s.viewport.xUnit)
  const holeSpacing = useSceneStore((s) => s.viewport.holeSpacing)
  const updateComponent = useSceneStore((s) => s.updateComponent)
  const toggleLock = useSceneStore((s) => s.toggleLock)
  const setGroup = useSceneStore((s) => s.setGroup)
  const removeComponent = useSceneStore((s) => s.removeComponent)

  if (selectedEntry) {
    return <LensDatabaseEntryEditor />
  }

  if (!selected) {
    return (
      <Panel title="Properties" className="properties-panel">
        <p className="empty-state">No component selected</p>
      </Panel>
    )
  }

  const deleteButton = (
    <IconButton title="Delete component" onClick={() => removeComponent(selected.id)}>
      <TrashIcon />
    </IconButton>
  )

  return (
    <Panel title="Properties" extra={deleteButton} className="properties-panel">
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
        <ThinLensShapeFields shape={selected} onChange={(patch) => updateComponent(selected.id, patch)} />
      )}

      {selected.kind === 'thick-lens' && (
        <ThickLensShapeFields shape={selected} onChange={(patch) => updateComponent(selected.id, patch)} />
      )}

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
    </Panel>
  )
}
