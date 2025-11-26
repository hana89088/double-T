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

type SourceChartConfig = ChartConfig & { source?: 'ai' | 'manual' | 'system' }

export default function Visualization() {
  const { processedData, ready } = useDataStore()
  const preparedData = useMemo(() => processedData.map((row, index) => ({ __index: index + 1, ...row })), [processedData])
  const [chartConfigs, setChartConfigs] = useState<SourceChartConfig[]>([])
  const [activeChart, setActiveChart] = useState(0)
  const [showAiOnly, setShowAiOnly] = useState(true)
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

    const newConfig: SourceChartConfig = {
      type,
      title: suggestion.purpose || suggestion.chart_type || 'AI Chart',
      xAxis: xAxisCandidate,
      yAxis: yAxisCandidate,
      colors: ['#2563EB', '#10B981', '#F59E0B'],
      showLegend: true,
      showGrid: true,
      source: 'ai',
    }

    setChartConfigs((prev) => {
      const updated = [...prev, newConfig]
      const filtered = showAiOnly ? updated.filter((cfg) => cfg.source === 'ai') : updated
      setActiveChart(Math.max(0, filtered.length - 1))
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
          title: 'AI-ready Overview',
          xAxis: defaultXAxis,
          yAxis: defaultYAxis,
          colors: ['#2563EB'],
          showLegend: true,
          showGrid: true,
          source: 'ai',
        },
      ])
      setActiveChart(0)
      return
    }

    const needsAxisBackfill = chartConfigs.some((config) => !config.xAxis || !config.yAxis)
    if (!needsAxisBackfill) return

    setChartConfigs((prev) =>
      prev.map((config) => ({
        ...config,
        xAxis: config.xAxis || defaultXAxis,
        yAxis: config.yAxis || defaultYAxis,
      }))
    )
  }, [chartConfigs, defaultXAxis, defaultYAxis, hasData])

  const visibleCharts = useMemo(() => {
    if (!showAiOnly) return chartConfigs
    const aiCharts = chartConfigs.filter((config) => config.source === 'ai')
    return aiCharts.length ? aiCharts : chartConfigs
  }, [chartConfigs, showAiOnly])

  useEffect(() => {
    if (activeChart >= visibleCharts.length) {
      setActiveChart(visibleCharts.length > 0 ? visibleCharts.length - 1 : 0)
    }
  }, [activeChart, visibleCharts])

  const updateChartConfig = (config: SourceChartConfig) => {
    const targetConfig = visibleCharts[activeChart]
    if (!targetConfig) return
    const targetIndex = chartConfigs.findIndex((cfg) => cfg === targetConfig)
    if (targetIndex === -1) return
    const newConfigs = [...chartConfigs]
    newConfigs[targetIndex] = config
    setChartConfigs(newConfigs)
  }

  const addChart = () => {
    const newConfig: SourceChartConfig = {
      type: 'bar',
      title: 'New Manual Chart',
      xAxis: defaultXAxis,
      yAxis: defaultYAxis,
      colors: ['#F59E0B'],
      showLegend: true,
      showGrid: true,
      source: 'manual',
    }
    setChartConfigs((prev) => {
      const updated = [...prev, newConfig]
      const filtered = showAiOnly ? updated.filter((cfg) => cfg.source === 'ai') : updated
      setActiveChart(Math.max(0, filtered.length - 1))
      return updated
    })
  }

  const removeChart = (config: SourceChartConfig) => {
    if (chartConfigs.length <= 1) return

    setChartConfigs((prev) => {
      const newConfigs = prev.filter((item) => item !== config)
      const filtered = showAiOnly ? newConfigs.filter((cfg) => cfg.source === 'ai') : newConfigs
      const nextIndex = Math.max(0, Math.min(activeChart, filtered.length - 1))
      setActiveChart(nextIndex)
      return newConfigs
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col gap-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white shadow-md">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm uppercase tracking-wide text-blue-100">AI Dashboard</p>
              <h1 className="text-3xl font-semibold leading-tight">Visualization Studio</h1>
              <p className="mt-1 max-w-3xl text-sm text-blue-50">
                Giao diện được rút gọn, ưu tiên biểu đồ do AI đề xuất để loại bỏ dashboard dư thừa và hiển thị tốt trên mọi thiết bị.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAiOnly((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/25"
              >
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                {showAiOnly ? 'Chỉ hiển thị dashboard AI' : 'Hiển thị tất cả dashboard'}
              </button>
              <button
                onClick={handleGenerateAiReport}
                disabled={isGeneratingAiReport || !hasData}
                className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isGeneratingAiReport ? 'Đang tạo báo cáo...' : 'Tạo báo cáo AI JSON'}
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <p className="text-blue-100">Bước 1</p>
              <p className="font-semibold">Sinh báo cáo AI và gợi ý biểu đồ</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <p className="text-blue-100">Bước 2</p>
              <p className="font-semibold">Dùng gợi ý để tạo dashboard hợp lệ</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3 text-sm">
              <p className="text-blue-100">Bước 3</p>
              <p className="font-semibold">Điều chỉnh nhẹ, giữ bố cục gọn</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-blue-100 shadow rounded-2xl p-4 space-y-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Visualization Brief (JSON)</h2>
              <p className="text-sm text-gray-600">
                Gemini trả về JSON chuẩn hóa (executive_summary, suggested_visualizations_charts, ...) để tái sử dụng cho Visualization Studio và Reports & Analytics.
              </p>
            </div>
            <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full font-semibold w-fit">Ưu tiên dashboard do AI đề xuất</span>
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
                    <p className="font-semibold text-slate-900">Gợi ý biểu đồ (áp dụng trực tiếp)</p>
                    {aiReport.suggested_visualizations_charts?.charts?.map((chart, idx) => (
                      <div key={idx} className="border border-slate-200 rounded p-2 bg-white space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{chart.chart_type}</p>
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">AI</span>
                        </div>
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
                    {!aiReport.suggested_visualizations_charts?.charts?.length && (
                      <p className="text-xs text-slate-500">Tạo báo cáo AI để nhận dashboard đề xuất.</p>
                    )}
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
                    {visibleCharts.map((config, index) => (
                      <div
                        key={index}
                        className={`
                        p-2 rounded cursor-pointer transition-colors
                        ${activeChart === index ? 'bg-blue-100 border-blue-300' : 'bg-gray-50 border-gray-200'}
                        border
                      `}
                        onClick={() => setActiveChart(index)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate">
                            <span className="text-sm font-medium truncate">
                              {config.title}
                            </span>
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap">
                              {config.source === 'ai' ? 'AI' : 'Thủ công'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeChart(config)
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
                    {!visibleCharts.length && (
                      <p className="text-xs text-slate-500">Chưa có dashboard hợp lệ. Hãy tạo báo cáo AI để thêm biểu đồ.</p>
                    )}
                  </div>
                  {!showAiOnly && (
                    <button
                      onClick={addChart}
                      className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      + Thêm chart thủ công
                    </button>
                  )}
                </div>

                {/* Chart Configuration */}
                {visibleCharts[activeChart] && (
                  <ChartConfigPanel
                    config={visibleCharts[activeChart]}
                    onConfigChange={(config) => updateChartConfig(config)}
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
                    />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {visibleCharts.map((config, index) => (
                      <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                        <InteractiveChart
                          data={filteredData}
                          config={config}
                          onConfigChange={updateChartConfig}
                        />
                      </div>
                    ))}
                    {!visibleCharts.length && (
                      <p className="text-sm text-slate-500">Chưa có dashboard do AI đề xuất để hiển thị.</p>
                    )}
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
