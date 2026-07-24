import type { DragEvent, MouseEvent } from 'react'
import { createLensDatabaseEntry } from '../../lib/scene/factory'
import { TrashIcon } from '../icons/TrashIcon'
import { Panel } from '../layout/Panel'
import { useSceneStore } from '../../state/sceneStore'

export const LENS_DATABASE_DRAG_TYPE = 'application/x-yammt-lens-entry'

export function LensDatabasePanel() {
  const lensDatabase = useSceneStore((s) => s.lensDatabase)
  const selectedId = useSceneStore((s) => s.selectedLensDatabaseEntryId)
  const addDatabaseEntry = useSceneStore((s) => s.addDatabaseEntry)
  const removeDatabaseEntry = useSceneStore((s) => s.removeDatabaseEntry)
  const selectDatabaseEntry = useSceneStore((s) => s.selectDatabaseEntry)

  function onNew(kind: 'thin-lens' | 'thick-lens') {
    const entry = createLensDatabaseEntry(kind)
    addDatabaseEntry(entry)
    selectDatabaseEntry(entry.id)
  }

  function onDragStart(e: DragEvent<HTMLDivElement>, id: string) {
    e.dataTransfer.setData(LENS_DATABASE_DRAG_TYPE, id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  function onRemove(e: MouseEvent, id: string) {
    e.stopPropagation()
    removeDatabaseEntry(id)
  }

  return (
    <Panel title="Lens Database" className="lens-database-panel">
      <div className="lens-db-new-buttons">
        <button type="button" className="header-button" onClick={() => onNew('thin-lens')}>
          New thin lens
        </button>
        <button type="button" className="header-button" onClick={() => onNew('thick-lens')}>
          New thick lens
        </button>
      </div>
      {lensDatabase.map((entry) => (
        <div
          key={entry.id}
          className={`lens-db-item${entry.id === selectedId ? ' selected' : ''}`}
          draggable
          onDragStart={(e) => onDragStart(e, entry.id)}
          onClick={() => selectDatabaseEntry(entry.id)}
        >
          <span className="lens-db-item-name">{entry.name}</span>
          <span className="lens-db-item-kind">{entry.kind === 'thin-lens' ? 'thin' : 'thick'}</span>
          <button
            type="button"
            className="icon-button"
            title="Remove from database"
            aria-label="Remove from database"
            onClick={(e) => onRemove(e, entry.id)}
          >
            <TrashIcon />
          </button>
        </div>
      ))}
    </Panel>
  )
}
