import { ChartConfig } from '../../types'

interface ChartConfigPanelProps {
  config: ChartConfig
  onConfigChange: (config: ChartConfig) => void
  data: Record<string, any>[]
  onFiltersChange?: (filters: ChartFilters) => void
}

interface ChartFilters {
  categoryColumn?: string
  selectedCategories?: string[]
  rangeColumn?: string
  min?: number
  max?: number
}

export default function ChartConfigPanel({ config, onConfigChange, data, onFiltersChange }: ChartConfigPanelProps) {
  if (!data || data.length === 0) return null

  const columns = Object.keys(data[0])
  const numericColumns = columns.filter(c => data.every(row => row[c] === '' || row[c] === null || row[c] === undefined || typeof row[c] === 'number' || !isNaN(Number(row[c]))))
  const categoryColumns = columns.filter(c => data.some(row => typeof row[c] === 'string'))

  const handleConfigChange = (key: keyof ChartConfig, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    })
  }

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...(config.colors || [])]
    newColors[index] = color
    handleConfigChange('colors', newColors)
  }

  const addColor = () => {
    const newColors = [...(config.colors || []), '#3B82F6']
    handleConfigChange('colors', newColors)
  }

  const removeColor = (index: number) => {
    const newColors = (config.colors || []).filter((_, i) => i !== index)
    handleConfigChange('colors', newColors)
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Configuration</h3>
      
      <div className="space-y-4">
        {/* Chart Title */}
        <div>
          <label htmlFor="chart-title" className="block text-sm font-medium text-gray-700 mb-1">
            Chart Title
          </label>
          <input
            id="chart-title"
            type="text"
            value={config.title}
            onChange={(e) => handleConfigChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter chart title"
          />
        </div>

        {/* Chart Type */}
        <div>
          <label htmlFor="chart-type" className="block text-sm font-medium text-gray-700 mb-1">
            Chart Type
          </label>
          <select
            id="chart-type"
            value={config.type}
            onChange={(e) => handleConfigChange('type', e.target.value as ChartConfig['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
            <option value="pie">Pie Chart</option>
            <option value="scatter">Scatter Plot</option>
          </select>
        </div>

        {/* X-Axis */}
        {config.type !== 'pie' && (
          <div>
            <label htmlFor="x-axis" className="block text-sm font-medium text-gray-700 mb-1">
              X-Axis
            </label>
            <select
              id="x-axis"
              value={config.xAxis || ''}
              onChange={(e) => handleConfigChange('xAxis', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select X-Axis</option>
              {columns.map(column => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
          </div>
        )}

        {/* Y-Axis */}
        <div>
          <label htmlFor="y-axis" className="block text-sm font-medium text-gray-700 mb-1">
            Y-Axis / Values
          </label>
          <select
            id="y-axis"
            value={config.yAxis || ''}
            onChange={(e) => handleConfigChange('yAxis', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Y-Axis</option>
            {columns.map(column => (
              <option key={column} value={column}>{column}</option>
            ))}
          </select>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Colors
          </label>
          <div className="space-y-2">
            {(config.colors || []).map((color, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeColor(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              onClick={addColor}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              + Add Color
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.showLegend || false}
              onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show Legend</span>
          </label>
          
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config.showGrid || false}
            onChange={(e) => handleConfigChange('showGrid', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">Show Grid</span>
        </label>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-800">Filters</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Column</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded" onChange={(e)=>onFiltersChange?.({ categoryColumn: e.target.value, selectedCategories: [] })}>
              <option value="">Select column</option>
              {categoryColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Range Column</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded" onChange={(e)=>{
              const col = e.target.value
              if (!col) return onFiltersChange?.({ rangeColumn: undefined })
              const vals = data.map(r => Number(r[col])).filter(v => !isNaN(v))
              const min = Math.min(...vals)
              const max = Math.max(...vals)
              onFiltersChange?.({ rangeColumn: col, min, max })
            }}>
              <option value="">Select column</option>
              {numericColumns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input type="number" className="px-2 py-1 border border-gray-300 rounded" placeholder="Min" onChange={(e)=>onFiltersChange?.({ min: Number(e.target.value) })} />
              <input type="number" className="px-2 py-1 border border-gray-300 rounded" placeholder="Max" onChange={(e)=>onFiltersChange?.({ max: Number(e.target.value) })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
