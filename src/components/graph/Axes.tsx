import { mmToDisplayY, mmToUnit, niceTickInterval, unitLabel } from '../../lib/units/length'
import type { HoleSpacing, LengthUnit } from '../../lib/scene/types'
import type { Scales } from './scales'

interface AxesProps {
  scales: Scales
  xMinMm: number
  xMaxMm: number
  yMaxMm: number
  yUnit: 'mm' | 'um'
  xUnit: LengthUnit
  holeSpacing: HoleSpacing
}

function xTicksMm(xMinMm: number, xMaxMm: number, xUnit: LengthUnit, holeSpacing: HoleSpacing): number[] {
  const spanInUnit = mmToUnit(xMaxMm - xMinMm, xUnit, holeSpacing)
  const stepInUnit = niceTickInterval(spanInUnit)
  const stepMm = stepInUnit === 0 ? xMaxMm - xMinMm : (stepInUnit / spanInUnit) * (xMaxMm - xMinMm)
  const ticks: number[] = []
  const first = Math.ceil(xMinMm / stepMm) * stepMm
  for (let t = first; t <= xMaxMm; t += stepMm) {
    ticks.push(t)
  }
  return ticks
}

/** Ticks symmetric around zero, spaced per niceTickInterval in the display unit. */
function yTicksMm(yMaxMm: number, yUnit: 'mm' | 'um'): number[] {
  const maxInUnit = mmToDisplayY(yMaxMm, yUnit)
  const stepInUnit = niceTickInterval(maxInUnit, 4)
  if (stepInUnit <= 0) return [0]
  const stepMm = yUnit === 'um' ? stepInUnit / 1000 : stepInUnit
  const ticks: number[] = [0]
  for (let t = stepMm; t <= yMaxMm + 1e-9; t += stepMm) {
    ticks.push(t, -t)
  }
  return ticks
}

export function Axes({ scales, xMinMm, xMaxMm, yMaxMm, yUnit, xUnit, holeSpacing }: AxesProps) {
  const xTicks = xTicksMm(xMinMm, xMaxMm, xUnit, holeSpacing)
  const yTicks = yTicksMm(yMaxMm, yUnit)

  return (
    <g className="axes">
      <g className="gridlines-x">
        {xTicks.map((zMm) => (
          <line key={zMm} x1={scales.xToSvg(zMm)} y1={0} x2={scales.xToSvg(zMm)} y2={scales.height} />
        ))}
      </g>
      <g className="gridlines-y">
        {yTicks.map((rMm) => (
          <line key={rMm} x1={0} y1={scales.yToSvg(rMm)} x2={scales.width} y2={scales.yToSvg(rMm)} />
        ))}
      </g>
      <g className="tick-labels-x">
        {xTicks.map((zMm) => (
          <text key={zMm} x={scales.xToSvg(zMm)} y={scales.height - 4}>
            {mmToUnit(zMm, xUnit, holeSpacing).toFixed(2)}
          </text>
        ))}
      </g>
      <g className="tick-labels-y">
        {yTicks
          .filter((rMm) => rMm !== 0)
          .map((rMm) => (
            <text key={rMm} x={4} y={scales.yToSvg(rMm) - 3}>
              {mmToDisplayY(rMm, yUnit).toFixed(yUnit === 'um' ? 0 : 2)}
            </text>
          ))}
      </g>
      <text className="axis-unit-label" x={scales.width - 4} y={scales.height - 4}>
        {unitLabel(xUnit, holeSpacing)}
      </text>
      <text className="axis-unit-label" x={4} y={12}>
        {yUnit} (radius)
      </text>
    </g>
  )
}
