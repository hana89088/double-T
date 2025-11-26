import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Edit3, FileSpreadsheet, Upload, Wand2 } from 'lucide-react'

import Navigation from '../../components/layout/Navigation'
import { DataProcessor } from '../../utils/dataProcessing/processor'
import { computeChecksum } from '../../lib/utils'
import { useStore } from '../../stores/appStore'
import { useDataStore } from '../../stores/dataStore'

const clipOutliers = (data: Record<string, any>[]) => {
  if (data.length === 0) return data

  const numericColumns = Object.keys(data[0]).filter((key) =>
    data.every((row) => row[key] === null || row[key] === undefined || row[key] === '' || typeof row[key] === 'number')
  )

  return data.map((row) => {
    const newRow: Record<string, unknown> = { ...row }

    numericColumns.forEach((col) => {
      const values = data.map((r) => Number(r[col])).filter((value) => !isNaN(value))
      if (values.length < 3) return

      const mean = values.reduce((sum, value) => sum + value, 0) / values.length
      const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
      const standardDeviation = Math.sqrt(variance)
      const min = mean - 3 * standardDeviation
      const max = mean + 3 * standardDeviation
      const value = Number(newRow[col])

      if (!isNaN(value)) {
        newRow[col] = Math.min(Math.max(value, min), max)
      }
    })

    return newRow
  })
}

