export interface Scales {
  width: number
  height: number
  xToSvg(zMm: number): number
  yToSvg(radiusMm: number): number
  svgToX(xSvg: number): number
}

/** radiusMm is always measured from the optical axis (y=0), which sits at height/2. */
export function createScales(
  xMinMm: number,
  xMaxMm: number,
  yMaxMm: number,
  width: number,
  height: number,
): Scales {
  const xSpan = xMaxMm - xMinMm || 1
  return {
    width,
    height,
    xToSvg(zMm) {
      return ((zMm - xMinMm) / xSpan) * width
    },
    yToSvg(radiusMm) {
      return height / 2 - (radiusMm / yMaxMm) * (height / 2)
    },
    svgToX(xSvg) {
      return xMinMm + (xSvg / width) * xSpan
    },
  }
}

export interface SecondaryScale {
  yToSvg(value: number): number
}

export function createSecondaryScale(domainMin: number, domainMax: number, height: number): SecondaryScale {
  const span = domainMax - domainMin || 1
  return {
    yToSvg(value) {
      return height - ((value - domainMin) / span) * height
    },
  }
}
