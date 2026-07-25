import { beforeEach, describe, expect, it } from 'vitest'
import { exportScene, useSceneStore } from '../sceneStore'
import type { BeamAnalyzer, Placeholder, SceneDocument, ThinLens } from '../../lib/scene/types'

function thinLens(id: string, xMm: number, group: ThinLens['group'] = 0, locked = false): ThinLens {
  return { id, kind: 'thin-lens', label: id, locked, group, disabled: false, xMm, diameterMm: 25, focalLengthMm: 100 }
}

function placeholder(id: string, xStartMm: number, xEndMm: number): Placeholder {
  return { id, kind: 'placeholder', label: id, locked: false, group: 0, disabled: false, xStartMm, xEndMm }
}

function analyzer(id: string, xMm: number): BeamAnalyzer {
  return { id, kind: 'analyzer', label: id, locked: false, group: 0, xMm }
}

beforeEach(() => {
  useSceneStore.setState({
    components: [],
    selectedComponentId: null,
    dragState: null,
  })
})

describe('moveComponent', () => {
  it('moves grouped components together', () => {
    useSceneStore.setState({
      components: [thinLens('a', 0, 1), thinLens('b', 50, 1), thinLens('c', 100, 0)],
    })
    useSceneStore.getState().moveComponent('a', 10)
    const byId = Object.fromEntries(useSceneStore.getState().components.map((c) => [c.id, c]))
    expect((byId.a as ThinLens).xMm).toBe(10)
    expect((byId.b as ThinLens).xMm).toBe(60) // shifted by the same +10 delta
    expect((byId.c as ThinLens).xMm).toBe(100) // ungrouped, untouched
  })

  it('does not move a locked component', () => {
    useSceneStore.setState({ components: [thinLens('a', 0, 0, true)] })
    useSceneStore.getState().moveComponent('a', 999)
    expect((useSceneStore.getState().components[0] as ThinLens).xMm).toBe(0)
  })

  it('still carries a locked member along when a different unlocked member initiates the drag', () => {
    // Locked only blocks grabbing that component directly; group spacing must not drift.
    useSceneStore.setState({
      components: [thinLens('a', 0, 1), thinLens('b', 50, 1, true)],
    })
    useSceneStore.getState().moveComponent('a', 10)
    const byId = Object.fromEntries(useSceneStore.getState().components.map((c) => [c.id, c]))
    expect((byId.a as ThinLens).xMm).toBe(10)
    expect((byId.b as ThinLens).xMm).toBe(60) // shifted by the same +10 delta, despite being locked
  })

  it('lets an analyzer move into (and a placeholder move over) an analyzer, unlike a lens', () => {
    useSceneStore.setState({
      components: [placeholder('p', 0, 20), analyzer('a', 50), thinLens('l', 100)],
    })
    useSceneStore.getState().moveComponent('a', 10) // into the placeholder's region
    expect((useSceneStore.getState().components[1] as BeamAnalyzer).xMm).toBe(10)

    useSceneStore.getState().moveComponent('p', 40) // placeholder now covers the analyzer's new position
    expect((useSceneStore.getState().components[0] as Placeholder).xStartMm).toBe(40)

    // Sanity check: a real lens is still blocked from entering the placeholder's region.
    useSceneStore.getState().moveComponent('l', 45)
    expect((useSceneStore.getState().components[2] as ThinLens).xMm).toBe(100)
  })
})

describe('setGroup', () => {
  it('assigning group 0 removes a component from its group', () => {
    useSceneStore.setState({ components: [thinLens('a', 0, 3)] })
    useSceneStore.getState().setGroup('a', 0)
    expect(useSceneStore.getState().components[0].group).toBe(0)
  })
})

describe('lens catalogues', () => {
  it('setActiveCatalog switches the id without touching the user lensDatabase', () => {
    const originalDatabase = useSceneStore.getState().lensDatabase
    useSceneStore.getState().setActiveCatalog('some-catalog')
    expect(useSceneStore.getState().activeCatalogId).toBe('some-catalog')
    expect(useSceneStore.getState().lensDatabase).toBe(originalDatabase)

    useSceneStore.getState().setActiveCatalog(null)
    expect(useSceneStore.getState().activeCatalogId).toBeNull()
  })

  it('exportScene never includes an activeCatalogId or catalogue entries', () => {
    useSceneStore.getState().setActiveCatalog('some-catalog')
    const doc = exportScene()
    expect(doc).not.toHaveProperty('activeCatalogId')
  })

  it('loadScene resets activeCatalogId to null', () => {
    useSceneStore.getState().setActiveCatalog('some-catalog')
    const doc: SceneDocument = {
      schemaVersion: 1,
      beam: { wavelengthNm: 1064, waistUm: 300, waistZMm: 0 },
      components: [],
      viewport: useSceneStore.getState().viewport,
      lensDatabase: [],
    }
    useSceneStore.getState().loadScene(doc)
    expect(useSceneStore.getState().activeCatalogId).toBeNull()
  })
})

describe('toggleDisabled', () => {
  it('flips a lens/placeholder disabled flag on and off', () => {
    useSceneStore.setState({ components: [thinLens('a', 0), placeholder('p', 10, 20)] })
    useSceneStore.getState().toggleDisabled('a')
    expect((useSceneStore.getState().components[0] as ThinLens).disabled).toBe(true)
    useSceneStore.getState().toggleDisabled('a')
    expect((useSceneStore.getState().components[0] as ThinLens).disabled).toBe(false)

    useSceneStore.getState().toggleDisabled('p')
    expect((useSceneStore.getState().components[1] as Placeholder).disabled).toBe(true)
  })

  it('is a no-op for an analyzer', () => {
    useSceneStore.setState({ components: [analyzer('a', 50)] })
    useSceneStore.getState().toggleDisabled('a')
    expect(useSceneStore.getState().components[0]).toEqual(analyzer('a', 50))
  })
})
