import { StatisticalResult, PatternResult } from '../../types'

export class StatisticalAnalyzer {
  static calculateCorrelation(x: number[], y: number[]): StatisticalResult {
    if (x.length !== y.length || x.length === 0) {
      throw new Error('Arrays must have the same length and not be empty')
    }

    const n = x.length
    const meanX = x.reduce((sum, val) => sum + val, 0) / n
    const meanY = y.reduce((sum, val) => sum + val, 0) / n

    let numerator = 0
    let denominatorX = 0
    let denominatorY = 0

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX
      const diffY = y[i] - meanY
      numerator += diffX * diffY
      denominatorX += diffX * diffX
      denominatorY += diffY * diffY
    }

    const correlation = numerator / Math.sqrt(denominatorX * denominatorY)
    const tStatistic = correlation * Math.sqrt((n - 2) / (1 - correlation * correlation))
    const pValue = this.calculatePValue(tStatistic, n - 2)

    let significance: 'high' | 'medium' | 'low'
    if (pValue < 0.01) significance = 'high'
    else if (pValue < 0.05) significance = 'medium'
    else significance = 'low'

    let interpretation = ''
    if (Math.abs(correlation) >= 0.7) {
      interpretation = correlation > 0 ? 'Strong positive correlation' : 'Strong negative correlation'
    } else if (Math.abs(correlation) >= 0.3) {
      interpretation = correlation > 0 ? 'Moderate positive correlation' : 'Moderate negative correlation'
    } else {
      interpretation = 'Weak correlation'
    }

