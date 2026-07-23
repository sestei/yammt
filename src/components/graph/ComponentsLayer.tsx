import { useMemo } from 'react'
import { beamStateAt, buildElementList } from '../../lib/optics/propagate'
import { getLeftXMm, getRightXMm } from '../../lib/scene/positions'
import type { SceneComponent } from '../../lib/scene/types'
import { useSceneStore } from '../../state/sceneStore'
import { AnalyzerGlyph } from './glyphs/AnalyzerGlyph'
import { PlaceholderGlyph } from './glyphs/PlaceholderGlyph'
import { ThickLensGlyph } from './glyphs/ThickLensGlyph'
import { ThinLensGlyph } from './glyphs/ThinLensGlyph'
import type { Scales } from './scales'

function isVisible(c: SceneComponent, xMinMm: number, xMaxMm: number): boolean {
  return getRightXMm(c) >= xMinMm && getLeftXMm(c) <= xMaxMm
}

export function ComponentsLayer({
  components,
  scales,
  xMinMm,
  xMaxMm,
}: {
  components: SceneComponent[]
  scales: Scales
  xMinMm: number
  xMaxMm: number
}) {
  const beam = useSceneStore((s) => s.beam)
  const selectedComponentId = useSceneStore((s) => s.selectedComponentId)
  const select = useSceneStore((s) => s.select)

  const elements = useMemo(() => buildElementList(components), [components])
  const visible = components.filter((c) => isVisible(c, xMinMm, xMaxMm))
  // Placeholders render first (behind) so lenses/analyzers draw on top of the hatch.
  const placeholders = visible.filter((c) => c.kind === 'placeholder')
  const others = visible.filter((c) => c.kind !== 'placeholder')

  function renderComponent(c: SceneComponent) {
    const selected = c.id === selectedComponentId
    const onSelect = () => select(c.id)

    if (c.kind === 'thin-lens') {
      const threeSigmaRadiusMm = 1.5 * beamStateAt(beam, elements, c.xMm).radiusMm
      return (
        <ThinLensGlyph
          key={c.id}
          component={c}
          scales={scales}
          selected={selected}
          threeSigmaRadiusMm={threeSigmaRadiusMm}
          onSelect={onSelect}
        />
      )
    }
    if (c.kind === 'thick-lens') {
      const threeSigmaRadiusMm = 1.5 * beamStateAt(beam, elements, c.xMm).radiusMm
      return (
        <ThickLensGlyph
          key={c.id}
          component={c}
          scales={scales}
          selected={selected}
          threeSigmaRadiusMm={threeSigmaRadiusMm}
          onSelect={onSelect}
        />
      )
    }
    if (c.kind === 'analyzer') {
      const radiusMm = beamStateAt(beam, elements, c.xMm).radiusMm
      return (
        <AnalyzerGlyph
          key={c.id}
          component={c}
          scales={scales}
          selected={selected}
          radiusMm={radiusMm}
          onSelect={onSelect}
        />
      )
    }
    if (c.kind === 'placeholder') {
      return <PlaceholderGlyph key={c.id} component={c} scales={scales} selected={selected} onSelect={onSelect} />
    }
    return null
  }

  return (
    <g className="components">
      {placeholders.map(renderComponent)}
      {others.map(renderComponent)}
    </g>
  )
}
