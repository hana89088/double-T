import { useEffect, useMemo, useState } from 'react'
import Navigation from '../../components/layout/Navigation'
import InteractiveChart from '../../components/charts/InteractiveChart'
import ChartConfigPanel from '../../components/charts/ChartConfigPanel'
import Heatmap from '../../components/charts/Heatmap'
import { ChartConfig } from '../../types'
import { useDataStore } from '../../stores/dataStore'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GeminiStructuredReport } from '@/types/gemini'
import { GeminiAPIService } from '@/services/gemini/GeminiAPIService'
import { getGeminiConfig } from '@/config/gemini'
import { toast } from 'sonner'

const correlation = (data: Record<string, any>[], a: string, b: string) => {
  const pairs = data
    .map((row) => [Number(row[a]), Number(row[b])])
    .filter(([x, y]) => !isNaN(x) && !isNaN(y))

  if (pairs.length < 2) return 0

  const meanA = pairs.reduce((sum, [x]) => sum + x, 0) / pairs.length
  const meanB = pairs.reduce((sum, [, y]) => sum + y, 0) / pairs.length
  const cov = pairs.reduce((sum, [x, y]) => sum + (x - meanA) * (y - meanB), 0)
  const stdA = Math.sqrt(pairs.reduce((sum, [x]) => sum + Math.pow(x - meanA, 2), 0))
  const stdB = Math.sqrt(pairs.reduce((sum, [, y]) => sum + Math.pow(y - meanB, 2), 0))

  if (stdA === 0 || stdB === 0) return 0
  return cov / (stdA * stdB)
}

