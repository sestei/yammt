import { buildStandaloneSvgString } from '../graph/exportSvg'

export const PNG_EXPORT_SCALE = 2

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function downloadJson(json: string, filename: string): void {
  downloadBlob(new Blob([json], { type: 'application/json' }), filename)
}

/** Rasterizes the graph SVG to a PNG blob at `scale`x the SVG's current pixel dimensions. */
export function exportPng(svgEl: SVGSVGElement, scale: number): Promise<Blob> {
  const width = svgEl.width.baseVal.value
  const height = svgEl.height.baseVal.value
  const svgString = buildStandaloneSvgString(svgEl)
  const url = URL.createObjectURL(new Blob([svgString], { type: 'image/svg+xml' }))

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width * scale
      canvas.height = height * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('Canvas not supported'))
        return
      }
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url)
        if (blob) resolve(blob)
        else reject(new Error('PNG export failed'))
      }, 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not rasterize graph'))
    }
    img.src = url
  })
}

/** Opens a native file picker and resolves with the selected file's text content. */
export function pickJsonFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'
    input.style.display = 'none'
    document.body.appendChild(input)

    function cleanup() {
      document.body.removeChild(input)
    }

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) {
        cleanup()
        reject(new Error('No file selected'))
        return
      }
      file
        .text()
        .then(resolve)
        .catch(() => reject(new Error('Could not read the selected file')))
        .finally(cleanup)
    })
    // Supported in current browser versions; cleans up if the user dismisses the
    // picker without choosing a file (otherwise nothing fires and the hidden
    // input would linger in the DOM).
    input.addEventListener('cancel', () => {
      cleanup()
      reject(new Error('No file selected'))
    })

    input.click()
  })
}
