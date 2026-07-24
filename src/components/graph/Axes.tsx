import { mmToDisplayY, mmToUnit, niceTickInterval, unitLabel } from '../../lib/units/length'
import type { SecondaryAxisSpec } from '../../lib/graph/secondaryAxis'
import { buildTicks, formatTickValue } from '../../lib/graph/ticks'
import type { HoleSpacing, LengthUnit } from '../../lib/scene/types'
import type { Scales, SecondaryScale } from './scales'

interface AxesProps {
  scales: Scales
  xMinMm: number
  xMaxMm: number
  yMaxMm: number
  yUnit: 'mm' | 'um'
  xUnit: LengthUnit
  holeSpacing: HoleSpacing
  secondarySpec?: SecondaryAxisSpec
  secondaryScale?: SecondaryScale
}

function xTicksMm(
  xMinMm: number,
  xMaxMm: number,
  xUnit: LengthUnit,
  holeSpacing: HoleSpacing,
): { ticks: number[]; stepInUnit: number } {
  const spanInUnit = mmToUnit(xMaxMm - xMinMm, xUnit, holeSpacing)
  const stepInUnit = niceTickInterval(spanInUnit)
  const stepMm = stepInUnit === 0 || spanInUnit === 0 ? xMaxMm - xMinMm : (stepInUnit / spanInUnit) * (xMaxMm - xMinMm)
  return { ticks: buildTicks(xMinMm, xMaxMm, stepMm), stepInUnit }
}

/** Ticks symmetric around zero, spaced per niceTickInterval in the display unit. */
function yTicksMm(yMaxMm: number, yUnit: 'mm' | 'um'): { ticks: number[]; stepInUnit: number } {
  const maxInUnit = mmToDisplayY(yMaxMm, yUnit)
  const stepInUnit = niceTickInterval(maxInUnit, 4)
  if (stepInUnit <= 0) return { ticks: [0], stepInUnit }
  const stepMm = yUnit === 'um' ? stepInUnit / 1000 : stepInUnit
  const positive = buildTicks(stepMm, yMaxMm + 1e-9, stepMm)
  return { ticks: [0, ...positive, ...positive.map((t) => -t)], stepInUnit }
}

/** Ticks spanning [domainMin, domainMax], spaced per niceTickInterval. */
function secondaryTicks(domainMin: number, domainMax: number): number[] {
  const step = niceTickInterval(domainMax - domainMin, 4)
  return buildTicks(domainMin, domainMax, step)
}

export function Axes({
  scales,
  xMinMm,
  xMaxMm,
  yMaxMm,
  yUnit,
  xUnit,
  holeSpacing,
  secondarySpec,
  secondaryScale,
}: AxesProps) {
  const xTicks = xTicksMm(xMinMm, xMaxMm, xUnit, holeSpacing)
  const yTicks = yTicksMm(yMaxMm, yUnit)
  const secondaryYTicks =
    secondarySpec && secondaryScale ? secondaryTicks(secondarySpec.domainMin, secondarySpec.domainMax) : []

  return (
    <g className="axes">
      <g className="gridlines-x">
        {xTicks.ticks.map((zMm) => (
          <line key={zMm} x1={scales.xToSvg(zMm)} y1={0} x2={scales.xToSvg(zMm)} y2={scales.height} />
        ))}
      </g>
      <g className="gridlines-y">
        {yTicks.ticks.map((rMm) => (
          <line key={rMm} x1={0} y1={scales.yToSvg(rMm)} x2={scales.width} y2={scales.yToSvg(rMm)} />
        ))}
      </g>
      <g className="tick-labels-x">
        {xTicks.ticks.map((zMm) => (
          <text key={zMm} x={scales.xToSvg(zMm)} y={scales.height - 4}>
            {formatTickValue(mmToUnit(zMm, xUnit, holeSpacing), xTicks.stepInUnit)}
          </text>
        ))}
      </g>
      <g className="tick-labels-y">
        {yTicks.ticks
          .filter((rMm) => rMm !== 0)
          .map((rMm) => (
            <text key={rMm} x={4} y={scales.yToSvg(rMm) - 3}>
              {formatTickValue(mmToDisplayY(rMm, yUnit), yTicks.stepInUnit)}
            </text>
          ))}
      </g>
      <text className="axis-unit-label" x={scales.width - 4} y={scales.height - 4}>
        {unitLabel(xUnit, holeSpacing)}
      </text>
      <text className="axis-unit-label" x={4} y={12}>
        {yUnit} (radius)
      </text>
      {secondarySpec && secondaryScale && (
        <>
          <g className="tick-labels-y-secondary">
            {secondaryYTicks.map((value) => (
              <text key={value} x={scales.width - 4} y={secondaryScale.yToSvg(value) - 3}>
                {secondarySpec.formatTick(value)}
              </text>
            ))}
          </g>
          <text className="axis-unit-label axis-unit-label-secondary" x={scales.width - 4} y={12}>
            {secondarySpec.unitLabel}
          </text>
        </>
      )}
    </g>
  )
}
