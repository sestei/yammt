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
})
