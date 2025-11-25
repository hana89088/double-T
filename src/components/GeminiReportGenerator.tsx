import React, { useState, useCallback, useMemo } from 'react';
import { Loader2, Brain, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { GeminiAPIService } from '../services/gemini/GeminiAPIService';
import { GeminiPromptBuilder } from '../utils/geminiPromptBuilder';
import { getGeminiConfig } from '../config/gemini';
import { GeminiResponse, Dataset } from '../types/gemini';
import type { StatisticalResults, FieldStatistics } from '../utils/statisticalAnalysis';
import type { Pattern } from '../utils/patternRecognition';
import { toast } from 'sonner';

interface CorrelationResult {
  field1: string;
  field2: string;
  correlation: number;
  coefficient?: number;
  pValue?: number | null;
  strength?: string;
  direction?: string;
}

interface GeminiReportGeneratorProps {
  className?: string;
  onReportGenerated?: (report: GeminiResponse) => void;
  processedData?: Record<string, unknown>[];
  statisticalResults?: StatisticalResults | null;
  patterns?: Pattern[];
  correlations?: CorrelationResult[];
}

const buildDatasetsFromProcessedData = (processedData: Record<string, unknown>[] = []): Dataset[] => {
  if (!processedData || processedData.length === 0) {
    return [];
  }

  const firstRecord = processedData[0] || {};
  const fields = Object.keys(firstRecord);
  const sampleData = fields.reduce<Record<string, unknown>>((acc, field) => {
    acc[field] = firstRecord[field];
    return acc;
  }, {});

  return [
    {
      name: 'Analysis Dataset',
      type: 'user_input',
      recordCount: processedData.length,
      fields,
      sampleData,
      metadata: {
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        source: 'analysis_input',
        format: 'structured'
      }
    }
  ];
};

const buildAnalysisContextSummary = (
  processedData: Record<string, unknown>[] = [],
  statisticalResults?: StatisticalResults | null,
  patterns?: Pattern[],
  correlations?: CorrelationResult[]
): string => {
  const parts: string[] = [];

  if (processedData.length > 0) {
    const fieldCount = Object.keys(processedData[0] || {}).length;
    parts.push(`Dataset includes ${processedData.length} records across ${fieldCount} fields.`);
  }

  if (statisticalResults && Object.keys(statisticalResults).length > 0) {
    const highlights = Object.entries(statisticalResults)
      .slice(0, 3)
      .map(([field, stats]) => {
        const { mean, standardDeviation } = stats as FieldStatistics;
        const meanValue = typeof mean === 'number' ? mean.toFixed(2) : 'n/a';
        const deviation = typeof standardDeviation === 'number' ? standardDeviation.toFixed(2) : 'n/a';
        return `${field}: mean ${meanValue}, deviation ${deviation}`;
      });

    if (highlights.length > 0) {
      parts.push(`Top statistical signals - ${highlights.join('; ')}`);
    }
  }

  if (patterns && patterns.length > 0) {
    const patternSummary = patterns
      .slice(0, 3)
      .map(pattern => `${pattern.type} on ${pattern.field} (${pattern.strength || 'context'})`);

    if (patternSummary.length > 0) {
      parts.push(`Detected patterns: ${patternSummary.join('; ')}`);
    }
  }

  if (correlations && correlations.length > 0) {
    const correlationSummary = correlations
      .slice(0, 3)
      .map(corr => `${corr.field1} ↔ ${corr.field2}: ${typeof corr.correlation === 'number' ? corr.correlation.toFixed(2) : corr.correlation}`);

    if (correlationSummary.length > 0) {
      parts.push(`Notable correlations: ${correlationSummary.join('; ')}`);
    }
  }

  return parts.join(' ');
};

export const GeminiReportGenerator: React.FC<GeminiReportGeneratorProps> = ({
  className = '',
  onReportGenerated,
  processedData = [],
  statisticalResults,
  patterns = [],
  correlations = []
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('Analyze our marketing performance and provide actionable insights');

  const datasets = useMemo(() => buildDatasetsFromProcessedData(processedData), [processedData]);
  const analysisContext = useMemo(
    () => buildAnalysisContextSummary(processedData, statisticalResults, patterns, correlations),
    [processedData, statisticalResults, patterns, correlations]
  );

  const generateReport = useCallback(async () => {
    if (!userQuery.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      if (datasets.length === 0) {
        throw new Error('Không có dữ liệu phân tích. Vui lòng tải dữ liệu và chạy lại phần Analysis trước khi gọi Gemini.');
      }

      const cfg = getGeminiConfig();
      if (!cfg.apiKey) {
        setError('Gemini API key chưa được cấu hình');
        toast.error('Gemini API key chưa được cấu hình');
        return;
      }
      const geminiService = new GeminiAPIService(cfg);
      // Create prompt object using actual analysis context
      const promptObject = GeminiPromptBuilder.createMarketingInsightsPrompt(
        datasets,
        userQuery,
        analysisContext || 'Marketing performance analysis for data-driven decision making'
      );

      // Generate insights
      const report = await geminiService.generateInsights(promptObject);

      setGeneratedReport(report);
      onReportGenerated?.(report);

      toast.success('Report generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [userQuery, onReportGenerated, datasets, analysisContext]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI-Powered Marketing Insights</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to analyze?
            </label>
            <textarea
              id="query"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Enter your analysis query..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-4 text-sm text-gray-700 space-y-2">
            <div className="font-medium text-gray-900">Analysis context sent to Gemini</div>
            <p>{analysisContext || 'Chưa có dữ liệu phân tích. Vui lòng xử lý dữ liệu ở bước Analysis để tạo báo cáo sát thực tế.'}</p>

            {datasets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Tổng bản ghi</span>
                  <span className="font-semibold text-gray-900">{datasets[0].recordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Số trường dữ liệu</span>
                  <span className="font-semibold text-gray-900">{datasets[0].fields.length}</span>
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={generateReport}
            disabled={isGenerating || !userQuery.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-4 w-4" />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h4 className="text-sm font-medium text-red-800">Generation Error</h4>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Report Display */}
      {generatedReport && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Generated Report</h3>
            {generatedReport.success && (
              <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
            )}
          </div>

          {generatedReport.success ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Analysis Summary</h4>
                <div className="text-sm text-blue-700">
                  <p>Confidence Score: {(generatedReport.data.confidenceScore * 100).toFixed(1)}%</p>
                  <p>Processing Time: {generatedReport.data.processingTime}ms</p>
                  <p>Model: {generatedReport.metadata.model}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Key Insights</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {generatedReport.data.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {generatedReport.data.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {Object.keys(generatedReport.data.metrics).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Key Metrics</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(generatedReport.data.metrics).map(([key, value]) => (
                      <div key={key} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">
                          {typeof value === 'number' ? value.toFixed(2) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {generatedReport.data.rawResponse && (
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Full Gemini Response</h4>
                  <pre className="bg-gray-900 text-gray-100 text-xs p-3 rounded-md overflow-auto">
                    {generatedReport.data.rawResponse}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-800 mb-2">Generation Failed</h4>
              <p className="text-sm text-red-700">
                {generatedReport.error?.message || 'An unknown error occurred'}
              </p>
              {generatedReport.error?.details && (
                <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(generatedReport.error.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeminiReportGenerator;
