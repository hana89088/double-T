import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useStore } from '../../stores/appStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Navigation from '../../components/layout/Navigation'
import { fetchDashboardMetrics, isSupabaseConfigured, subscribeToMetrics } from '../../services/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const {
    datasets,
    analyses,
    visualizations,
    reports,
    setDatasets,
    setAnalyses,
    setVisualizations,
    setReports,
    setError,
  } = useStore()
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<{datasets:any[];analyses:any[]}>({datasets:[],analyses:[]})
  const [fetchError, setFetchError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setFetchError(null)
    const res: any = await fetchDashboardMetrics()
    if (res.error) {
      setFetchError(res.error)
      setError('Failed to load dashboard metrics')
    }
    const datasetsData = res.datasets || []
    const analysesData = res.analyses || []
    const visualizationsData = res.visualizations || []
    const reportsData = res.reports || []

    setMetrics({ datasets: datasetsData, analyses: analysesData })
    setDatasets(datasetsData)
    setAnalyses(analysesData)
    setVisualizations(visualizationsData)
    setReports(reportsData)
    setLoading(false)
  }

  useEffect(() => {
    load()
    const unsub = subscribeToMetrics(() => { load() })
    return () => { unsub() }
  }, [])

  const chartData = useMemo(() => {
    if (loading) return []
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    const countByMonth = (items: any[]) => {
      const m = new Array(12).fill(0)
      items.forEach((it) => {
        const d = new Date(it.created_at)
        const idx = d.getMonth()
        if (!isNaN(idx)) m[idx]++
      })
      return m
    }
    const ds = countByMonth(metrics.datasets)
    const an = countByMonth(metrics.analyses)
    return months.map((name, i) => ({ name, datasets: ds[i], analyses: an[i] }))
  }, [loading, metrics])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your marketing insights today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">📊</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Datasets
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {datasets.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                    <span className="text-green-600 font-semibold">🔍</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Analyses Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {analyses.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 font-semibold">📈</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Visualizations
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {visualizations.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-md flex items-center justify-center">
                    <span className="text-orange-600 font-semibold">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reports Generated
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {reports.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Activity Overview
            </h3>
            <div className="h-80">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              ) : chartData.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  No activity yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="datasets" fill="#3B82F6" name="Datasets" />
                    <Bar dataKey="analyses" fill="#10B981" name="Analyses" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 flex items-center justify-between">
              {fetchError ? (
                <span className="text-sm text-red-600">Failed to load metrics: {fetchError}</span>
              ) : (
                <span className="text-sm text-gray-500">{isSupabaseConfigured ? 'Live data from Supabase' : 'Supabase not configured — showing empty state'}</span>
              )}
              <button onClick={load} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">Refresh</button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/data-input"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-xl">📤</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Upload Data
              </h3>
              <p className="text-gray-600">
                Import your marketing data from CSV, Excel, or text files
              </p>
            </div>
          </Link>

          <Link
            to="/analysis"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-xl">🔍</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analyze Data
              </h3>
              <p className="text-gray-600">
                Run statistical analysis and identify patterns in your data
              </p>
            </div>
          </Link>

          <Link
            to="/visualization"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Create Visualizations
              </h3>
              <p className="text-gray-600">
                Build interactive charts and dashboards
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
