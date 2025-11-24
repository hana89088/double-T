import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Navigation from '../../components/layout/Navigation'
import { DataProcessor } from '../../utils/dataProcessing/processor'
import { useStore } from '../../stores/appStore'
import { toast } from 'sonner'

export default function DataInput() {
  const [textData, setTextData] = useState('')
  const [objective, setObjective] = useState('')
  const [uploadedData, setUploadedData] = useState<Record<string, any>[]>([])
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const { setCurrentDataset } = useStore()

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
      setFileName('Text Input')
      toast.success(`Successfully parsed ${data.length} data points`)
    } catch (error) {
      toast.error(`Error parsing text data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleContinue = () => {
    if (uploadedData.length === 0) {
      toast.error('Please upload or enter data first')
      return
    }

    // Store the dataset in the global state
    const dataset = {
      id: Date.now().toString(),
      user_id: 'current-user', // This will be replaced with actual user ID from auth
      name: fileName,
      format: fileName.endsWith('.csv') ? 'csv' as const : fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ? 'excel' as const : 'text' as const,
      schema: null,
      row_count: uploadedData.length,
      preview: uploadedData.slice(0, 10), // Store first 10 rows as preview
      file_path: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setCurrentDataset(dataset)
    toast.success('Dataset saved successfully!')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Input</h1>
          <p className="mt-2 text-gray-600">
            Upload your marketing data or enter it manually to get started with analysis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* File Upload */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload File</h2>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
              `}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mx-auto">
                  <span className="text-gray-600 text-xl">📁</span>
                </div>
                {isDragActive ? (
                  <p className="text-blue-600 font-medium">Drop the file here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600">
                      Drag and drop your CSV or Excel file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: CSV, XLSX, XLS
                    </p>
                  </div>
                )}
              </div>
            </div>

            {fileName && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 text-sm">
                  <strong>File:</strong> {fileName}
                </p>
                {uploadedData.length > 0 && (
                  <p className="text-green-700 text-sm mt-1">
                    <strong>Rows:</strong> {uploadedData.length}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Text Input */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Input</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="text-data" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your data
                </label>
                <textarea
                  id="text-data"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your data here...&#10;You can paste CSV data or simple text.&#10;Example:&#10;Name,Age,Sales&#10;John,25,1000&#10;Jane,30,1500"
                  value={textData}
                  onChange={(e) => setTextData(e.target.value)}
                />
              </div>
              <button
                onClick={handleTextSubmit}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Parse Text Data
              </button>
            </div>
          </div>
        </div>

        {/* Analysis Objective */}
        <div className="bg-white shadow rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Objective</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-2">
                What would you like to analyze?
              </label>
              <textarea
                id="objective"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your analysis goals...&#10;Example: I want to understand the relationship between marketing spend and sales performance."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
              />
            </div>
            <p className="text-sm text-gray-500">
              This helps us provide more targeted insights and recommendations.
            </p>
          </div>
        </div>

        {/* Data Preview */}
        {uploadedData.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Preview</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(uploadedData[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {uploadedData.slice(0, 5).map((row, index) => (
                    <tr key={index}>
                      {Object.keys(uploadedData[0]).map((key) => (
                        <td
                          key={key}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                        >
                          {String(row[key]).length > 20
                            ? `${String(row[key]).substring(0, 20)}...`
                            : String(row[key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {uploadedData.length > 5 && (
              <p className="text-sm text-gray-500 mt-4">
                Showing first 5 rows of {uploadedData.length} total rows.
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={uploadedData.length === 0 || isProcessing}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Analysis
          </button>
        </div>
      </div>
    </div>
  )
}