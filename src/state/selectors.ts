import { useMemo } from 'react'
import { buildElementList, computeOutputBeam, sampleBeamProfile, type BeamStateAtZ } from '../lib/optics/propagate'
import { LENS_CATALOGS } from '../lib/scene/catalogs'
import type { LensCatalog } from '../lib/scene/catalogs/catalog'
import { useSceneStore } from './sceneStore'
import type { GaussianBeam } from '../lib/optics/beam'
import type { LensDatabaseEntry, SceneComponent } from '../lib/scene/types'

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

export function useSelectedLensDatabaseEntry(): LensDatabaseEntry | null {
  const selectedId = useSceneStore((s) => s.selectedLensDatabaseEntryId)
  const lensDatabase = useSceneStore((s) => s.lensDatabase)
  return useMemo(() => lensDatabase.find((e) => e.id === selectedId) ?? null, [lensDatabase, selectedId])
}

export function useActiveLensCatalog(): LensCatalog | null {
  const activeCatalogId = useSceneStore((s) => s.activeCatalogId)
  return useMemo(() => LENS_CATALOGS.find((c) => c.id === activeCatalogId) ?? null, [activeCatalogId])
}
