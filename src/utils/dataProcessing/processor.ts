import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { DataColumn, DataProcessingOptions } from '../../types'

export class DataProcessor {
  static async parseCSV(file: File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`))
          } else {
            resolve(results.data as Record<string, any>[])
          }
        },
        error: (error) => reject(error)
      })
    })
  }

  static async parseExcel(file: File): Promise<Record<string, any>[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          resolve(jsonData as Record<string, any>[])
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read Excel file'))
      reader.readAsArrayBuffer(file)
    })
  }

  static parseText(text: string): Record<string, any>[] {
    const lines = text.trim().split('\n')
    if (lines.length === 0) return []

    // Try to detect if it's CSV format
    if (lines[0].includes(',')) {
      const result = Papa.parse(lines.join('\n'), { header: true, skipEmptyLines: true })
      return result.data as Record<string, any>[]
    }

    // Assume it's a simple list, convert to single-column data
    return lines.map((line, index) => ({
      id: index + 1,
      value: line.trim()
    }))
  }

  static analyzeColumns(data: Record<string, any>[]): DataColumn[] {
    if (data.length === 0) return []

    const columns: DataColumn[] = []
    const columnNames = Object.keys(data[0])

    for (const columnName of columnNames) {
      const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined)
      const uniqueValues = new Set(values).size
      const nullCount = data.length - values.length

      let type: 'string' | 'number' | 'date' | 'boolean' = 'string'
      let numericValues: number[] = []
      let dateValues: Date[] = []

      for (const value of values) {
        if (typeof value === 'boolean') {
          type = 'boolean'
          break
        }
        if (!isNaN(Number(value)) && value !== '') {
          numericValues.push(Number(value))
        }
        if (!isNaN(Date.parse(value))) {
          dateValues.push(new Date(value))
        }
      }

      if (numericValues.length === values.length) {
        type = 'number'
      } else if (dateValues.length > values.length * 0.8) {
        type = 'date'
      }

      const column: DataColumn = {
        name: columnName,
        type,
        values,
        uniqueValues,
        nullCount
      }

      if (type === 'number') {
        column.statistics = this.calculateNumericStatistics(numericValues)
      }

      columns.push(column)
    }

    return columns
  }

  static calculateNumericStatistics(values: number[]): any {
    if (values.length === 0) return {}

    const sorted = [...values].sort((a, b) => a - b)
    const n = values.length
    const mean = values.reduce((sum, val) => sum + val, 0) / n
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]
    
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    const standardDeviation = Math.sqrt(variance)

    const frequencyMap = new Map<number, number>()
    values.forEach(val => {
      frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1)
    })
    const mode = [...frequencyMap.entries()].reduce((a, b) => b[1] > a[1] ? b : a, [0, 0])[0]

    return {
      min: Math.min(...values),
      max: Math.max(...values),
      mean,
      median,
      mode,
      standardDeviation,
      variance
    }
  }

  static cleanData(data: Record<string, any>[], options: DataProcessingOptions): Record<string, any>[] {
    let cleanedData = [...data]

    if (options.removeDuplicates) {
      const seen = new Set<string>()
      cleanedData = cleanedData.filter(row => {
        const key = JSON.stringify(row)
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
    }

    if (options.handleMissingValues === 'remove') {
      cleanedData = cleanedData.filter(row => 
        Object.values(row).every(value => value !== null && value !== undefined && value !== '')
      )
    } else if (options.handleMissingValues === 'fill') {
      cleanedData = cleanedData.map(row => {
        const newRow = { ...row }
        Object.keys(newRow).forEach(key => {
          if (newRow[key] === null || newRow[key] === undefined || newRow[key] === '') {
            newRow[key] = this.getDefaultValueForColumn(data, key)
          }
        })
        return newRow
      })
    }

    if (options.normalizeData) {
      cleanedData = this.normalizeData(cleanedData)
    }

    if (options.convertDataTypes) {
      cleanedData = this.convertDataTypes(cleanedData)
    }

    return cleanedData
  }

  static getDefaultValueForColumn(data: Record<string, any>[], columnName: string): any {
    const values = data.map(row => row[columnName]).filter(v => v !== null && v !== undefined && v !== '')
    if (values.length === 0) return ''

    const firstValue = values[0]
    if (typeof firstValue === 'number') {
      const mean = values.reduce((sum, val) => sum + Number(val), 0) / values.length
      return mean
    }
    if (typeof firstValue === 'boolean') return false
    if (!isNaN(Date.parse(firstValue))) return new Date().toISOString()
    
    return ''
  }

  static normalizeData(data: Record<string, any>[]): Record<string, any>[] {
    const numericColumns = Object.keys(data[0] || {}).filter(key => {
      const values = data.map(row => row[key]).filter(v => v !== null && v !== undefined && v !== '')
      return values.length > 0 && values.every(v => !isNaN(Number(v)))
    })

    return data.map(row => {
      const newRow = { ...row }
      numericColumns.forEach(column => {
        const values = data.map(r => Number(r[column])).filter(v => !isNaN(v))
        const min = Math.min(...values)
        const max = Math.max(...values)
        if (max > min) {
          newRow[column] = (Number(row[column]) - min) / (max - min)
        }
      })
      return newRow
    })
  }

  static convertDataTypes(data: Record<string, any>[]): Record<string, any>[] {
    return data.map(row => {
      const newRow = { ...row }
      Object.keys(newRow).forEach(key => {
        const value = newRow[key]
        if (typeof value === 'string') {
          if (value.toLowerCase() === 'true') newRow[key] = true
          else if (value.toLowerCase() === 'false') newRow[key] = false
          else if (!isNaN(Number(value)) && value !== '') newRow[key] = Number(value)
          else if (!isNaN(Date.parse(value))) newRow[key] = new Date(value)
        }
      })
      return newRow
    })
  }
}