import { useState } from 'react'
import { downloadJson, pickJsonFile } from '../../lib/io/fileIO'
import { deserializeScene, serializeScene } from '../../lib/scene/serialize'
import { exportScene, useSceneStore } from '../../state/sceneStore'

const FILENAME = 'yammt-scene.json'

export function FileControls() {
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    downloadJson(serializeScene(exportScene()), FILENAME)
  }

  async function handleLoad() {
    setError(null)
    try {
      const text = await pickJsonFile()
      const doc = deserializeScene(text)
      useSceneStore.getState().loadScene(doc)
    } catch (err) {
      if (err instanceof Error && err.message === 'No file selected') return
      setError(err instanceof Error ? err.message : 'Failed to load scene')
    }
  }

  return (
    <div className="file-controls">
      <button type="button" className="header-button" onClick={handleSave}>
        <SaveIcon />
        Save
      </button>
      <button type="button" className="header-button" onClick={handleLoad}>
        <LoadIcon />
        Load
      </button>
      {error && <span className="file-controls-error">{error}</span>}
    </div>
  )
}

function SaveIcon() {
  return (
    <svg className="button-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M8 2v8m0 0-3-3m3 3 3-3M3 12v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LoadIcon() {
  return (
    <svg className="button-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path
        d="M8 12V4m0 0 3 3m-3-3-3 3M3 12v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
