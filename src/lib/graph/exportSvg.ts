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

/** Clones the live graph SVG into a standalone string with all styling baked in as inline styles. */
export function buildStandaloneSvgString(svgEl: SVGSVGElement): string {
  const clone = svgEl.cloneNode(true) as SVGSVGElement
  inlineComputedStyles(svgEl, clone)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  bg.setAttribute('width', '100%')
  bg.setAttribute('height', '100%')
  bg.setAttribute('fill', getComputedStyle(document.body).backgroundColor)
  clone.insertBefore(bg, clone.firstChild)

  return new XMLSerializer().serializeToString(clone)
}
