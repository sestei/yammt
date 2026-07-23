import { create } from 'zustand'
import { rayleighRangeMm, waistMm, type GaussianBeam } from '../lib/optics/beam'
import { isXRangeFreeOfLenses, isXRangeFreeOfPlaceholders } from '../lib/scene/placeholderCollision'
import { getLeftXMm, getRightXMm, shiftXMm, withLeftXMm } from '../lib/scene/positions'
import type { ComponentId, GroupId, SceneComponent, SceneDocument, Viewport } from '../lib/scene/types'

const DEFAULT_BEAM: GaussianBeam = {
  wavelengthNm: 1064,
  waistUm: 337,
  waistZMm: 0,
}

/**
 * Fixed y-axis reference range, sized so the 3-sigma envelope at the edge of the
 * default x-range fills about half the graph height. Computed once at viewport
 * creation and never auto-recomputed afterwards (only viewport.yZoom scales it) —
 * continuously autoscaling to the visible profile was distracting during pan/drag.
 */
function computeBaseYMaxMm(beam: GaussianBeam, xMinMm: number, xMaxMm: number): number {
  const zR = rayleighRangeMm(beam)
  const w0 = waistMm(beam)
  const maxDistFromWaist = Math.max(Math.abs(xMinMm - beam.waistZMm), Math.abs(xMaxMm - beam.waistZMm))
  const maxRadiusMm = w0 * Math.sqrt(1 + (maxDistFromWaist / zR) ** 2)
  const max3SigmaMm = maxRadiusMm * 1.5
  return max3SigmaMm * 2
}

function defaultViewport(beam: GaussianBeam): Viewport {
  const zR = rayleighRangeMm(beam)
  const xMinMm = beam.waistZMm - 2 * zR
  const xMaxMm = beam.waistZMm + 2 * zR
  return {
    xUnit: 'mm',
    holeSpacing: '25mm',
    xMinMm,
    xMaxMm,
    baseYMaxMm: computeBaseYMaxMm(beam, xMinMm, xMaxMm),
    yZoom: 1,
    secondaryAxis: 'none',
  }
}

export interface DragState {
  id: ComponentId
  groupMemberIds: ComponentId[]
}

interface SceneStoreState {
  beam: GaussianBeam
  components: SceneComponent[]
  viewport: Viewport

  selectedComponentId: ComponentId | null
  dragState: DragState | null

  setBeam(patch: Partial<GaussianBeam>): void
  addComponent(c: SceneComponent): void
  updateComponent(id: ComponentId, patch: Partial<SceneComponent>): void
  removeComponent(id: ComponentId): void
  moveComponent(id: ComponentId, newLeftXMm: number): void
  setGroup(id: ComponentId, group: GroupId): void
  toggleLock(id: ComponentId): void
  select(id: ComponentId | null): void
  setDragState(state: DragState | null): void
  setViewport(patch: Partial<Viewport>): void
  loadScene(doc: SceneDocument): void
}

export const useSceneStore = create<SceneStoreState>((set, get) => ({
  beam: DEFAULT_BEAM,
  components: [],
  viewport: defaultViewport(DEFAULT_BEAM),

  selectedComponentId: null,
  dragState: null,

  setBeam(patch) {
    set((s) => ({ beam: { ...s.beam, ...patch } }))
  },

  addComponent(c) {
    set((s) => ({ components: [...s.components, c] }))
  },

  updateComponent(id, patch) {
    set((s) => ({
      components: s.components.map((c) => (c.id === id ? ({ ...c, ...patch } as SceneComponent) : c)),
    }))
  },

  removeComponent(id) {
    set((s) => ({
      components: s.components.filter((c) => c.id !== id),
      selectedComponentId: s.selectedComponentId === id ? null : s.selectedComponentId,
    }))
  },

  moveComponent(id, newLeftXMm) {
    // Locked only blocks grabbing this component directly; if it's dragged along
    // as part of a group (initiated by a different, unlocked member), it still
    // moves too, so the group's relative spacing never silently drifts apart.
    const comp = get().components.find((c) => c.id === id)
    if (!comp || comp.locked) return
    const deltaMm = newLeftXMm - (comp.kind === 'placeholder' ? comp.xStartMm : comp.xMm)
    const group = comp.group

    // Placeholders and lenses can never overlap: check the directly-dragged
    // component's new position against the opposite kind (symmetric exclusion).
    const moved = withLeftXMm(comp, newLeftXMm)
    const others = get().components.filter((c) => c.id !== id)
    const newLeft = getLeftXMm(moved)
    const newRight = getRightXMm(moved)
    if (comp.kind === 'placeholder') {
      if (!isXRangeFreeOfLenses(others, newLeft, newRight)) return
    } else if (!isXRangeFreeOfPlaceholders(others, newLeft, newRight)) {
      return
    }

    set((s) => ({
      components: s.components.map((c) => {
        if (c.id === id) return moved
        if (group !== 0 && c.group === group) return shiftXMm(c, deltaMm)
        return c
      }),
    }))
  },

  setGroup(id, group) {
    set((s) => ({ components: s.components.map((c) => (c.id === id ? { ...c, group } : c)) }))
  },

  toggleLock(id) {
    set((s) => ({ components: s.components.map((c) => (c.id === id ? { ...c, locked: !c.locked } : c)) }))
  },

  select(id) {
    set({ selectedComponentId: id })
  },

  setDragState(state) {
    set({ dragState: state })
  },

  setViewport(patch) {
    set((s) => ({ viewport: { ...s.viewport, ...patch } }))
  },

  loadScene(doc) {
    set({
      beam: doc.beam,
      components: doc.components,
      viewport: doc.viewport,
      selectedComponentId: null,
      dragState: null,
    })
  },
}))

export function exportScene(): SceneDocument {
  const { beam, components, viewport } = useSceneStore.getState()
  return { schemaVersion: 1, beam, components, viewport }
}