export default function DataInput() {
  const [textData, setTextData] = useState('')
  const [objective, setObjective] = useState('')
  const [uploadedData, setUploadedData] = useState<Record<string, any>[]>([])
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { setCurrentDataset } = useStore()
  const navigate = useNavigate()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { setOriginalData, setProcessedData, setReady, setChecksums } = useDataStore()

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setIsProcessing(true)
    setFileName(file.name)

    try {
      let data: Record<string, any>[] = []

      if (file.name.endsWith('.csv')) {
        data = await DataProcessor.parseCSV(file)
      } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        data = await DataProcessor.parseExcel(file)
      } else {
        toast.error('Unsupported file format. Please upload CSV or Excel files.')
        setIsProcessing(false)
        return
      }

      setUploadedData(data)
      toast.success(`Successfully loaded ${data.length} rows from ${file.name}`)
    } catch (error) {
      toast.error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  })

  const handleTextSubmit = () => {
    if (!textData.trim()) {
      toast.error('Please enter some data')
      return
    }

    try {
      const data = DataProcessor.parseText(textData)
      setUploadedData(data)
      setFileName('Manual input')
      toast.success(`Parsed ${data.length} data points`)
    } catch (error) {
      toast.error(`Error parsing text data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleContinue = () => {
    if (uploadedData.length === 0) {
      toast.error('Please upload or enter data first')
      return
    }

    const dataset = {
      id: Date.now().toString(),
      user_id: 'current-user',
      name: fileName,
      format: fileName.endsWith('.csv')
        ? 'csv' as const
        : fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
          ? 'excel' as const
          : 'text' as const,
      schema: null,
      row_count: uploadedData.length,
      preview: uploadedData.slice(0, 10),
      file_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const cleaned = DataProcessor.cleanData(uploadedData, {
      removeDuplicates: true,
      handleMissingValues: 'fill',
      normalizeData: true,
      convertDataTypes: true,
    } as any)

    const processed = clipOutliers(cleaned)

    setOriginalData(uploadedData)
    setProcessedData(processed)
    setCurrentDataset({ ...dataset, schema: null, preview: processed.slice(0, 10) })

    const checksumInput = computeChecksum(uploadedData)
    const checksumProcessed = computeChecksum(processed)
    setChecksums({ input: checksumInput, processed: checksumProcessed })
    setReady(true)
    toast.success('Dataset saved and pre-processed successfully! Data is ready for analysis.')
    setIsTransitioning(true)
    setTimeout(() => {
      navigate('/analysis')
    }, 300)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {isTransitioning && (
        <div className="fixed inset-0 bg-white/60 pointer-events-none transition-opacity duration-300" />
      )}

      <Navigation />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {isProcessing && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40">
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-xl ring-1 ring-slate-200">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span className="text-sm text-slate-700">Đang xử lý dữ liệu…</span>
            </div>
          </div>
        )}

        <header className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Wand2 className="h-4 w-4" />
            Simplified upload flow
          </div>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Data Input</h1>
              <p className="mt-1 text-sm text-slate-600">
                Bring your marketing data in via upload or quick paste. We keep only the essentials on screen so you can focus on the next step.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
              <div className="rounded-lg bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                Auto-clean ready
              </div>
              <div className="text-xs text-slate-500">Outlier handling, type fixes, missing values</div>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Upload file</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">CSV · Excel</span>
              </div>

              <div
                {...getRootProps()}
                className={`group flex cursor-pointer flex-col gap-3 rounded-xl border border-dashed p-6 text-center transition-colors ${
                  isDragActive ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input {...getInputProps()} />
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-slate-800">
                  {isDragActive ? 'Thả tệp vào đây' : 'Kéo thả hoặc chọn tệp từ máy của bạn'}
                </p>
                <p className="text-xs text-slate-500">Hỗ trợ .csv, .xlsx, .xls</p>
              </div>

              {fileName && (
                <div className="mt-4 flex items-center justify-between rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-100">
                  <div className="flex flex-col">
                    <span className="font-medium">{fileName}</span>
                    {uploadedData.length > 0 && <span className="text-green-700">{uploadedData.length} rows detected</span>}
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700">Ready</span>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Paste data</h2>
              </div>

              <label htmlFor="text-data" className="sr-only">
                Paste your data
              </label>
              <textarea
                id="text-data"
                rows={8}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 shadow-inner outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Dán dữ liệu CSV hoặc từng dòng văn bản.\nVí dụ:\nName,Age,Sales\nJohn,25,1000\nJane,30,1500"
                value={textData}
                onChange={(e) => setTextData(e.target.value)}
              />

              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Tip: Giữ dữ liệu gọn để xem trước rõ ràng hơn.</span>
                <button
                  type="button"
                  onClick={handleTextSubmit}
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Wand2 className="h-4 w-4" /> Parse text
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold">Analysis objective</h2>
                </div>
                <span className="text-xs text-slate-500">Tùy chọn nhưng hữu ích</span>
              </div>

              <label htmlFor="objective" className="sr-only">
                Analysis objective
              </label>
              <textarea
                id="objective"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-800 shadow-inner outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Ví dụ: 'Phân tích tương quan giữa ngân sách marketing và doanh thu theo kênh'."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
              <p className="mt-2 text-xs text-slate-500">Thêm bối cảnh giúp AI gợi ý insight chính xác hơn.</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold">Trạng thái tập dữ liệu</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-xs text-indigo-100">Nguồn</p>
                  <p className="font-semibold">{fileName || 'Chưa có tệp'}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-xs text-indigo-100">Số dòng</p>
                  <p className="font-semibold">{uploadedData.length || '—'}</p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-xs text-indigo-100">Mục tiêu phân tích</p>
                  <p className="line-clamp-2 font-semibold">
                    {objective.trim() ? objective : 'Bổ sung để có khuyến nghị rõ hơn'}
                  </p>
                </div>
                <div className="rounded-xl bg-white/10 px-3 py-2">
                  <p className="text-xs text-indigo-100">Tiến trình</p>
                  <p className="font-semibold">{uploadedData.length > 0 ? 'Sẵn sàng tiền xử lý' : 'Chờ dữ liệu'}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {uploadedData.length > 0 && (
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Preview</h2>
                <p className="text-xs text-slate-500">Chỉ hiển thị 5 dòng đầu để tránh quá tải.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{uploadedData.length} rows</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(uploadedData[0]).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {uploadedData.slice(0, 5).map((row, index) => (
                      <tr key={index}>
                        {Object.keys(uploadedData[0]).map((key) => (
                          <td key={key} className="px-4 py-2 text-slate-800">
                            {String(row[key]).length > 36 ? `${String(row[key]).substring(0, 33)}…` : String(row[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center">
          <div className="text-sm text-slate-600">
            {uploadedData.length > 0
              ? 'Dữ liệu đã sẵn sàng. Nhấn Continue để tiền xử lý và chuyển sang phân tích.'
              : 'Tải lên hoặc dán dữ liệu để bắt đầu.'}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={uploadedData.length === 0 || isProcessing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Tiếp tục phân tích
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
