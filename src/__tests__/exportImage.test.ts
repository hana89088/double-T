import { describe, it, expect } from 'vitest'
import { exportSvgToPng } from '../utils/exportImage'

describe('exportSvgToPng', () => {
  it('creates a download link (fallback) when canvas.toBlob is missing', () => {
    // mock URL methods and Image loading
    // @ts-ignore
    global.URL.createObjectURL = (b: any) => 'blob://mock'
    // @ts-ignore
    global.URL.revokeObjectURL = (u: string) => {}
    const OrigImage = (global as any).Image
    ;(global as any).Image = class {
      onload: (()=>void) | null = null
      set src(_v: string) { setTimeout(()=> this.onload && this.onload(), 0) }
      get src() { return '' }
    } as any
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
    svg.setAttribute('width','100')
    svg.setAttribute('height','50')
    // jsdom lacks toBlob by default; function should fallback to .svg
    const clicks: string[] = []
    const origCreate = document.createElement
    // spy on anchor creation
    // @ts-ignore
    document.createElement = (tag: string) => {
      const el = origCreate.call(document, tag)
      if (tag === 'a') {
        const origClick = el.click.bind(el)
        el.click = () => { clicks.push('clicked'); origClick() }
      }
      return el
    }
    exportSvgToPng(svg as any, 'chart.png')
    return new Promise<void>((resolve) => setTimeout(() => { expect(clicks.length).toBe(1); (global as any).Image = OrigImage; resolve() }, 10))
    // restore
    document.createElement = origCreate
  })
})
