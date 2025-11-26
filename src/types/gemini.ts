// Gemini API Integration Types

export interface GeminiPromptObject {
  userQuery: UserQuery
  dataContext: DataContext
  reportRequirements: ReportRequirements
  metadata: PromptMetadata
  securityContext?: SecurityContext
}

export interface UserQuery {
  query: string
  requirements?: string[]
  context?: string
  type?: 'insight_request' | 'report_generation' | 'data_analysis' | 'prediction'
  urgency?: 'low' | 'medium' | 'high' | 'critical'
  userRole?: 'analyst' | 'manager' | 'executive' | 'client'
  previousQueries?: string[]
}

export interface DataContext {
  datasets: Dataset[]
  metadata: {
    totalRecords: number
    dataQuality: number
    lastUpdated: string
  }
}

export interface Dataset {
  name: string
  type: string
  recordCount: number
  fields: string[]
  sampleData?: Record<string, any>
  metadata?: {
    createdAt: string
    lastModified: string
    source: string
    format: string
  }
}

export interface DatasetInfo {
  name: string
  description: string
  rowCount: number
  columnCount: number
  columns: ColumnInfo[]
  dataTypes: Record<string, 'string' | 'number' | 'date' | 'boolean' | 'category'>
  sizeInBytes: number
  lastUpdated: string
  source: string
}

export interface ColumnInfo {
  name: string
  type: string
  description?: string
  nullable: boolean
  uniqueValues?: number
  sampleValues?: any[]
}

export interface MetricDefinition {
  name: string
  type: 'count' | 'sum' | 'average' | 'percentage' | 'ratio' | 'growth_rate'
  description: string
  formula?: string
  unit?: string
  format?: 'number' | 'currency' | 'percentage' | 'duration'
}

export interface TimeRange {
  start: string
  end: string
  granularity: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  timezone: string
}

export interface DataFilter {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in'
  value: any
  logic?: 'and' | 'or'
}

export interface DataQualityIndicators {
  completeness: number
  accuracy: number
  consistency: number
  timeliness: number
  validity: number
  uniqueness: number
}

export interface StatisticalSummary {
  totalRecords: number
  numericFields: Record<string, NumericFieldStats>
  categoricalFields: Record<string, CategoricalFieldStats>
  dateFields: Record<string, DateFieldStats>
}

export interface NumericFieldStats {
  min: number
  max: number
  mean: number
  median: number
  mode?: number
  standardDeviation: number
  variance: number
  quartiles: {
    q1: number
    q2: number
    q3: number
  }
  outliers: number[]
  nullCount: number
  uniqueCount: number
}

export interface CategoricalFieldStats {
  uniqueCount: number
  mostFrequent: {
    value: string
    count: number
    percentage: number
  }[]
  nullCount: number
}

export interface DateFieldStats {
  min: string
  max: string
  range: number
  mostFrequentDay: string
  mostFrequentMonth: string
  nullCount: number
}

export interface ReportRequirements {
  reportType: string
  sections: ReportSection[]
  formatting: FormattingRequirements
  targetAudience?: 'technical' | 'business' | 'executive' | 'client'
  deliveryFormat?: 'pdf' | 'html' | 'json' | 'markdown'
}

export interface ReportSection {
  title: string
  description: string
  required: boolean
  order?: number
  subsections?: ReportSection[]
}

export interface FormattingRequirements {
  includeCharts: boolean
  includeTables: boolean
  includeMetrics: boolean
  includeRecommendations: boolean
  confidenceIndicators: boolean
  dataSources: boolean
  executiveSummary: boolean
  detailedAnalysis: boolean
  template?: string
  branding?: {
    logo?: string
    companyName?: string
    primaryColor?: string
    secondaryColor?: string
  }
}

