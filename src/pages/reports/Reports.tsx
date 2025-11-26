import Navigation from '../../components/layout/Navigation'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, FileText, Download } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useDataStore } from '@/stores/dataStore'
import { GeminiAPIService } from '@/services/gemini/GeminiAPIService'
import { getGeminiConfig } from '@/config/gemini'
import { GeminiStructuredReport } from '@/types/gemini'

export default function Reports() {
  const { processedData, ready } = useDataStore()
  const [schedule, setSchedule] = useState<{time:string;freq:'daily'|'weekly'|''}>({time:'',freq:''})
  const [nextRun, setNextRun] = useState<string>('')
  const [aiReport, setAiReport] = useState<GeminiStructuredReport | null>(null)
  const [aiReportError, setAiReportError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const hasData = ready && processedData.length > 0

  useEffect(() => {
    const saved = localStorage.getItem('reportSchedule')
    if (saved) setSchedule(JSON.parse(saved))
  }, [])

  const saveSchedule = () => {
    localStorage.setItem('reportSchedule', JSON.stringify(schedule))
    const now = new Date(); const [h,m] = schedule.time.split(':').map(Number)
    const next = new Date(now)
    next.setHours(h||0, m||0, 0, 0)
    if (next <= now) next.setDate(next.getDate() + (schedule.freq==='weekly'?7:1))
    setNextRun(next.toLocaleString())
  }

  const handleGenerateAiReport = async () => {
    if (!hasData) {
      setAiReportError('Bạn cần upload và xử lý dữ liệu trước khi tạo báo cáo AI.')
      return
    }

    const cfg = getGeminiConfig()
    if (!cfg.apiKey) {
      setAiReportError('Gemini API key chưa được cấu hình để tạo báo cáo Reports & Analytics.')
      return
    }

    setIsGenerating(true)
    setAiReportError(null)
    try {
      const service = new GeminiAPIService(cfg)
      const response = await service.generateStructuredReportFromData(processedData.slice(0, 200), {
        title: 'Reports & Analytics AI Summary',
        audience: 'executive',
      })
      setAiReport(response.report)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tạo báo cáo AI từ Gemini'
      setAiReportError(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderAiReport = () => {
    if (!aiReport) return null
    return (
      <div className="mt-4 space-y-3">
        {aiReport.executive_summary && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-900">{aiReport.executive_summary.title}</p>
            {aiReport.executive_summary.overall_recommendation && (
              <p className="text-sm text-blue-800 mt-1">{aiReport.executive_summary.overall_recommendation}</p>
            )}
          </div>
        )}
        {aiReport.actionable_recommendations?.recommendations && (
          <div className="bg-white border border-purple-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900 mb-2">Hành động ưu tiên</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {aiReport.actionable_recommendations.recommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx}>
                  <span className="font-medium text-purple-900">{rec.area || 'Hành động'}</span>: {rec.action}
                </li>
              ))}
            </ul>
          </div>
        )}
        {aiReport.suggested_visualizations_charts?.charts && (
          <div className="bg-white border border-orange-100 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900 mb-2">Biểu đồ đề xuất</p>
            <div className="flex flex-wrap gap-2">
              {aiReport.suggested_visualizations_charts.charts.slice(0, 4).map((chart, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-orange-200 text-orange-900 px-2 py-1 rounded-full"
                >
                  {chart.chart_type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Generate comprehensive marketing reports and data analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* AI JSON Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">AI JSON Report</CardTitle>
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gemini trả về JSON marketing insights và tự động dựng báo cáo cho Visualization & Reports.
              </p>
              <div className="flex flex-col gap-3">
                <Button onClick={handleGenerateAiReport} disabled={isGenerating}>
                  {isGenerating ? 'Đang tạo...' : 'Tạo báo cáo AI'}
                </Button>
                {aiReportError && <p className="text-sm text-red-600">{aiReportError}</p>}
                {aiReport && renderAiReport()}
                {!hasData && (
                  <p className="text-xs text-gray-500">Cần dữ liệu đã upload để kích hoạt AI report.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Analysis Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Data Analysis Report</CardTitle>
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Comprehensive analysis with interactive charts, trend analysis, and data visualization. 
                Includes bar charts, line charts, pie charts, and scatter plots.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Multi-chart analysis</span>
                <Link to="/reports/data-analysis">
                  <Button>Generate Report</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Performance Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Performance Report</CardTitle>
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Track key performance metrics, conversion rates, ROI analysis, and campaign effectiveness. 
                Monthly and quarterly performance summaries.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">KPI tracking</span>
                <Button variant="outline" disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>

          {/* Custom Report */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Custom Report</CardTitle>
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Create personalized reports with custom metrics, date ranges, and specific data points. 
                Export in various formats including PDF and Excel.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Customizable</span>
                <Button variant="outline" disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Reports</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Generated Reports</span>
                <Download className="h-5 w-5 text-gray-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Data Analysis Report - December 2024</h4>
                    <p className="text-sm text-gray-600">Generated 2 hours ago • 12 charts • PDF format</p>
                  </div>
                  <Button variant="outline" className="text-sm">Download</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Monthly Performance Summary</h4>
                    <p className="text-sm text-gray-600">Generated 1 day ago • 8 charts • Excel format</p>
                  </div>
                  <Button variant="outline" className="text-sm">Download</Button>
                </div>
              </div>
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Report</h3>
                <div className="flex items-center gap-3">
                  <input type="time" value={schedule.time} onChange={(e)=>setSchedule({...schedule,time:e.target.value})} className="px-3 py-2 border rounded" />
                  <select value={schedule.freq} onChange={(e)=>setSchedule({...schedule,freq:e.target.value as any})} className="px-3 py-2 border rounded">
                    <option value="">Select frequency</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                  <Button variant="outline" onClick={saveSchedule}>Save Schedule</Button>
                </div>
                {nextRun && (
                  <p className="text-sm text-gray-600 mt-2">Next run: {nextRun}. Note: background sending requires server-side scheduler.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
