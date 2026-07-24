import { useState } from 'react'
import { graphSvgRef } from '../graph/graphSvgRef'
import { buildStandaloneSvgString } from '../../lib/graph/exportSvg'
import { downloadBlob, downloadJson, exportPng, PNG_EXPORT_SCALE, pickJsonFile } from '../../lib/io/fileIO'
import { deserializeScene, serializeScene } from '../../lib/scene/serialize'
import { exportScene, useSceneStore } from '../../state/sceneStore'

const SCENE_FILENAME = 'yammt-scene.json'
const SVG_FILENAME = 'yammt-graph.svg'
const PNG_FILENAME = 'yammt-graph.png'

export function FileControls() {
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    downloadJson(serializeScene(exportScene()), SCENE_FILENAME)
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

  function handleExportSvg() {
    setError(null)
    if (!graphSvgRef.current) {
      setError('Graph not ready to export')
      return
    }
    const svgString = buildStandaloneSvgString(graphSvgRef.current)
    downloadBlob(new Blob([svgString], { type: 'image/svg+xml' }), SVG_FILENAME)
  }

  async function handleExportPng() {
    setError(null)
    if (!graphSvgRef.current) {
      setError('Graph not ready to export')
      return
    }
    try {
      const blob = await exportPng(graphSvgRef.current, PNG_EXPORT_SCALE)
      downloadBlob(blob, PNG_FILENAME)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export PNG')
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
      <button type="button" className="header-button" onClick={handleExportSvg}>
        <ExportIcon />
        SVG
      </button>
      <button type="button" className="header-button" onClick={handleExportPng}>
        <ExportIcon />
        PNG
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

function ExportIcon() {
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
