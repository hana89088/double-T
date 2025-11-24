import Navigation from '../../components/layout/Navigation'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, FileText, Download } from 'lucide-react'

export default function Reports() {
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}