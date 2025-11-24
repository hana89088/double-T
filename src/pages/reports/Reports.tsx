import Navigation from '../../components/layout/Navigation'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, FileText, Download } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Reports() {
  const [schedule, setSchedule] = useState<{time:string;freq:'daily'|'weekly'|''}>({time:'',freq:''})
  const [nextRun, setNextRun] = useState<string>('')

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
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="mt-2 text-gray-600">Generate comprehensive marketing reports and data analysis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
