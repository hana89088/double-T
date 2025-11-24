import { useRef, useState } from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { Brush } from 'recharts'
import { exportSvgToPng } from '../../utils/exportImage'
import { ChartConfig } from '../../types'

interface InteractiveChartProps {
  data: Record<string, any>[]
  config: ChartConfig
  onConfigChange?: (config: ChartConfig) => void
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']

export default function InteractiveChart({ data, config, onConfigChange }: InteractiveChartProps) {
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null)
  const chartRef = useRef<HTMLDivElement>(null)
  const largeData = data && data.length > 500

  const handleDataPointClick = (data: any) => {
    setSelectedDataPoint(data)
  }

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (config.type) {
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {config.showLegend && <Legend />}
            <Bar 
              dataKey={config.yAxis} 
              fill={config.colors?.[0] || COLORS[0]}
              onClick={handleDataPointClick}
              cursor="pointer"
              radius={[2, 2, 0, 0]}
              isAnimationActive={!largeData}
            />
            <Brush dataKey={config.xAxis} height={20} travellerWidth={10} stroke="#3B82F6" />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={config.xAxis} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {config.showLegend && <Legend />}
            <Line 
              type="monotone" 
              dataKey={config.yAxis} 
              stroke={config.colors?.[0] || COLORS[0]}
              strokeWidth={2}
              dot={{ fill: config.colors?.[0] || COLORS[0], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: config.colors?.[0] || COLORS[0], strokeWidth: 2 }}
              onClick={handleDataPointClick}
              isAnimationActive={!largeData}
            />
            <Brush dataKey={config.xAxis} height={20} travellerWidth={10} stroke="#3B82F6" />
          </LineChart>
        )

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={120}
              fill="#8884d8"
              dataKey={config.yAxis}
              nameKey={config.xAxis}
              onClick={handleDataPointClick}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {config.showLegend && <Legend />}
          </PieChart>
        )

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey={config.xAxis} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey={config.yAxis} 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            {config.showLegend && <Legend />}
            <Scatter 
              name={config.title}
              data={data} 
              fill={config.colors?.[0] || COLORS[0]}
              onClick={handleDataPointClick}
            />
          </ScatterChart>
        )

      default:
        return <div>Unsupported chart type</div>
    }
  }

  return (
    <div className="w-full h-full" ref={chartRef}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
        {selectedDataPoint && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {JSON.stringify(selectedDataPoint, null, 2)}
            </p>
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        {renderChart()}
      </ResponsiveContainer>

      {config.showGrid && (
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <div 
              className="w-4 h-4 rounded mr-2" 
              style={{ backgroundColor: config.colors?.[0] || COLORS[0] }}
            />
            <span>{config.yAxis}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-px bg-gray-400 mr-2" />
            <span>{config.xAxis}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={() => {
            const svg = chartRef.current?.querySelector('svg') as SVGSVGElement | null
            if (!svg) return
            exportSvgToPng(svg, `${(config.title || 'chart').replace(/\s+/g,'_')}.png`)
          }}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
        >
          Export PNG
        </button>
      </div>
    </div>
  )
}
