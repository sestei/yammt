import { checkThickLensGeometry } from '../../lib/optics/thickLensGeometry'
import { NumberField } from './NumberField'
import { RocField } from './RocField'

export interface ThickLensShape {
  refractiveIndex: number
  leftRocMm: number
  rightRocMm: number
  diameterMm: number
  centerThicknessMm: number
}

export function ThickLensShapeFields({
  shape,
  onChange,
}: {
  shape: ThickLensShape
  onChange: (patch: Partial<ThickLensShape>) => void
}) {
  const geometryIssue = checkThickLensGeometry(shape)

  return (
    <>
      <NumberField
        label="Diameter (mm)"
        value={shape.diameterMm}
        min={0}
        warn={geometryIssue.kind === 'aperture-exceeds-roc'}
        onCommit={(diameterMm) => onChange({ diameterMm })}
      />
      <NumberField
        label="Center thickness (mm)"
        value={shape.centerThicknessMm}
        min={0}
        warn={geometryIssue.kind === 'surfaces-cross'}
        onCommit={(centerThicknessMm) => onChange({ centerThicknessMm })}
      />
      <NumberField
        label="Refractive index"
        value={shape.refractiveIndex}
        min={1}
        onCommit={(refractiveIndex) => onChange({ refractiveIndex })}
      />
      <RocField
        label="Left ROC (mm)"
        value={shape.leftRocMm}
        warn={geometryIssue.kind === 'aperture-exceeds-roc' && geometryIssue.surface === 'left'}
        onCommit={(leftRocMm) => onChange({ leftRocMm })}
      />
      <RocField
        label="Right ROC (mm)"
        value={shape.rightRocMm}
        warn={geometryIssue.kind === 'aperture-exceeds-roc' && geometryIssue.surface === 'right'}
        onCommit={(rightRocMm) => onChange({ rightRocMm })}
      />
    </>
  )
}
