import { useState } from 'react'
import Navigation from '../../components/layout/Navigation'
import InteractiveChart from '../../components/charts/InteractiveChart'
import ChartConfigPanel from '../../components/charts/ChartConfigPanel'
import Heatmap from '../../components/charts/Heatmap'
import { ChartConfig } from '../../types'
import { useDataStore } from '../../stores/dataStore'
import { computeChecksum } from '../../lib/utils'

// Sample data for demonstration
const sampleData = [
  { month: 'Jan', sales: 4000, marketing: 2400, revenue: 6400 },
  { month: 'Feb', sales: 3000, marketing: 1398, revenue: 4398 },
  { month: 'Mar', sales: 2000, marketing: 9800, revenue: 11800 },
  { month: 'Apr', sales: 2780, marketing: 3908, revenue: 6688 },
  { month: 'May', sales: 1890, marketing: 4800, revenue: 6690 },
  { month: 'Jun', sales: 2390, marketing: 3800, revenue: 6190 },
]

const heatmapData = [
  [0.8, 0.2, 0.5, 0.9, 0.3],
  [0.4, 0.7, 0.1, 0.6, 0.8],
  [0.2, 0.9, 0.4, 0.3, 0.7],
  [0.6, 0.1, 0.8, 0.5, 0.2],
  [0.9, 0.5, 0.3, 0.8, 0.6]
]

export default function Visualization() {
  const { processedData } = useDataStore()
  const [chartConfigs, setChartConfigs] = useState<ChartConfig[]>([
    {
      type: 'bar',
      title: 'Monthly Sales vs Marketing Spend',
      xAxis: 'month',
      yAxis: 'sales',
      colors: ['#3B82F6'],
      showLegend: true,
      showGrid: true
    },
    {
      type: 'line',
      title: 'Revenue Trend',
      xAxis: 'month',
      yAxis: 'revenue',
      colors: ['#10B981'],
      showLegend: true,
      showGrid: true
    }
  ])

  const [activeChart, setActiveChart] = useState(0)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [filters, setFilters] = useState<{categoryColumn?:string; selectedCategories?:string[]; rangeColumn?:string; min?:number; max?:number}>({})

  const baseData = (processedData.length > 0 && processedData[0].month && processedData[0].revenue) ? processedData : sampleData
  const filteredData = baseData.filter((row:any) => {
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

  const updateChartConfig = (index: number, config: ChartConfig) => {
    const newConfigs = [...chartConfigs]
    newConfigs[index] = config
    setChartConfigs(newConfigs)
  }

  const addChart = () => {
    const newConfig: ChartConfig = {
      type: 'bar',
      title: 'New Chart',
      xAxis: 'month',
      yAxis: 'sales',
      colors: ['#F59E0B'],
      showLegend: true,
      showGrid: true
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
              <ChartConfigPanel
                config={chartConfigs[activeChart]}
                onConfigChange={(config) => updateChartConfig(activeChart, config)}
                data={baseData}
                onFiltersChange={(f)=>setFilters(prev=>({ ...prev, ...f }))}
              />

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
                  >
                    Heatmap
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Visualization Area */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow rounded-lg p-6">
              {showHeatmap ? (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Density Heatmap</h3>
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