    return {
      correlation,
      pValue,
      significance,
      interpretation
    }
  }

  static calculateDescriptiveStatistics(data: number[]): {
    mean: number
    median: number
    mode: number
    standardDeviation: number
    variance: number
    min: number
    max: number
    range: number
    quartiles: { q1: number; q2: number; q3: number }
  } {
    if (data.length === 0) {
      throw new Error('Data array cannot be empty')
    }

    const sorted = [...data].sort((a, b) => a - b)
    const n = data.length

    const mean = data.reduce((sum, val) => sum + val, 0) / n
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)]

    const frequencyMap = new Map<number, number>()
    data.forEach(val => {
      frequencyMap.set(val, (frequencyMap.get(val) || 0) + 1)
    })
    const mode = [...frequencyMap.entries()].reduce((a, b) => b[1] > a[1] ? b : a, [0, 0])[0]

    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
    const standardDeviation = Math.sqrt(variance)

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min

    const q1Index = Math.floor(n * 0.25)
    const q3Index = Math.floor(n * 0.75)
    const quartiles = {
      q1: sorted[q1Index],
      q2: median,
      q3: sorted[q3Index]
    }

    return {
      mean,
      median,
      mode,
      standardDeviation,
      variance,
      min,
      max,
      range,
      quartiles
    }
  }

  static identifyOutliers(data: number[]): { outliers: number[]; cleanData: number[] } {
    const sorted = [...data].sort((a, b) => a - b)
    const n = sorted.length

    const q1Index = Math.floor(n * 0.25)
    const q3Index = Math.floor(n * 0.75)
    const q1 = sorted[q1Index]
    const q3 = sorted[q3Index]

    const iqr = q3 - q1
    const lowerBound = q1 - 1.5 * iqr
    const upperBound = q3 + 1.5 * iqr

    const outliers = data.filter(val => val < lowerBound || val > upperBound)
    const cleanData = data.filter(val => val >= lowerBound && val <= upperBound)

    return { outliers, cleanData }
  }

  static performTTest(sample1: number[], sample2: number[]): {
    tStatistic: number
    pValue: number
    degreesOfFreedom: number
    interpretation: string
  } {
    const n1 = sample1.length
    const n2 = sample2.length

    const mean1 = sample1.reduce((sum, val) => sum + val, 0) / n1
    const mean2 = sample2.reduce((sum, val) => sum + val, 0) / n2

    const var1 = sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1)
    const var2 = sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1)

    const pooledVariance = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2)
    const standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2))

    const tStatistic = (mean1 - mean2) / standardError
    const degreesOfFreedom = n1 + n2 - 2
    const pValue = this.calculatePValue(Math.abs(tStatistic), degreesOfFreedom)

    let interpretation = ''
    if (pValue < 0.01) {
      interpretation = 'Highly significant difference between groups'
    } else if (pValue < 0.05) {
      interpretation = 'Significant difference between groups'
    } else {
      interpretation = 'No significant difference between groups'
    }

    return {
      tStatistic,
      pValue,
      degreesOfFreedom,
      interpretation
    }
  }

  static identifyPatterns(data: number[], labels?: string[]): PatternResult[] {
    const patterns: PatternResult[] = []

    // Trend analysis
    const trend = this.analyzeTrend(data)
    if (trend.confidence > 0.7) {
      patterns.push({
        type: 'trend',
        description: trend.description,
        confidence: trend.confidence,
        recommendations: trend.recommendations
      })
    }

    // Seasonal analysis (if labels are provided)
    if (labels && labels.length === data.length) {
      const seasonal = this.analyzeSeasonality(data, labels)
      if (seasonal.confidence > 0.6) {
        patterns.push({
          type: 'seasonal',
          description: seasonal.description,
          confidence: seasonal.confidence,
          recommendations: seasonal.recommendations
        })
      }
    }

    // Anomaly detection
    const anomalies = this.detectAnomalies(data)
    if (anomalies.length > 0) {
      patterns.push({
        type: 'anomaly',
        description: `Found ${anomalies.length} anomalous data points`,
        confidence: 0.9,
        recommendations: [
          'Investigate anomalous data points for data quality issues',
          'Consider removing outliers if they are data entry errors',
          'Analyze the context around anomalous periods'
        ]
      })
    }

    return patterns
  }

  private static analyzeTrend(data: number[]): {
    description: string
    confidence: number
    recommendations: string[]
  } {
    const n = data.length
    if (n < 3) return { description: 'Insufficient data for trend analysis', confidence: 0, recommendations: [] }

    const x = Array.from({ length: n }, (_, i) => i)
    const correlation = this.calculateCorrelation(x, data).correlation

    let description = ''
    let recommendations: string[] = []

    if (correlation > 0.7) {
      description = 'Strong upward trend detected'
      recommendations = [
        'Capitalize on the positive trend momentum',
        'Investigate factors driving the upward movement',
        'Consider increasing investment in areas showing growth'
      ]
    } else if (correlation < -0.7) {
      description = 'Strong downward trend detected'
      recommendations = [
        'Investigate causes of the declining trend',
        'Implement corrective measures to reverse the decline',
        'Consider reallocating resources from declining areas'
      ]
    } else if (Math.abs(correlation) > 0.3) {
      description = correlation > 0 ? 'Moderate upward trend' : 'Moderate downward trend'
      recommendations = ['Monitor the trend for further development']
    } else {
      description = 'No significant trend detected'
      recommendations = ['Focus on other patterns and insights']
    }

    return {
      description,
      confidence: Math.abs(correlation),
      recommendations
    }
  }

  private static analyzeSeasonality(data: number[], labels: string[]): {
    description: string
    confidence: number
    recommendations: string[]
  } {
    // Simple seasonal analysis - in a real implementation, this would be more sophisticated
    const monthlyData: { [key: string]: number[] } = {}
    
    labels.forEach((label, index) => {
      const month = label.split('-')[0] // Assume format like "Jan-2023"
      if (!monthlyData[month]) monthlyData[month] = []
      monthlyData[month].push(data[index])
    })

    const monthlyAverages = Object.entries(monthlyData).map(([month, values]) => ({
      month,
      average: values.reduce((sum, val) => sum + val, 0) / values.length
    }))

    const maxMonth = monthlyAverages.reduce((a, b) => b.average > a.average ? b : a)
    const minMonth = monthlyAverages.reduce((a, b) => b.average < a.average ? b : a)

    const variance = this.calculateDescriptiveStatistics(monthlyAverages.map(m => m.average)).variance
    const confidence = Math.min(1, variance / 100)

    return {
      description: `Seasonal pattern detected with peak in ${maxMonth.month} and low in ${minMonth.month}`,
      confidence,
      recommendations: [
        `Plan marketing campaigns for ${maxMonth.month} when performance peaks`,
        `Investigate causes of low performance in ${minMonth.month}`,
        'Consider seasonal adjustments to forecasts'
      ]
    }
  }

  private static detectAnomalies(data: number[]): number[] {
    const { outliers } = this.identifyOutliers(data)
    return outliers
  }

  private static calculatePValue(tStatistic: number, degreesOfFreedom: number): number {
    // Simplified p-value calculation using t-distribution approximation
    // In a real implementation, you'd use a proper statistical library
    const a = degreesOfFreedom - 0.5
    const b = 48 * a * a
    const t = tStatistic * tStatistic
    
    if (t >= 250 || degreesOfFreedom === 1) {
      return 2 * (1 - this.normalCDF(Math.abs(tStatistic)))
    }
    
    const u = (1 + t / degreesOfFreedom) ** (-0.5)
    const tu = Math.sqrt(t / degreesOfFreedom)
    
    let result = 0.0
    let term = 1.0
    let i = 0
    
    while (term > 1e-10 && i < 100) {
      term = this.betaInc(a, 0.5, u)
      result += term
      i++
    }
    
    return 2 * result
  }

  private static normalCDF(x: number): number {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)))
  }

  private static erf(x: number): number {
    const a1 =  0.254829592
    const a2 = -0.284496736
    const a3 =  1.421413741
    const a4 = -1.453152027
    const a5 =  1.061405429
    const p  =  0.3275911

    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)

    const t = 1.0 / (1.0 + p * x)
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
  }

  private static betaInc(a: number, b: number, x: number): number {
    // Simplified incomplete beta function
    // In a real implementation, you'd use a proper statistical library
    return Math.pow(x, a) * Math.pow(1 - x, b) / (a * this.beta(a, b))
  }

  private static beta(a: number, b: number): number {
    return this.gamma(a) * this.gamma(b) / this.gamma(a + b)
  }

  private static gamma(n: number): number {
    // Simplified gamma function for positive integers and half-integers
    if (n === 0.5) return Math.sqrt(Math.PI)
    if (n === 1) return 1
    if (n > 1) return (n - 1) * this.gamma(n - 1)
    return this.gamma(n + 1) / n
  }
}