export function exportSvgToPng(svg: SVGSVGElement, fileName: string) {
  try {
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(svg)
    const canvas = document.createElement('canvas')
    const img = new Image()
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const quickFallback = () => {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName.replace(/\.png$/, '') + '.svg'
      a.click()
    }

    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        quickFallback()
        return
      }
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      if (canvas.toBlob) {
        canvas.toBlob((png) => {
          if (!png) return quickFallback()
          const a = document.createElement('a')
          a.href = URL.createObjectURL(png)
          a.download = fileName
          a.click()
        }, 'image/png')
      } else {
        quickFallback()
      }
    }
    img.src = url
  } catch {
    // No-op; ensure no crash in limited environments
  }
}
