import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

interface HeatmapProps {
  data: number[][]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  title?: string
}

export default function Heatmap({
  data,
  width = 600,
  height = 400,
  margin = { top: 50, right: 50, bottom: 50, left: 50 },
  title = 'Data Heatmap'
}: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.clientWidth
      const adjustedWidth = containerWidth ? containerWidth : width
      const adjustedHeight = Math.max(280, Math.min(640, adjustedWidth * 0.6))
      setDimensions({ width: adjustedWidth, height: adjustedHeight })
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [width, height])

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return

    const { width: finalWidth, height: finalHeight } = dimensions
    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const innerWidth = finalWidth - margin.left - margin.right
    const innerHeight = finalHeight - margin.top - margin.bottom

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data[0].map((_, i) => i.toString()))
      .range([0, innerWidth])
      .padding(0.1)

    const yScale = d3.scaleBand()
      .domain(data.map((_, i) => i.toString()))
      .range([0, innerHeight])
      .padding(0.1)

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([d3.min(data.flat()) || 0, d3.max(data.flat()) || 1])

    // Create main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'heatmap-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')

    // Create heatmap cells
    g.selectAll('.cell')
      .data(data.flatMap((row, i) => row.map((value, j) => ({ value, row: i, col: j }))))
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', d => xScale(d.col.toString()) || 0)
      .attr('y', d => yScale(d.row.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.value))
      .attr('stroke', 'white')
      .attr('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('stroke', 'black')
          .attr('stroke-width', 2)
        
        tooltip
          .style('visibility', 'visible')
          .text(`Row: ${d.row + 1}, Col: ${d.col + 1}, Value: ${d.value.toFixed(2)}`)
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px')
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('stroke', 'white')
          .attr('stroke-width', 1)
        
        tooltip.style('visibility', 'hidden')
      })

    // Add title
    svg.append('text')
      .attr('x', finalWidth / 2)
      .attr('y', margin.top / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', '16px')
      .attr('font-weight', 'bold')
      .text(title)

    // Add labels if data is small enough
    if (data.length <= 10 && data[0].length <= 10) {
      // Row labels
      g.selectAll('.row-label')
        .data(data.map((_, i) => i))
        .enter()
        .append('text')
        .attr('class', 'row-label')
        .attr('x', -10)
        .attr('y', d => (yScale(d.toString()) || 0) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '12px')
        .text(d => `Row ${d + 1}`)

      // Column labels
      g.selectAll('.col-label')
        .data(data[0].map((_, i) => i))
        .enter()
        .append('text')
        .attr('class', 'col-label')
        .attr('x', d => (xScale(d.toString()) || 0) + xScale.bandwidth() / 2)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(d => `Col ${d + 1}`)
    }

    // Add color legend
    const legendWidth = 200
    const legendHeight = 10
    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([0, legendWidth])

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d3.format('.2f'))

    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${finalWidth - margin.right - legendWidth}, ${finalHeight - 20})`)

    const legendGradient = d3.range(legendWidth).map(i => 
      colorScale(legendScale.invert(i))
    )

    legend.selectAll('.legend-rect')
      .data(legendGradient)
      .enter()
      .append('rect')
      .attr('x', (d, i) => i)
      .attr('y', 0)
      .attr('width', 1)
      .attr('height', legendHeight)
      .attr('fill', d => d)

    legend.append('g')
      .attr('transform', `translate(0, ${legendHeight})`)
      .call(legendAxis)

    return () => {
      tooltip.remove()
    }
  }, [data, dimensions, margin, title])

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 rounded w-full"
      />
    </div>
  )
}