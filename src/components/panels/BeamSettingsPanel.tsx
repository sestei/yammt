import { useSceneStore } from '../../state/sceneStore'
import { NumberField } from './NumberField'

export function BeamSettingsPanel() {
  const beam = useSceneStore((s) => s.beam)
  const setBeam = useSceneStore((s) => s.setBeam)

  return (
    <section className="panel beam-settings-panel">
      <h2>Beam</h2>
      <NumberField
        label="Wavelength (nm)"
        value={beam.wavelengthNm}
        step={1}
        min={0}
        onCommit={(wavelengthNm) => setBeam({ wavelengthNm })}
      />
      <NumberField
        label="Waist size (µm)"
        value={beam.waistUm}
        step={1}
        min={0}
        onCommit={(waistUm) => setBeam({ waistUm })}
      />
      <NumberField
        label="Waist position (mm)"
        value={beam.waistZMm}
        step={1}
        onCommit={(waistZMm) => setBeam({ waistZMm })}
      />
    </section>
  )
}
