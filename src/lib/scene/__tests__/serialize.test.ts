import { describe, expect, it } from 'vitest'
import { deserializeScene, serializeScene } from '../serialize'
import type { SceneDocument } from '../types'

function fullSceneDocument(): SceneDocument {
  return {
    schemaVersion: 1,
    beam: { wavelengthNm: 1064, waistUm: 337, waistZMm: 0 },
    components: [
      {
        id: 'l1',
        kind: 'thin-lens',
        label: 'Thin',
        locked: false,
        group: 1,
        disabled: false,
        xMm: 50,
        diameterMm: 25,
        focalLengthMm: 100,
      },
      {
        id: 'l2',
        kind: 'thick-lens',
        label: 'Thick',
        locked: true,
        group: 0,
        disabled: false,
        xMm: 100,
        refractiveIndex: 1.5,
        leftRocMm: 50,
        rightRocMm: -50,
        diameterMm: 25,
        centerThicknessMm: 5,
      },
      {
        id: 'a1',
        kind: 'analyzer',
        label: 'Analyzer',
        locked: false,
        group: 1,
        xMm: 150,
      },
      {
        id: 'p1',
        kind: 'placeholder',
        label: 'Placeholder',
        locked: false,
        group: 0,
        disabled: false,
        xStartMm: 200,
        xEndMm: 210,
      },
    ],
    viewport: {
      xUnit: 'cm',
      holeSpacing: '1inch',
      xMinMm: -500,
      xMaxMm: 500,
      baseYMaxMm: 12.5,
      yZoom: 2,
      secondaryAxis: 'gouy-phase',
    },
    lensDatabase: [
      { id: 'd1', name: 'f=100mm', kind: 'thin-lens', diameterMm: 25, focalLengthMm: 100 },
      {
        id: 'd2',
        name: 'Thick lens',
        kind: 'thick-lens',
        refractiveIndex: 1.5,
        leftRocMm: 50,
        rightRocMm: -50,
        diameterMm: 25,
        centerThicknessMm: 5,
      },
    ],
  }
}

describe('serializeScene / deserializeScene', () => {
  it('round-trips a scene with every component kind', () => {
    const doc = fullSceneDocument()
    expect(deserializeScene(serializeScene(doc))).toEqual(doc)
  })

  it('throws a clear error on an unrecognized schemaVersion', () => {
    const json = JSON.stringify({ ...fullSceneDocument(), schemaVersion: 99 })
    expect(() => deserializeScene(json)).toThrow(/schemaVersion/)
  })

  it('throws a clear error on structurally invalid input', () => {
    const json = JSON.stringify({ schemaVersion: 1, beam: {}, viewport: {} }) // missing components
    expect(() => deserializeScene(json)).toThrow(/components/)
  })

  it('throws on input that is not a JSON object', () => {
    expect(() => deserializeScene('42')).toThrow(/not a JSON object/)
  })

  it('defaults lensDatabase to [] for older save files that predate it', () => {
    const { lensDatabase: _omit, ...withoutDatabase } = fullSceneDocument()
    const json = JSON.stringify(withoutDatabase)
    expect(deserializeScene(json).lensDatabase).toEqual([])
  })

  it('throws a clear error when lensDatabase is present but not an array', () => {
    const json = JSON.stringify({ ...fullSceneDocument(), lensDatabase: 'not-an-array' })
    expect(() => deserializeScene(json)).toThrow(/lensDatabase/)
  })

  it('round-trips a flat lens surface (Infinity ROC) without turning it into null', () => {
    const doc = fullSceneDocument()
    const flatLens = { ...doc.components[1], rightRocMm: Infinity }
    const withFlatLens = { ...doc, components: [doc.components[0], flatLens, ...doc.components.slice(2)] }
    const roundTripped = deserializeScene(serializeScene(withFlatLens))
    expect(roundTripped.components[1]).toMatchObject({ rightRocMm: Infinity })
  })

  it('recovers a flat ROC saved as null by an older, buggy build', () => {
    const doc = fullSceneDocument()
    const brokenLens = { ...doc.components[1], rightRocMm: null }
    const json = JSON.stringify({ ...doc, components: [doc.components[0], brokenLens, ...doc.components.slice(2)] })
    const recovered = deserializeScene(json)
    expect(recovered.components[1]).toMatchObject({ rightRocMm: Infinity })
  })

  it('defaults disabled to false for older save files that predate it', () => {
    const raw = JSON.parse(JSON.stringify(fullSceneDocument()))
    delete raw.components[0].disabled
    const recovered = deserializeScene(JSON.stringify(raw))
    expect(recovered.components[0]).toMatchObject({ disabled: false })
  })

  it('round-trips disabled: true', () => {
    const doc = fullSceneDocument()
    const disabledLens = { ...doc.components[0], disabled: true }
    const json = serializeScene({ ...doc, components: [disabledLens, ...doc.components.slice(1)] })
    expect(deserializeScene(json).components[0]).toMatchObject({ disabled: true })
  })
})
