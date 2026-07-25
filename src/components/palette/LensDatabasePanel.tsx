import { useState, type ChangeEvent, type DragEvent, type MouseEvent } from 'react'
import { LENS_CATALOGS } from '../../lib/scene/catalogs'
import { filterCatalogEntries } from '../../lib/scene/catalogs/catalog'
import { createLensDatabaseEntry } from '../../lib/scene/factory'
import { buildComponentFromDatabaseEntry, nextPlacementXMm } from '../../lib/scene/placement'
import type { LensDatabaseEntry } from '../../lib/scene/types'
import { PlusIcon } from '../icons/PlusIcon'
import { TrashIcon } from '../icons/TrashIcon'
import { Panel } from '../layout/Panel'
import { useActiveLensCatalog } from '../../state/selectors'
import { useSceneStore } from '../../state/sceneStore'

export const LENS_DATABASE_DRAG_TYPE = 'application/x-yammt-lens-entry'

function onDragStart(e: DragEvent<HTMLDivElement>, id: string) {
  e.dataTransfer.setData(LENS_DATABASE_DRAG_TYPE, id)
  e.dataTransfer.effectAllowed = 'copy'
}

export function LensDatabasePanel() {
  const lensDatabase = useSceneStore((s) => s.lensDatabase)
  const components = useSceneStore((s) => s.components)
  const selectedId = useSceneStore((s) => s.selectedLensDatabaseEntryId)
  const addDatabaseEntry = useSceneStore((s) => s.addDatabaseEntry)
  const addComponent = useSceneStore((s) => s.addComponent)
  const removeDatabaseEntry = useSceneStore((s) => s.removeDatabaseEntry)
  const selectDatabaseEntry = useSceneStore((s) => s.selectDatabaseEntry)
  const select = useSceneStore((s) => s.select)
  const activeCatalogId = useSceneStore((s) => s.activeCatalogId)
  const setActiveCatalog = useSceneStore((s) => s.setActiveCatalog)
  const activeCatalog = useActiveLensCatalog()
  const [filterQuery, setFilterQuery] = useState('')

  function onNew(kind: 'thin-lens' | 'thick-lens') {
    const entry = createLensDatabaseEntry(kind)
    addDatabaseEntry(entry)
    selectDatabaseEntry(entry.id)
  }

  function onRemove(e: MouseEvent, id: string) {
    e.stopPropagation()
    removeDatabaseEntry(id)
  }

  function onCatalogChange(e: ChangeEvent<HTMLSelectElement>) {
    setActiveCatalog(e.target.value || null)
    setFilterQuery('')
  }

  function onAddToGraph(entry: LensDatabaseEntry) {
    const xMm = nextPlacementXMm(components)
    const component = buildComponentFromDatabaseEntry(entry, xMm, components)
    if (!component) return
    addComponent(component)
    select(component.id)
  }

  const filteredCatalogEntries = activeCatalog ? filterCatalogEntries(activeCatalog.entries, filterQuery) : []

  return (
    <Panel title="Lens Database" className="lens-database-panel" defaultCollapsed>
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
      <div className="lens-db-new-buttons">
        <button type="button" className="header-button" onClick={() => onNew('thin-lens')}>
          <PlusIcon />
          Thin lens
        </button>
        <button type="button" className="header-button" onClick={() => onNew('thick-lens')}>
          <PlusIcon />
          Thick lens
        </button>
      </div>

      <div className="lens-catalog-section">
        <label>
          Catalogue
          <select value={activeCatalogId ?? ''} onChange={onCatalogChange}>
            <option value="">None</option>
            {LENS_CATALOGS.map((catalog) => (
              <option key={catalog.id} value={catalog.id}>
                {catalog.name}
              </option>
            ))}
          </select>
        </label>
        {activeCatalog && (
          <>
            <input
              type="text"
              className="lens-catalog-filter"
              placeholder="Filter by name…"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
            <div className="lens-catalog-list">
              {filteredCatalogEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="lens-catalog-item"
                  draggable
                  onDragStart={(e) => onDragStart(e, entry.id)}
                >
                  <span className="lens-db-item-name">{entry.name}</span>
                  <span className="lens-db-item-kind">{entry.kind === 'thin-lens' ? 'thin' : 'thick'}</span>
                  <button
                    type="button"
                    className="icon-button"
                    title="Add to graph"
                    aria-label="Add to graph"
                    onClick={() => onAddToGraph(entry)}
                  >
                    <PlusIcon />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Panel>
  )
}
