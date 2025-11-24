import { describe, it, expect } from 'vitest'
import { exportToCSV } from '../utils/reportExport'

describe('report export', () => {
  it('triggers CSV download', () => {
    const rows = [['a','b'],[1,2]]
    // mock URL methods
    // @ts-ignore
    global.URL.createObjectURL = (b: any) => 'blob://mock'
    // @ts-ignore
    global.URL.revokeObjectURL = (u: string) => {}
    const clicks: string[] = []
    const orig = document.createElement
    // @ts-ignore
    document.createElement = (tag: string) => {
      const el = orig.call(document, tag)
      if (tag === 'a') {
        const oc = el.click.bind(el)
        el.click = () => { clicks.push('clicked'); oc() }
      }
      return el
    }
    exportToCSV(rows, 'test.csv')
    expect(clicks.length).toBe(1)
    document.createElement = orig
  })
})
