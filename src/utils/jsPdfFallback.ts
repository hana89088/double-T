// Lightweight fallback implementation to avoid bundling an external PDF dependency
// Creates a simple text-based PDF-like download containing provided lines
export default class JsPdfFallback {
  private lines: string[] = []

  constructor(private readonly options: { unit?: string; format?: string } = {}) {}

  setFontSize(_size: number) {
    // no-op for fallback
  }

  text(content: string, _x: number, _y: number) {
    this.lines.push(content)
  }

  save(filename: string) {
    const heading = `PDF export (format: ${this.options.format ?? 'unknown'}, unit: ${this.options.unit ?? 'pt'})`
    const body = [heading, '----------------------------------------', ...this.lines].join('\n')
    const blob = new Blob([body], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()

    URL.revokeObjectURL(url)
  }
}
