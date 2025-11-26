export interface User {
  id: string
  email: string
  name: string
  plan: 'basic' | 'premium' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface Dataset {
  id: string
  user_id: string
  name: string
  format: 'csv' | 'excel' | 'text'
  schema: Record<string, any> | null
  row_count: number
  preview: Record<string, any> | null
  file_path: string | null
  created_at: string
  updated_at: string
}

export interface Analysis {
  id: string
  dataset_id: string
  user_id: string
  type: string
  parameters: Record<string, any> | null
  results: Record<string, any> | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

export interface Visualization {
  id: string
  analysis_id: string
  chart_type: string
  configuration: Record<string, any> | null
  data: Record<string, any> | null
  embed_url: string | null
  is_public: boolean
  created_at: string
}

export interface Report {
  id: string
  analysis_id: string
  title: string
  insights: Record<string, any> | null
  recommendations: Record<string, any> | null
  export_format: string
  created_at: string
}

export interface DataColumn {
  name: string
  type: 'string' | 'number' | 'date' | 'boolean'
  values: any[]
  uniqueValues: number
  nullCount: number
  statistics?: ColumnStatistics
}

export interface ColumnStatistics {
  min?: number
  max?: number
  mean?: number
  median?: number
  mode?: any
  standardDeviation?: number
  variance?: number
  skewness?: number
  kurtosis?: number
}

export interface DataProcessingOptions {
  removeDuplicates: boolean
  handleMissingValues: 'remove' | 'fill' | 'interpolate'
  normalizeData: boolean
  convertDataTypes: boolean
}

export interface AnalysisOptions {
  type: 'statistical' | 'correlation' | 'trend' | 'pattern'
  parameters: Record<string, any>
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap'
  title: string
  xAxis?: string
  yAxis?: string
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
  source?: 'ai' | 'manual' | 'system'
}

export interface DataPoint {
  x: number | string
  y: number
  label?: string
}

export interface StatisticalResult {
  correlation: number
  pValue: number
  significance: 'high' | 'medium' | 'low'
  interpretation: string
}

export interface PatternResult {
  type: 'trend' | 'seasonal' | 'anomaly'
  description: string
  confidence: number
  recommendations: string[]
}

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'powerpoint' | 'png'
  quality: 'high' | 'medium' | 'low'
  includeCharts: boolean
  includeData: boolean
  includeInsights: boolean
}