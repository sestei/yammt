import type { GroupId } from '../../lib/scene/types'

const GROUPS: GroupId[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export function GroupSelector({ value, onChange }: { value: GroupId; onChange: (group: GroupId) => void }) {
  return (
    <div className="group-selector">
      <span className="group-selector-label">Group</span>
      <div className="group-selector-buttons">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            className={`group-button${g === value ? ' active' : ''}`}
            title={g === 0 ? 'Ungrouped' : `Group ${g}`}
            onClick={() => onChange(g)}
          >
            {g === 0 ? 'None' : g}
          </button>
        ))}
      </div>
    </div>
  )
}
