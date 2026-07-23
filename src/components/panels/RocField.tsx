import type { ChangeEvent } from 'react'
import { NumberField } from './NumberField'

const DEFAULT_FINITE_ROC_MM = 100

export function RocField({
  label,
  value,
  warn,
  onCommit,
}: {
  label: string
  value: number
  warn?: boolean
  onCommit: (v: number) => void
}) {
  const isFlat = !Number.isFinite(value)

  function onFlatToggle(e: ChangeEvent<HTMLInputElement>) {
    onCommit(e.target.checked ? Infinity : DEFAULT_FINITE_ROC_MM)
  }

  return (
    <div className="roc-field">
      {isFlat ? (
        <label>
          {label}
          <input type="text" value="∞ (flat)" disabled />
        </label>
      ) : (
        <NumberField label={label} value={value} isValid={(v) => v !== 0} warn={warn} onCommit={onCommit} />
      )}
      <label className="checkbox-label">
        <input type="checkbox" checked={isFlat} onChange={onFlatToggle} />
        Flat
      </label>
    </div>
  )
}
