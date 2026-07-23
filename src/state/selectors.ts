import { useMemo } from 'react'
import { buildElementList, computeOutputBeam, sampleBeamProfile, type BeamStateAtZ } from '../lib/optics/propagate'
import { useSceneStore } from './sceneStore'
import type { GaussianBeam } from '../lib/optics/beam'
import type { SceneComponent } from '../lib/scene/types'

const DEFAULT_SAMPLE_COUNT = 500

export function useBeamProfile(sampleCount: number = DEFAULT_SAMPLE_COUNT): BeamStateAtZ[] {
  const beam = useSceneStore((s) => s.beam)
  const components = useSceneStore((s) => s.components)
  const xMinMm = useSceneStore((s) => s.viewport.xMinMm)
  const xMaxMm = useSceneStore((s) => s.viewport.xMaxMm)

  return useMemo(() => {
    const elements = buildElementList(components)
    return sampleBeamProfile(beam, elements, xMinMm, xMaxMm, sampleCount)
  }, [beam, components, xMinMm, xMaxMm, sampleCount])
}

/** The beam's waist size/position after passing through every component in the scene. */
export function useOutputBeam(): GaussianBeam {
  const beam = useSceneStore((s) => s.beam)
  const components = useSceneStore((s) => s.components)

  return useMemo(() => computeOutputBeam(beam, buildElementList(components)), [beam, components])
}

export function useSelectedComponent(): SceneComponent | null {
  const selectedId = useSceneStore((s) => s.selectedComponentId)
  const components = useSceneStore((s) => s.components)
  return useMemo(() => components.find((c) => c.id === selectedId) ?? null, [components, selectedId])
}
