import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BarChart3, TrendingUp, FileText } from 'lucide-react';
import { GeminiReportGenerator } from '@/components/GeminiReportGenerator';
import { useDataStore } from '@/stores/dataStore';
import { performStatisticalAnalysis } from '@/utils/statisticalAnalysis';
import { detectPatterns } from '@/utils/patternRecognition';
import { findCorrelations } from '@/utils/correlationAnalysis';
import { toast } from 'sonner';
import type { StatisticalResults } from '@/utils/statisticalAnalysis';
import type { Pattern } from '@/utils/patternRecognition';

interface CorrelationResult {
  field1: string;
  field2: string;
  correlation: number;
  coefficient: number;
  pValue: number | null;
  strength: string;
  direction: string;
}

const Analysis: React.FC = () => {
  const { processedData, ready } = useDataStore();
  const [statisticalResults, setStatisticalResults] = useState<StatisticalResults | null>(null);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (processedData.length > 0) {
      performAnalysis();
    }
  }, [processedData]);

  const performAnalysis = async () => {
    if (processedData.length === 0) {
      toast.error('No data available for analysis');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Perform statistical analysis
      const stats = performStatisticalAnalysis(processedData);
      setStatisticalResults(stats);

      // Detect patterns
      const detectedPatterns = detectPatterns(processedData);
      setPatterns(detectedPatterns);

      // Find correlations
      const correlationResults = findCorrelations(processedData);
      setCorrelations(correlationResults);

      toast.success('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please check your data.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderStatisticalAnalysis = () => {
    if (!statisticalResults) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No statistical analysis available. Please ensure you have processed data.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(statisticalResults).map(([key, value]: [string, any]) => (
            <Card key={key} className="p-4">
              <h4 className="font-medium text-gray-900 capitalize mb-2">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h4>
              <div className="space-y-1">
                {Object.entries(value).map(([metric, val]: [string, any]) => (
                  <div key={metric} className="flex justify-between text-sm">
                    <span className="text-gray-600 capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="font-medium">
                      {typeof val === 'number' ? val.toFixed(2) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPatternAnalysis = () => {
    if (patterns.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No patterns detected in the current data.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        {patterns.map((pattern, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{pattern.type}</h4>
                <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                {pattern.confidence && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Confidence: {pattern.confidence}%</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderCorrelationAnalysis = () => {
    if (correlations.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No significant correlations found in the current data.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {correlations.map((correlation, index) => {
            const coefficient = correlation.coefficient ?? correlation.correlation;
            const pValue = correlation.pValue ?? correlation.p_value;

            return (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {correlation.field1} × {correlation.field2}
                </h4>
                <span className={`text-sm font-medium ${
                  Math.abs(coefficient) >= 0.7 ? 'text-green-600' :
                  Math.abs(coefficient) >= 0.4 ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {typeof coefficient === 'number' ? coefficient.toFixed(3) : 'N/A'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="capitalize">{correlation.strength}</span> correlation
                {typeof pValue === 'number' && (
                  <span className="ml-2">
                    (p-value: {pValue.toFixed(4)})
                  </span>
                )}
              </div>
            </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const hasData = ready && processedData.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Analysis</h1>
          <p className="text-gray-600">
            Comprehensive analysis of your marketing data with AI-powered insights
          </p>
        </div>

        {!hasData ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No data available for analysis. Please upload and process data first.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {processedData.length} records available for analysis
            </div>
            <Button
              onClick={performAnalysis}
              disabled={isAnalyzing}
              variant="outline"
            >
              {isAnalyzing ? (
                <>
                  <BarChart3 className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Re-run Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {ready && processedData.length === 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Data is marked ready but empty. Please ensure preprocessing completed in Data Input.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="statistical">Statistical</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
            <TabsTrigger value="correlations">Correlations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Report Generator */}
              <GeminiReportGenerator
                className="lg:col-span-2"
                processedData={processedData}
                statisticalResults={statisticalResults}
                patterns={patterns}
                correlations={correlations}
              />
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Records</span>
                      <span className="font-medium">{processedData.length.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Data Fields</span>
                      <span className="font-medium">{hasData ? Object.keys(processedData[0]).length : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patterns Detected</span>
                      <span className="font-medium">{patterns.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Correlations Found</span>
                      <span className="font-medium">{correlations.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Analysis Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        statisticalResults ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm">Statistical Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        patterns.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm">Pattern Detection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        correlations.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm">Correlation Analysis</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="statistical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Statistical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderStatisticalAnalysis()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Pattern Recognition
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPatternAnalysis()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Correlation Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCorrelationAnalysis()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analysis;
