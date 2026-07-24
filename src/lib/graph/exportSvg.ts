const STYLE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'font-size',
  'font-family',
  'text-anchor',
  'opacity',
] as const

function inlineComputedStyles(original: Element, clone: Element): void {
  const computed = getComputedStyle(original)
  clone.setAttribute('style', STYLE_PROPS.map((p) => `${p}:${computed.getPropertyValue(p)}`).join(';'))
  for (let i = 0; i < original.children.length; i++) {
    inlineComputedStyles(original.children[i], clone.children[i])
  }
}

/**
 * Clones the live graph SVG into a standalone string with all styling baked in as
 * inline styles. Exported graphics use a light color palette (see the
 * `[data-export-theme="light"]` overrides in index.css) with a transparent
 * background, regardless of the app's own dark theme — momentarily applied to the
 * live DOM while computed styles are read, then reverted before this returns.
 */
export function buildStandaloneSvgString(svgEl: SVGSVGElement): string {
  document.documentElement.setAttribute('data-export-theme', 'light')
  try {
    const clone = svgEl.cloneNode(true) as SVGSVGElement
    inlineComputedStyles(svgEl, clone)
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    return new XMLSerializer().serializeToString(clone)
  } finally {
    document.documentElement.removeAttribute('data-export-theme')
  }
}
