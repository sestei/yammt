export function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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
