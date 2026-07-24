import { NumberField } from './NumberField'

export interface ThinLensShape {
  diameterMm: number
  focalLengthMm: number
}

export function ThinLensShapeFields({
  shape,
  onChange,
}: {
  shape: ThinLensShape
  onChange: (patch: Partial<ThinLensShape>) => void
}) {
  return (
    <>
      <NumberField
        label="Diameter (mm)"
        value={shape.diameterMm}
        min={0}
        onCommit={(diameterMm) => onChange({ diameterMm })}
      />
      <NumberField
        label="Focal length (mm)"
        value={shape.focalLengthMm}
        isValid={(v) => v !== 0}
        onCommit={(focalLengthMm) => onChange({ focalLengthMm })}
      />
    </>
  )
}