export interface PromptMetadata {
  promptId?: string
  timestamp?: string
  version?: string
  userId?: string
  sessionId?: string
  clientInfo?: {
    userAgent: string
    ipAddress?: string
    location?: string
    deviceType?: 'desktop' | 'mobile' | 'tablet'
  }
  systemContext?: string
  tags?: string[]
  priority?: 'low' | 'medium' | 'high' | 'critical'
}

export interface SecurityContext {
  dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted'
  complianceRequirements?: string[]
  encryptionLevel?: 'none' | 'basic' | 'enhanced' | 'maximum'
  accessControls?: {
    roles: string[]
    permissions: string[]
  }
  auditTrail?: {
    enabled: boolean
    retentionPeriod: number
  }
}

export interface GeminiAPIConfig {
  apiKey: string
  model?: string
  temperature?: number
  topK?: number
  topP?: number
  maxOutputTokens?: number
  rateLimitConfig?: RateLimitConfig
  retryConfig?: RetryConfig
}

export interface GeminiInfographicResult {
  html: string
  rawResponse: string
  promptUsed: string
  summary?: string
}

export interface GeminiExecutiveSummary {
  title?: string
  key_findings?: string[]
  overall_recommendation?: string
}

export interface GeminiPerformanceMetricOverview {
  metric: string
  mean?: number
  deviation?: number
  interpretation?: string
  trend?: string
  pattern_status?: string
}

export interface GeminiPerformanceMetrics {
  title?: string
  metrics_overview?: GeminiPerformanceMetricOverview[]
  kpi_analysis?: Record<string, { status?: string; details?: string }>
}

export interface GeminiInsightPattern {
  insight: string
  description?: string
  related_metrics?: string[]
  correlation_strength?: string
}

export interface GeminiActionableRecommendation {
  priority?: string
  area?: string
  action?: string
  details?: string
  expected_outcome?: string
}

export interface GeminiRiskItem {
  risk: string
  description?: string
  mitigation_strategy?: string
}

export interface GeminiPrediction {
  trend: string
  prediction?: string
  drivers?: string[]
}

export interface GeminiSuggestedChart {
  chart_type: string
  purpose?: string
  data_points?: string[]
  x_axis?: string
  y_axis?: string
  description?: string
}

export interface GeminiVisualizationReport {
  report_type?: string
  audience?: string
  delivery_format?: string
  analysis_metadata?: Record<string, any>
  security_compliance?: Record<string, any>
  executive_summary?: GeminiExecutiveSummary
  performance_metrics?: GeminiPerformanceMetrics
  detailed_insights_patterns?: {
    title?: string
    insights?: GeminiInsightPattern[]
  }
  actionable_recommendations?: {
    title?: string
    recommendations?: GeminiActionableRecommendation[]
  }
  risk_assessment_mitigation?: {
    title?: string
    risks?: GeminiRiskItem[]
  }
  future_trend_predictions?: {
    title?: string
    predictions?: GeminiPrediction[]
  }
  data_quality_assessment?: {
    title?: string
    overall_score?: number
    interpretation?: string
    specific_observations?: string[]
    recommendations?: string[]
  }
  suggested_visualizations_charts?: {
    title?: string
    charts?: GeminiSuggestedChart[]
  }
  raw_text?: string
  promptUsed?: string
  summary?: string
}

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (request: any) => string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay?: number
  backoffMultiplier?: number
  retryCondition?: (error: any) => boolean
}

export interface ConnectionMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  rateLimitedRequests: number
  averageResponseTime: number
  lastRequestTime: Date | null
  retryAttempts: number
  tokensUsed: number
}

export interface GeminiResponse {
  success: boolean
  data: {
    insights: string[]
    recommendations: string[]
    metrics: Record<string, number>
    rawResponse: string
    confidenceScore: number
    processingTime: number
    promptTokens: number
    responseTokens: number
    totalTokens: number
  }
  metadata: {
    model: string
    version: string
    timestamp: string
    processingTime: number
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface GeminiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    retryable: boolean
  }
  metadata: {
    timestamp: string
    requestId: string
  }
}