export default function Visualization() {
  const { processedData, ready } = useDataStore()
  const preparedData = useMemo(() => processedData.map((row, index) => ({ __index: index + 1, ...row })), [processedData])
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([])
  const [activeChart, setActiveChart] = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [filters, setFilters] = useState<{ categoryColumn?: string; selectedCategories?: string[]; rangeColumn?: string; min?: number; max?: number }>({})
  const [aiReport, setAiReport] = useState<GeminiStructuredReport | null>(null)
  const [aiReportError, setAiReportError] = useState<string | null>(null)
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false)

  const hasData = ready && preparedData.length > 0
  const columns = useMemo(() => (preparedData[0] ? Object.keys(preparedData[0]) : []), [preparedData])
  const numericColumns = useMemo(
    () => columns.filter((c) => preparedData.every((row) => row[c] === null || row[c] === undefined || row[c] === '' || !isNaN(Number(row[c])))),
    [columns, preparedData]
  )
  const categoryColumns = useMemo(
    () => columns.filter((c) => preparedData.some((row) => typeof row[c] === 'string')),
    [columns, preparedData]
  )

  const defaultXAxis = categoryColumns[0] ?? '__index'
  const defaultYAxis = numericColumns[0] ?? '__index'
  const secondaryYAxis = numericColumns[1] ?? numericColumns[0] ?? '__index'

  const filteredData = useMemo(() => {
    if (!hasData) return []
    return preparedData.filter((row: any) => {
      if (filters.categoryColumn && filters.selectedCategories && filters.selectedCategories.length) {
        if (!filters.selectedCategories.includes(String(row[filters.categoryColumn]))) return false
      }
      if (filters.rangeColumn) {
        const v = Number(row[filters.rangeColumn])
        if (!isNaN(v)) {
          if (filters.min !== undefined && v < (filters.min as number)) return false
          if (filters.max !== undefined && v > (filters.max as number)) return false
        }
      }
      return true
    })
  }, [filters, hasData, preparedData])

  const heatmapData = useMemo(() => {
    if (numericColumns.length < 2 || !hasData) return []
    return numericColumns.map((colA) => numericColumns.map((colB) => correlation(preparedData, colA, colB)))
  }, [hasData, numericColumns, preparedData])

  const mapChartType = (chartType?: string): ChartConfig['type'] => {
    if (!chartType) return 'bar'
    const normalized = chartType.toLowerCase()
    if (normalized.includes('line')) return 'line'
    if (normalized.includes('pie') || normalized.includes('donut')) return 'pie'
    if (normalized.includes('scatter')) return 'scatter'
    if (normalized.includes('heat')) return 'heatmap'
    return 'bar'
  }

  const applySuggestedChart = (index: number) => {
    const suggestion = aiReport?.suggested_visualizations_charts?.charts?.[index]
    if (!suggestion) return

    const type = mapChartType(suggestion.chart_type)
    const xAxisCandidate = suggestion.x_axis || categoryColumns[0] || '__index'
    const yAxisCandidate = suggestion.data_points?.find((p) => numericColumns.includes(p)) || numericColumns[0] || '__index'

    const newConfig: ChartConfig = {
      type,
      title: suggestion.purpose || suggestion.chart_type || 'AI Chart',
      xAxis: xAxisCandidate,
      yAxis: yAxisCandidate,
      colors: ['#2563EB', '#10B981', '#F59E0B'],
      showLegend: true,
      showGrid: true,
    }

    setChartConfigs((prev) => {
      const updated = [...prev, newConfig]
      setActiveChart(updated.length - 1)
      return updated
    })
    toast.success('Đã thêm chart từ gợi ý AI')
  }

  const handleGenerateAiReport = async () => {
    if (!hasData) {
      const message = 'Chưa có dữ liệu để tạo báo cáo AI cho Visualization. Vui lòng upload dữ liệu trước.'
      setAiReportError(message)
      toast.error(message)
      return
    }

    setIsGeneratingAiReport(true)
    setAiReportError(null)

    try {
      const cfg = getGeminiConfig()
      if (!cfg.apiKey) {
        throw new Error('Gemini API key chưa được cấu hình để tạo báo cáo AI')
      }

      const service = new GeminiAPIService(cfg)
      const report = await service.generateStructuredReportFromData(preparedData.slice(0, 120), {
        reportType: 'visualization_brief',
        audience: 'analyst',
        prompt:
          'Return JSON only. Include executive summary, insights, and suggested_visualizations_charts with chart_type, purpose, data_points, x_axis, y_axis.',
      })

      setAiReport(report)
      toast.success('Đã tạo báo cáo AI JSON cho Visualization Studio!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo báo cáo AI từ Gemini'
      setAiReportError(message)
      toast.error(message)
    } finally {
      setIsGeneratingAiReport(false)
    }
  }

  useEffect(() => {
    if (!hasData) {
      setChartConfigs([])
      setActiveChart(0)
      return
    }

    if (chartConfigs.length === 0) {
      setChartConfigs([
        {
          type: 'bar',
          title: 'Bar Chart',
          xAxis: defaultXAxis,
          yAxis: defaultYAxis,
          colors: ['#3B82F6'],
          showLegend: true,
          showGrid: true,
        },
        {
          type: 'line',
          title: 'Line Chart',
          xAxis: defaultXAxis,
          yAxis: secondaryYAxis,
          colors: ['#10B981'],
          showLegend: true,
          showGrid: true,
        },
      ])
      setActiveChart(0)
      return
    }

    setChartConfigs((prev) =>
      prev.map((config) => ({
        ...config,
        xAxis: config.xAxis || defaultXAxis,
        yAxis: config.yAxis || defaultYAxis,
      }))
    )
  }, [chartConfigs.length, defaultXAxis, defaultYAxis, hasData, secondaryYAxis])

  const updateChartConfig = (index: number, config: ChartConfig) => {
    const newConfigs = [...chartConfigs]
    newConfigs[index] = config
    setChartConfigs(newConfigs)
  }

  const addChart = () => {
    const newConfig: ChartConfig = {
      type: 'bar',
      title: 'New Chart',
      xAxis: defaultXAxis,
      yAxis: defaultYAxis,
      colors: ['#F59E0B'],
      showLegend: true,
      showGrid: true,
    }
    setChartConfigs([...chartConfigs, newConfig])
    setActiveChart(chartConfigs.length)
  }

  const removeChart = (index: number) => {
    if (chartConfigs.length > 1) {
      const newConfigs = chartConfigs.filter((_, i) => i !== index)
      setChartConfigs(newConfigs)
      if (activeChart >= newConfigs.length) {
        setActiveChart(newConfigs.length - 1)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visualization Studio</h1>
          <p className="mt-2 text-gray-600">
            Create interactive charts and visualizations from your data.
          </p>
        </div>

        <div className="mb-6 bg-white border border-blue-100 shadow rounded-lg p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Visualization Brief (JSON)</h2>
              <p className="text-sm text-gray-600">
                Gemini trả về JSON chuẩn hóa (executive_summary, suggested_visualizations_charts, ...) để tái sử dụng cho Visualization Studio và Reports & Analytics.
              </p>
            </div>
            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingAiReport || !hasData}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {isGeneratingAiReport ? 'Đang tạo báo cáo...' : 'Tạo báo cáo AI JSON'}
            </button>
          </div>
          {(aiReportError || aiReport) && (
            <div className="mt-3 space-y-3">
              {aiReportError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{aiReportError}</div>
              )}
              {aiReport && (
                <div className="grid gap-3 lg:grid-cols-3">
                  <div className="lg:col-span-2 space-y-2">
                    {aiReport.executive_summary?.title && (
                      <div className="rounded border border-slate-200 bg-slate-50 p-3">
                        <p className="font-semibold text-slate-900">{aiReport.executive_summary.title}</p>
                        <ul className="mt-2 list-disc list-inside text-sm text-slate-700 space-y-1">
                          {aiReport.executive_summary.key_findings?.map((f, idx) => (
                            <li key={idx}>{f}</li>
                          ))}
                        </ul>
                        {aiReport.executive_summary.overall_recommendation && (
                          <p className="mt-2 text-sm text-slate-800 font-medium">{aiReport.executive_summary.overall_recommendation}</p>
                        )}
                      </div>
                    )}
                    {aiReport.detailed_insights_patterns?.insights && (
                      <div className="rounded border border-slate-200 bg-white p-3 space-y-1">
                        <p className="font-semibold text-slate-900">Insights</p>
                        {aiReport.detailed_insights_patterns.insights.map((insight, idx) => (
                          <div key={idx} className="text-sm text-slate-700">
                            <span className="font-medium">{insight.insight}: </span>
                            {insight.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-slate-900">Gợi ý biểu đồ (có thể áp dụng trực tiếp)</p>
                    {aiReport.suggested_visualizations_charts?.charts?.map((chart, idx) => (
                      <div key={idx} className="border border-slate-200 rounded p-2 bg-white space-y-1">
                        <p className="text-sm font-semibold text-slate-900">{chart.chart_type}</p>
                        {chart.purpose && <p className="text-xs text-slate-600">{chart.purpose}</p>}
                        {chart.data_points?.length && (
                          <p className="text-xs text-slate-500">Dữ liệu: {chart.data_points.join(', ')}</p>
                        )}
                        {(chart.x_axis || chart.y_axis) && (
                          <p className="text-xs text-slate-500">Trục: {chart.x_axis || 'x'} / {chart.y_axis || 'y'}</p>
                        )}
                        <button
                          className="text-xs text-blue-700 underline"
                          onClick={() => applySuggestedChart(idx)}
                        >
                          Dùng gợi ý này
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!hasData ? (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>
              No processed dataset found. Please upload data in the Data Input step and finish preprocessing to unlock visualizations based on your real data.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Chart Configuration Panel */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                {/* Chart Selector */}
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Charts</h3>
                  <div className="space-y-2">
                    {chartConfigs.map((config, index) => (
                      <div
                        key={index}
                        className={`
                        p-2 rounded cursor-pointer transition-colors
                        ${activeChart === index ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}
                        border
                      `}
                        onClick={() => setActiveChart(index)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium truncate">
                            {config.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeChart(index)
                            }}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                        <span className="text-xs text-gray-500 capitalize">
                          {config.type} Chart
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addChart}
                    className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    + Add Chart
                  </button>
                </div>

                {/* Chart Configuration */}
                {chartConfigs[activeChart] && (
                  <ChartConfigPanel
                    config={chartConfigs[activeChart]}
                    onConfigChange={(config) => updateChartConfig(activeChart, config)}
                    data={preparedData}
                    onFiltersChange={(f) => setFilters((prev) => ({ ...prev, ...f }))}
                  />
                )}

                {/* Visualization Type Toggle */}
                <div className="bg-white shadow rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Visualization Type</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowHeatmap(false)}
                      className={`
                      w-full p-2 text-left rounded transition-colors
                      ${!showHeatmap ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                    >
                      Charts & Graphs
                    </button>
                    <button
                      onClick={() => setShowHeatmap(true)}
                      className={`
                      w-full p-2 text-left rounded transition-colors
                      ${showHeatmap ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                      disabled={heatmapData.length === 0}
                    >
                      Heatmap
                    </button>
                    {heatmapData.length === 0 && (
                      <p className="text-xs text-gray-500">Upload dữ liệu có từ hai cột số trở lên để xem heatmap tương quan.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main Visualization Area */}
            <div className="lg:col-span-3">
              <div className="bg-white shadow rounded-lg p-6">
                {showHeatmap ? (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Correlation Heatmap</h3>
                    <Heatmap
                      data={heatmapData}
                      title="Correlation Matrix"
                      width={800}
                      height={500}
                    />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {chartConfigs.map((config, index) => (
                      <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                        <InteractiveChart
                          data={filteredData}
                          config={config}
                          onConfigChange={(newConfig) => updateChartConfig(index, newConfig)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <div className="space-x-4">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Save Dashboard
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Export Charts
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
