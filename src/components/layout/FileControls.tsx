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
        Save
      </button>
      <button type="button" className="header-button" onClick={handleLoad}>
        Load
      </button>
      {error && <span className="file-controls-error">{error}</span>}
    </div>
  )
}
