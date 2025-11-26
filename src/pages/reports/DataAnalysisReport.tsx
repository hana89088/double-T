import React, { useMemo, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ResponsiveContainer } from 'recharts'
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Download, Loader2, Sparkles } from 'lucide-react'
import * as XLSX from 'xlsx'
import JsPdfFallback from '@/utils/jsPdfFallback'
import { useDataStore } from '@/stores/dataStore'
import { GeminiAPIService } from '@/services/gemini/GeminiAPIService'
import { getGeminiConfig } from '@/config/gemini'
import { GeminiStructuredReport } from '@/types/gemini'
import { toast } from 'sonner'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

type DataRow = Record<string, any>

const toNumberArray = (rows: DataRow[], key?: string) => {
  if (!key) return []
  return rows
    .map((row) => Number(row[key]))
    .filter((value) => !isNaN(value))
}

export default function DataAnalysisReport() {
  const { processedData, ready } = useDataStore()
  const normalizedData = useMemo(() => processedData.map((row, index) => ({ __index: index + 1, ...row })), [processedData])
  const [selectedChart, setSelectedChart] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [infographicHtml, setInfographicHtml] = useState<string | null>(null)
  const [infographicError, setInfographicError] = useState<string | null>(null)
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false)
  const [structuredReport, setStructuredReport] = useState<GeminiStructuredReport | null>(null)
  const [structuredReportError, setStructuredReportError] = useState<string | null>(null)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)

  const columns = useMemo(() => (normalizedData[0] ? Object.keys(normalizedData[0]) : []), [normalizedData])
  const numericColumns = useMemo(
    () => columns.filter((col) => normalizedData.every((row) => row[col] === null || row[col] === undefined || row[col] === '' || !isNaN(Number(row[col])))),
    [columns, normalizedData]
  )
  const categoryColumns = useMemo(
    () => columns.filter((col) => normalizedData.some((row) => typeof row[col] === 'string')),
    [columns, normalizedData]
  )

  const hasData = ready && normalizedData.length > 0
  const primaryMetric = numericColumns[0]
  const secondaryMetric = numericColumns[1] ?? numericColumns[0]
  const categoryKey = categoryColumns[0]

  useEffect(() => {
    if (!hasData) {
      setError('Chưa có dữ liệu thực tế. Vui lòng upload và xử lý dữ liệu trước khi xem báo cáo.')
    } else {
      setError(null)
    }
  }, [hasData])

  const summarizeColumn = (key?: string, aggregator: (values: number[]) => number = (values) => values.reduce((s, v) => s + v, 0)) => {
    if (!key) return 0
    const values = toNumberArray(normalizedData, key)
    if (values.length === 0) return 0
    return aggregator(values)
  }

  const totalRecords = normalizedData.length
  const totalFields = columns.length
  const primaryTotal = summarizeColumn(primaryMetric)
  const primaryAverage = summarizeColumn(primaryMetric, (values) => values.reduce((s, v) => s + v, 0) / values.length)
  const secondaryAverage = summarizeColumn(secondaryMetric, (values) => values.reduce((s, v) => s + v, 0) / values.length)

  const buildCategoryBreakdown = () => {
    if (!categoryKey || !primaryMetric) return [] as { name: string; value: number }[]
    const grouped = normalizedData.reduce((acc, row) => {
      const name = row[categoryKey] ? String(row[categoryKey]) : 'Unknown'
      const value = Number(row[primaryMetric])
      if (!isNaN(value)) {
        acc[name] = (acc[name] || 0) + value
      }
      return acc
    }, {} as Record<string, number>)
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }

  const handleExportJSON = () => {
    if (!hasData) return
    const reportData = {
      summary: {
        totalRecords,
        totalFields,
        primaryMetric,
        secondaryMetric,
        primaryTotal,
        primaryAverage,
        secondaryAverage,
      },
      datasetPreview: normalizedData.slice(0, 50),
      categoryBreakdown: categoryKey ? buildCategoryBreakdown() : [],
      generatedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'marketing-analysis-report.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    if (!hasData) return
    const rows = [columns, ...normalizedData.map((row) => columns.map((col) => row[col]))]
    const csv = rows.map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'marketing-analysis-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportExcel = () => {
    if (!hasData) return
    const ws = XLSX.utils.json_to_sheet(normalizedData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Analysis')
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'marketing-analysis-report.xlsx'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    if (!hasData) return
    const doc = new JsPdfFallback({ unit: 'pt', format: 'a4' })
    doc.setFontSize(16)
    doc.text('Marketing Analysis Report', 40, 40)
    doc.setFontSize(12)
    const lines = [
      `Generated: ${new Date().toLocaleString()}`,
      `Records: ${totalRecords.toLocaleString()}`,
      `Fields: ${totalFields.toLocaleString()}`,
      primaryMetric ? `${primaryMetric} (sum): ${primaryTotal.toLocaleString()}` : 'No numeric metric detected',
      primaryMetric ? `${primaryMetric} (avg): ${primaryAverage.toFixed(2)}` : '',
    ]
    let y = 70
    lines.forEach((l) => {
      if (l) {
        doc.text(l, 40, y)
        y += 18
      }
    })
    doc.save('marketing-analysis-report.pdf')
  }

  const handleGenerateInfographic = async () => {
    if (!hasData) {
      const message = 'Chưa có dữ liệu để tạo infographic. Vui lòng upload và xử lý dữ liệu trước.'
      setInfographicError(message)
      toast.error(message)
      return
    }

    setIsGeneratingInfographic(true)
    setInfographicError(null)

    try {
      const cfg = getGeminiConfig()
      if (!cfg.apiKey) {
        throw new Error('Gemini API key chưa được cấu hình để tạo infographic')
      }

      const service = new GeminiAPIService(cfg)
      const infographic = await service.generateInfographicFromData(normalizedData.slice(0, 100), {
        prompt: 'create HTML CSS infographic overview analysis data',
        title: 'Infographic dữ liệu marketing dựa trên dữ liệu của bạn',
        context: 'Tạo layout gọn gàng, responsive, dùng inline CSS, không dùng script hoặc tài nguyên ngoài.',
      })

      setInfographicHtml(infographic.html)
      toast.success('Đã tạo infographic AI từ dữ liệu thực tế!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo infographic từ Gemini'
      setInfographicError(message)
      toast.error(message)
    } finally {
      setIsGeneratingInfographic(false)
    }
  }

  const handleGenerateStructuredReport = async () => {
    if (!hasData) {
      const message = 'Chưa có dữ liệu để tạo báo cáo AI. Vui lòng upload và xử lý dữ liệu trước.'
      setStructuredReportError(message)
      toast.error(message)
      return
    }

    setIsGeneratingReport(true)
    setStructuredReportError(null)

    try {
      const cfg = getGeminiConfig()
      if (!cfg.apiKey) {
        throw new Error('Gemini API key chưa được cấu hình để tạo báo cáo AI')
      }

      const service = new GeminiAPIService(cfg)
      const report = await service.generateStructuredReportFromData(normalizedData.slice(0, 120), {
        reportType: 'marketing_insights',
        audience: 'business',
        prompt: 'Return JSON analysis only. No markdown. Provide insights, KPIs, recommendations, and suggested charts.',
      })

      setStructuredReport(report)
      toast.success('Đã tạo báo cáo AI ở định dạng JSON!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo báo cáo JSON từ Gemini'
      setStructuredReportError(message)
      toast.error(message)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const renderReportSection = (title: string, content?: React.ReactNode) => {
    if (!content) return null
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h4 className="font-semibold text-slate-900 mb-3">{title}</h4>
        <div className="text-sm text-slate-700 space-y-2">{content}</div>
      </div>
    )
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={normalizedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={categoryKey || '__index'} />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            typeof value === 'number' ? value.toLocaleString() : value,
            name,
          ]}
        />
        <Legend />
        {primaryMetric && <Bar dataKey={primaryMetric} fill="#3B82F6" name={primaryMetric} />}
        {secondaryMetric && secondaryMetric !== primaryMetric && (
          <Bar dataKey={secondaryMetric} fill="#10B981" name={secondaryMetric} />
        )}
      </BarChart>
    </ResponsiveContainer>
  )

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={normalizedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={categoryKey || '__index'} />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            typeof value === 'number' ? value.toLocaleString() : value,
            name,
          ]}
        />
        <Legend />
        {primaryMetric && (
          <Line type="monotone" dataKey={primaryMetric} stroke="#F59E0B" strokeWidth={3} name={primaryMetric} />
        )}
        {secondaryMetric && secondaryMetric !== primaryMetric && (
          <Line type="monotone" dataKey={secondaryMetric} stroke="#EF4444" strokeWidth={3} name={secondaryMetric} />
        )}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={buildCategoryBreakdown()}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
        >
          {buildCategoryBreakdown().map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value.toLocaleString?.() ?? value}`, 'Tỷ lệ']} />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderScatterChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <ScatterChart data={normalizedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={primaryMetric || '__index'} name={primaryMetric || 'Index'} />
        <YAxis dataKey={secondaryMetric || '__index'} name={secondaryMetric || 'Value'} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          formatter={(value, name) => [
            typeof value === 'number' ? value.toLocaleString() : value,
            name,
          ]}
        />
        <Scatter name="Mối quan hệ" dataKey={secondaryMetric || primaryMetric} fill="#8B5CF6" />
      </ScatterChart>
    </ResponsiveContainer>
  )

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Báo cáo Phân tích Marketing</h1>
          <p className="text-gray-600">Phân tích chi tiết dữ liệu marketing với trực quan hóa dựa trên dữ liệu bạn upload</p>
        </div>

        {/* AI Infographic generator */}
        <Card className="mb-8 border-blue-100 shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">Báo cáo AI (JSON) & Infographic từ dữ liệu thực tế</CardTitle>
              </div>
              <p className="text-sm text-gray-600">
                Gửi dữ liệu đã upload lên Gemini để nhận JSON phân tích chuẩn hóa và/hoặc HTML infographic. JSON có thể dùng lại
                cho Visualization Studio và Reports & Analytics.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleGenerateStructuredReport} disabled={isGeneratingReport || !hasData} variant="secondary">
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo báo cáo JSON...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tạo báo cáo AI (JSON)
                  </>
                )}
              </Button>
              <Button onClick={handleGenerateInfographic} disabled={isGeneratingInfographic || !hasData}>
                {isGeneratingInfographic ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo infographic...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tạo infographic AI
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {(structuredReportError || structuredReport || infographicError || infographicHtml) && (
            <CardContent className="space-y-4">
              {structuredReportError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {structuredReportError}
                </div>
              )}
              {structuredReport && (
                <div className="space-y-3">
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                    JSON đã được phân tích và hiển thị trực tiếp. Có thể tái sử dụng cho Visualization Studio và Reports & Analytics.
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {renderReportSection(
                      structuredReport.executive_summary?.title || 'Executive Summary',
                      <div className="space-y-2">
                        {structuredReport.executive_summary?.key_findings?.map((finding, idx) => (
                          <p key={idx}>• {finding}</p>
                        ))}
                        {structuredReport.executive_summary?.overall_recommendation && (
                          <p className="font-medium">{structuredReport.executive_summary.overall_recommendation}</p>
                        )}
                      </div>
                    )}
                    {renderReportSection(
                      structuredReport.actionable_recommendations?.title || 'Khuyến nghị hành động',
                      structuredReport.actionable_recommendations?.recommendations?.map((rec, idx) => (
                        <div key={idx} className="rounded-md bg-slate-50 p-2 border border-slate-200">
                          <p className="font-semibold">{rec.area}</p>
                          <p className="text-xs text-slate-500">Ưu tiên: {rec.priority || 'N/A'}</p>
                          <p>{rec.action}</p>
                          {rec.expected_outcome && <p className="text-xs text-slate-600">Kết quả: {rec.expected_outcome}</p>}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {renderReportSection(
                      structuredReport.performance_metrics?.title || 'Hiệu suất & KPI',
                      structuredReport.performance_metrics?.metrics_overview?.map((metric, idx) => (
                        <div key={idx} className="space-y-1 rounded-md bg-white p-2 border border-slate-200">
                          <p className="font-semibold">{metric.metric}</p>
                          {metric.trend && <p className="text-xs text-blue-700">Xu hướng: {metric.trend}</p>}
                          {metric.pattern_status && <p className="text-xs text-amber-700">Trạng thái: {metric.pattern_status}</p>}
                          {metric.interpretation && <p className="text-sm text-slate-700">{metric.interpretation}</p>}
                        </div>
                      ))
                    )}
                    {renderReportSection(
                      structuredReport.detailed_insights_patterns?.title || 'Chi tiết mẫu & insight',
                      structuredReport.detailed_insights_patterns?.insights?.map((insight, idx) => (
                        <div key={idx} className="space-y-1 rounded-md bg-white p-2 border border-slate-200">
                          <p className="font-semibold">{insight.insight}</p>
                          {insight.description && <p className="text-sm text-slate-700">{insight.description}</p>}
                          {insight.related_metrics?.length && (
                            <p className="text-xs text-slate-500">Liên quan: {insight.related_metrics.join(', ')}</p>
                          )}
                        </div>
                      ))
                    )}
                    {renderReportSection(
                      structuredReport.suggested_visualizations_charts?.title || 'Gợi ý biểu đồ',
                      structuredReport.suggested_visualizations_charts?.charts?.map((chart, idx) => (
                        <div key={idx} className="space-y-1 rounded-md bg-white p-2 border border-slate-200">
                          <p className="font-semibold">{chart.chart_type}</p>
                          {chart.purpose && <p className="text-sm text-slate-700">{chart.purpose}</p>}
                          {chart.data_points?.length && (
                            <p className="text-xs text-slate-500">Dữ liệu: {chart.data_points.join(', ')}</p>
                          )}
                          {(chart.x_axis || chart.y_axis) && (
                            <p className="text-xs text-slate-500"> trục: {chart.x_axis || 'x'} / {chart.y_axis || 'y'}</p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              {infographicError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {infographicError}
                </div>
              )}
              {infographicHtml && (
                <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-inner">
                  <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: infographicHtml }}
                  />
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số bản ghi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Dữ liệu thực từ lần upload gần nhất</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Số trường dữ liệu</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFields.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Tính trên cấu trúc dataset hiện tại</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giá trị ({primaryMetric || 'N/A'})</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{primaryMetric ? primaryTotal.toLocaleString() : '--'}</div>
              <p className="text-xs text-muted-foreground">Tổng hợp từ cột số đầu tiên</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giá trị TB ({primaryMetric || 'N/A'})</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{primaryMetric ? primaryAverage.toFixed(2) : '--'}</div>
              <p className="text-xs text-muted-foreground">Tính trung bình trên dữ liệu upload</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giá trị TB ({secondaryMetric || 'N/A'})</CardTitle>
              <PieChartIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{secondaryMetric ? secondaryAverage.toFixed(2) : '--'}</div>
              <p className="text-xs text-muted-foreground">Từ cột số tiếp theo (nếu có)</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button
              variant={selectedChart === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('all')}
            >
              Tất cả biểu đồ
            </Button>
            <Button
              variant={selectedChart === 'bar' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('bar')}
            >
              Biểu đồ cột
            </Button>
            <Button
              variant={selectedChart === 'line' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('line')}
            >
              Biểu đồ đường
            </Button>
            <Button
              variant={selectedChart === 'pie' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('pie')}
            >
              Biểu đồ tròn
            </Button>
            <Button
              variant={selectedChart === 'scatter' ? 'default' : 'outline'}
              onClick={() => setSelectedChart('scatter')}
            >
              Biểu đồ phân tán
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button onClick={handleExportExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button onClick={handleExportPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
            <Button onClick={handleExportJSON} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Revenue and Customers */}
          {(selectedChart === 'all' || selectedChart === 'bar') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Phân bố giá trị theo nhóm
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryMetric ? (
                  renderBarChart()
                ) : (
                  <p className="text-sm text-gray-600">Không tìm thấy cột số để vẽ biểu đồ.</p>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ cột thể hiện phân bố giá trị dựa trên dữ liệu thực tế bạn đã tải lên.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Line Chart - Conversion Rate and ROI */}
          {(selectedChart === 'all' || selectedChart === 'line') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Xu hướng giá trị theo chuỗi thời gian/nhãn
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryMetric ? (
                  renderLineChart()
                ) : (
                  <p className="text-sm text-gray-600">Cần ít nhất một cột số để hiển thị xu hướng.</p>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ đường phản ánh trực tiếp số liệu đã upload, không sử dụng dữ liệu giả lập.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Pie Chart - Category Distribution */}
          {(selectedChart === 'all' || selectedChart === 'pie') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2" />
                  Phân bố theo danh mục
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryKey && primaryMetric ? (
                  renderPieChart()
                ) : (
                  <p className="text-sm text-gray-600">Cần cột danh mục (text) và cột số để vẽ biểu đồ tròn.</p>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ tròn tổng hợp trực tiếp từ giá trị trong dữ liệu đã upload.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Scatter Chart - Satisfaction vs Customers */}
          {(selectedChart === 'all' || selectedChart === 'scatter') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Mối quan hệ giữa các chỉ số
                </CardTitle>
              </CardHeader>
              <CardContent>
                {primaryMetric && secondaryMetric ? (
                  renderScatterChart()
                ) : (
                  <p className="text-sm text-gray-600">Cần ít nhất hai cột số để hiển thị biểu đồ phân tán.</p>
                )}
                <p className="text-sm text-gray-600 mt-4">
                  Biểu đồ phân tán sử dụng chính dữ liệu bạn đã tải lên để so sánh các chỉ số.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Summary */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tóm tắt Phân tích & Khuyến nghị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">Điểm mạnh:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Báo cáo phản ánh đúng dữ liệu bạn cung cấp, không dùng mẫu.</li>
                  <li>• Các số liệu tổng và trung bình được tính trực tiếp từ dataset.</li>
                  <li>• Xu hướng và phân bố được vẽ dựa trên cột số/cột danh mục thực tế.</li>
                  <li>• Có thể xuất báo cáo (CSV, Excel, PDF, JSON) ngay từ dữ liệu đã xử lý.</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">Cơ hội cải thiện:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Bổ sung nhãn thời gian hoặc danh mục để biểu đồ rõ ràng hơn.</li>
                  <li>• Thêm nhiều cột số để so sánh đa chiều (bar/line/scatter).</li>
                  <li>• Kiểm tra chất lượng dữ liệu đầu vào để giảm giá trị null/NaN.</li>
                  <li>• Gắn nhãn ý nghĩa cho từng cột khi upload để diễn giải trực quan.</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Khuyến nghị chiến lược:</h4>
              <p className="text-sm text-blue-700">
                Duy trì quy trình upload & xử lý dữ liệu đều đặn để báo cáo luôn phản ánh dữ liệu mới nhất.
                Ưu tiên chuẩn hóa tên cột (ví dụ: doanh_thu, chi_phi, kenh) để trực quan hóa chính xác hơn.
                Theo dõi các chỉ số quan trọng trong dataset hiện tại thay vì dữ liệu mẫu cố định.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
