import { useMemo, type DragEvent } from 'react'
import { getSecondaryAxisSpec } from '../../lib/graph/secondaryAxis'
import { buildComponentAt, buildComponentFromDatabaseEntry, isPaletteComponentKind } from '../../lib/scene/placement'
import { autoYUnit } from '../../lib/units/length'
import { PALETTE_DRAG_TYPE } from '../palette/ComponentPalette'
import { LENS_DATABASE_DRAG_TYPE } from '../palette/LensDatabasePanel'
import { useActiveLensCatalog, useBeamProfile } from '../../state/selectors'
import { useSceneStore } from '../../state/sceneStore'
import { Axes } from './Axes'
import { BeamEnvelope } from './BeamEnvelope'
import { ComponentsLayer } from './ComponentsLayer'
import { graphSvgRef } from './graphSvgRef'
import { OutputBeamInfo } from './OutputBeamInfo'
import { SecondaryAxisCurve } from './SecondaryAxisCurve'
import { createScales, createSecondaryScale } from './scales'
import { useContainerSize } from './useContainerSize'
import { useDeleteKeyboardShortcut } from './useDeleteKeyboardShortcut'
import { useDisableKeyboardShortcut } from './useDisableKeyboardShortcut'
import { useFlipKeyboardShortcut } from './useFlipKeyboardShortcut'
import { useGroupKeyboardShortcut } from './useGroupKeyboardShortcut'
import { useNudgeKeyboardShortcut } from './useNudgeKeyboardShortcut'
import { useViewportGestures } from './useViewportGestures'

export function GraphView() {
  const viewport = useSceneStore((s) => s.viewport)
  const components = useSceneStore((s) => s.components)
  const lensDatabase = useSceneStore((s) => s.lensDatabase)
  const addComponent = useSceneStore((s) => s.addComponent)
  const select = useSceneStore((s) => s.select)
  const activeCatalog = useActiveLensCatalog()
  const profile = useBeamProfile()
  const [containerRef, size] = useContainerSize<HTMLDivElement>()

  useGroupKeyboardShortcut()
  useDeleteKeyboardShortcut()
  useNudgeKeyboardShortcut()
  useFlipKeyboardShortcut()
  useDisableKeyboardShortcut()

  // Fixed reference range set once at viewport creation, scaled only by explicit
  // ctrl+scroll (yZoom) — not recomputed from the live profile, since continuous
  // autoscaling to whatever is currently visible was distracting during pan/drag.
  const yMaxMm = viewport.baseYMaxMm * viewport.yZoom

  const width = size.width || 1
  const height = size.height || 1

  const scales = useMemo(
    () => createScales(viewport.xMinMm, viewport.xMaxMm, yMaxMm || 1, width, height),
    [viewport.xMinMm, viewport.xMaxMm, yMaxMm, width, height],
  )

  const secondarySpec = useMemo(
    () =>
      viewport.secondaryAxis === 'none'
        ? null
        : getSecondaryAxisSpec(viewport.secondaryAxis, viewport.xMinMm, viewport.xMaxMm),
    [viewport.secondaryAxis, viewport.xMinMm, viewport.xMaxMm],
  )

  const secondaryScale = useMemo(
    () => (secondarySpec ? createSecondaryScale(secondarySpec.domainMin, secondarySpec.domainMax, height) : null),
    [secondarySpec, height],
  )

  const { onPointerDown, onPointerMove, onPointerUp, isDragging } = useViewportGestures(
    containerRef,
    scales,
    width,
  )

  const yUnit = autoYUnit(yMaxMm)

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    if (e.dataTransfer.types.includes(PALETTE_DRAG_TYPE) || e.dataTransfer.types.includes(LENS_DATABASE_DRAG_TYPE)) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const xMm = scales.svgToX(offsetX)

    const kind = e.dataTransfer.getData(PALETTE_DRAG_TYPE)
    const entryId = e.dataTransfer.getData(LENS_DATABASE_DRAG_TYPE)

    let component = null
    if (isPaletteComponentKind(kind)) {
      component = buildComponentAt(kind, xMm, components)
    } else if (entryId) {
      const entry =
        lensDatabase.find((dbEntry) => dbEntry.id === entryId) ??
        activeCatalog?.entries.find((dbEntry) => dbEntry.id === entryId)
      if (entry) component = buildComponentFromDatabaseEntry(entry, xMm, components)
    } else {
      return
    }
    e.preventDefault()
    if (!component) return

    addComponent(component)
    select(component.id)
  }

  return (
    <div
      ref={containerRef}
      className={`graph-view-container${isDragging ? ' dragging' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={() => select(null)}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {size.width > 0 && size.height > 0 && (
        <svg
          ref={(el) => {
            graphSvgRef.current = el
          }}
          className="graph-view"
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          role="img"
          aria-label="Gaussian beam profile"
        >
          <defs>
            <pattern id="placeholder-hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" className="placeholder-hatch-line" />
            </pattern>
          </defs>
          <Axes
            scales={scales}
            xMinMm={viewport.xMinMm}
            xMaxMm={viewport.xMaxMm}
            yMaxMm={yMaxMm}
            yUnit={yUnit}
            xUnit={viewport.xUnit}
            holeSpacing={viewport.holeSpacing}
            secondarySpec={secondarySpec ?? undefined}
            secondaryScale={secondaryScale ?? undefined}
          />
          <BeamEnvelope profile={profile} scales={scales} />
          {secondarySpec && secondaryScale && (
            <SecondaryAxisCurve profile={profile} scales={scales} secondaryScale={secondaryScale} spec={secondarySpec} />
          )}
          <ComponentsLayer
            components={components}
            scales={scales}
            xMinMm={viewport.xMinMm}
            xMaxMm={viewport.xMaxMm}
          />
        </svg>
      )}
      {size.width > 0 && size.height > 0 && (
        <OutputBeamInfo xUnit={viewport.xUnit} holeSpacing={viewport.holeSpacing} />
      )}
    </div>
  )
}
