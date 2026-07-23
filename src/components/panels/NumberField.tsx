import { useEffect, useState, type KeyboardEvent } from 'react'

const DISPLAY_PRECISION = 3

/** Rounds to DISPLAY_PRECISION decimals and drops trailing zeros (e.g. 100.000 -> "100"). */
function formatNumber(value: number): string {
  return String(Math.round(value * 10 ** DISPLAY_PRECISION) / 10 ** DISPLAY_PRECISION)
}

interface NumberFieldProps {
  label: string
  value: number
  step?: number
  min?: number
  /** Rejects the typed value (reverting the draft) if this returns false. */
  isValid?: (value: number) => boolean
  /** Highlights the field to flag a value that's technically valid but physically problematic. */
  warn?: boolean
  onCommit: (value: number) => void
}

/**
 * Number input that keeps its own draft value while typing and only commits
 * to the store on blur or Enter, so the graph doesn't recompute per keystroke.
 */
export function NumberField({ label, value, step, min, isValid, warn, onCommit }: NumberFieldProps) {
  const [draft, setDraft] = useState(formatNumber(value))

  useEffect(() => {
    setDraft(formatNumber(value))
  }, [value])

  function commit() {
    const parsed = Number.parseFloat(draft)
    if (!Number.isNaN(parsed) && (!isValid || isValid(parsed))) {
      onCommit(parsed)
    } else {
      setDraft(formatNumber(value))
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    } else if (e.key === 'Escape') {
      setDraft(formatNumber(value))
      e.currentTarget.blur()
    }
  }

  return (
    <label>
      {label}
      <input
        type="number"
        className={warn ? 'warn' : undefined}
        value={draft}
        step={step}
        min={min}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
      />
    </label>
  )
}
