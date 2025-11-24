import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  GeminiPromptObject, 
  GeminiResponse, 
  GeminiAPIConfig
} from '../../types/gemini';

export class GeminiAPIService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiAPIConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing: boolean = false;
  private lastRequestTime: number = 0;
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequestTimestamp: number;
    rateLimitHits: number;
  };
  private connectionStatus: {
    isConnected: boolean;
    lastConnectionTime: Date | null;
    connectionAttempts: number;
    lastError: string | null;
  };

  constructor(config: GeminiAPIConfig) {
    this.config = config;
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTimestamp: 0,
      rateLimitHits: 0
    };
    this.connectionStatus = {
      isConnected: false,
      lastConnectionTime: null,
      connectionAttempts: 0,
      lastError: null
    };

    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      this.genAI = new GoogleGenerativeAI(this.config.apiKey);
      const modelName = this.config.model || 'gemini-1.5-pro';
      this.model = this.genAI.getGenerativeModel({ model: modelName });
      
      this.connectionStatus.isConnected = true;
      this.connectionStatus.lastConnectionTime = new Date();
      this.connectionStatus.connectionAttempts = 0;
      this.connectionStatus.lastError = null;

      console.log('Gemini API connection established successfully');
    } catch (error) {
      this.connectionStatus.isConnected = false;
      this.connectionStatus.lastError = error instanceof Error ? error.message : 'Unknown error';
      this.connectionStatus.connectionAttempts++;
      
      console.error('Failed to initialize Gemini API connection:', error);
      throw new Error(`Gemini API connection failed: ${this.connectionStatus.lastError}`);
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / 2; // 2 requests per second

    if (timeSinceLastRequest < minInterval) {
      const waitTime = minInterval - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>, 
    attempt: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= 3) { // max retries
        throw error;
      }

      const backoffTime = 1000 * Math.pow(2, attempt); // base delay
      const jitter = Math.random() * 0.1 * backoffTime;
      const totalDelay = backoffTime + jitter;

      console.log(`Retry attempt ${attempt + 1} after ${totalDelay}ms delay`);
      await new Promise(resolve => setTimeout(resolve, totalDelay));

      return this.retryWithBackoff(operation, attempt + 1);
    }
  }

  private validatePromptObject(promptObject: GeminiPromptObject): void {
    if (!promptObject.userQuery?.query || promptObject.userQuery.query.trim().length === 0) {
      throw new Error('User query is required and cannot be empty');
    }

    if (!promptObject.dataContext?.datasets || promptObject.dataContext.datasets.length === 0) {
      throw new Error('Data context must contain datasets');
    }

    if (!promptObject.reportRequirements?.reportType) {
      throw new Error('Report type is required');
    }
  }

  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[<>]/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeData(data[key]);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  private buildPromptFromObject(promptObject: GeminiPromptObject): string {
    const { userQuery, dataContext, reportRequirements, metadata, securityContext } = promptObject;
    
    let prompt = `You are an expert marketing data analyst. Analyze the following data and provide comprehensive insights.\n\n`;
    
    // Add user query context
    prompt += `USER QUERY: ${userQuery.query}\n`;
    if (userQuery.context) {
      prompt += `CONTEXT: ${userQuery.context}\n`;
    }
    if (userQuery.requirements?.length) {
      prompt += `REQUIREMENTS: ${userQuery.requirements.join(', ')}\n`;
    }
    
    // Add data context
    prompt += `\nDATA ANALYSIS:\n`;
    if (dataContext.datasets && dataContext.datasets.length > 0) {
      prompt += `Datasets: ${dataContext.datasets.length}\n`;
      dataContext.datasets.forEach(dataset => {
        prompt += `Dataset: ${dataset.name} (${dataset.type}) - ${dataset.recordCount} records\n`;
        if (dataset.fields && dataset.fields.length > 0) {
          prompt += `Fields: ${dataset.fields.join(', ')}\n`;
        }
      });
    }
    
    if (dataContext.metadata) {
      prompt += `Total Records: ${dataContext.metadata.totalRecords}\n`;
      prompt += `Data Quality: ${dataContext.metadata.dataQuality}\n`;
      prompt += `Last Updated: ${dataContext.metadata.lastUpdated}\n`;
    }
    
    // Add report requirements
    prompt += `\nREPORT REQUIREMENTS:\n`;
    prompt += `Type: ${reportRequirements.reportType}\n`;
    prompt += `Audience: ${reportRequirements.targetAudience || 'business'}\n`;
    prompt += `Delivery Format: ${reportRequirements.deliveryFormat || 'json'}\n`;
    
    if (reportRequirements.sections && reportRequirements.sections.length > 0) {
      prompt += `Required Sections: ${reportRequirements.sections.map(s => s.title).join(', ')}\n`;
    }
    
    if (reportRequirements.formatting) {
      prompt += `Include Charts: ${reportRequirements.formatting.includeCharts ? 'Yes' : 'No'}\n`;
      prompt += `Include Tables: ${reportRequirements.formatting.includeTables ? 'Yes' : 'No'}\n`;
      prompt += `Include Metrics: ${reportRequirements.formatting.includeMetrics ? 'Yes' : 'No'}\n`;
      prompt += `Include Recommendations: ${reportRequirements.formatting.includeRecommendations ? 'Yes' : 'No'}\n`;
    }
    
    // Add metadata
    if (metadata) {
      prompt += `\nANALYSIS METADATA:\n`;
      if (metadata.userId) {
        prompt += `User ID: ${metadata.userId}\n`;
      }
      if (metadata.sessionId) {
        prompt += `Session ID: ${metadata.sessionId}\n`;
      }
      if (metadata.priority) {
        prompt += `Priority: ${metadata.priority}\n`;
      }
      if (metadata.systemContext) {
        prompt += `System Context: ${metadata.systemContext}\n`;
      }
    }
    
    // Add security/compliance requirements
    if (securityContext) {
      prompt += `\nSECURITY & COMPLIANCE:\n`;
      if (securityContext.complianceRequirements?.length) {
        prompt += `Compliance: ${securityContext.complianceRequirements.join(', ')}\n`;
      }
      if (securityContext.dataSensitivity) {
        prompt += `Data Sensitivity: ${securityContext.dataSensitivity}\n`;
      }
    }
    
    // Final instructions
    prompt += `\nPROVIDE A COMPREHENSIVE ANALYSIS THAT INCLUDES:\n`;
    prompt += `1. Executive Summary with key findings\n`;
    prompt += `2. Detailed insights and patterns discovered\n`;
    prompt += `3. Actionable recommendations\n`;
    prompt += `4. Risk assessment and mitigation strategies\n`;
    prompt += `5. Performance metrics and KPI analysis\n`;
    prompt += `6. Future trend predictions\n`;
    prompt += `7. Data quality assessment\n`;
    
    if (reportRequirements.formatting?.includeCharts) {
      prompt += `8. Suggested visualizations and charts\n`;
    }
    
    prompt += `\nEnsure your analysis is data-driven, actionable, and tailored to the specified audience.\n`;
    
    return prompt;
  }

  private parseResponse(response: string): GeminiResponse {
    try {
      // Extract confidence score if present
      const confidenceMatch = response.match(/confidence:\s*(\d+(?:\.\d+)?)/i);
      const confidenceScore = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;

      // Extract insights and recommendations
      const insights: string[] = [];
      const recommendations: string[] = [];
      const metrics: Record<string, number> = {};

      // Simple extraction of key points
      const insightMatches = response.match(/(?:insight|finding|pattern):\s*([^\n]+)/gi);
      if (insightMatches) {
        insights.push(...insightMatches.map(match => match.replace(/^(?:insight|finding|pattern):\s*/i, '')));
      }

      const recommendationMatches = response.match(/(?:recommendation|suggestion):\s*([^\n]+)/gi);
      if (recommendationMatches) {
        recommendations.push(...recommendationMatches.map(match => match.replace(/^(?:recommendation|suggestion):\s*/i, '')));
      }

      // Extract metrics if present
      const metricMatches = response.match(/(\w+):\s*(\d+(?:\.\d+)?)/gi);
      if (metricMatches) {
        metricMatches.forEach(match => {
          const [key, value] = match.split(':');
          const numValue = parseFloat(value.trim());
          if (!isNaN(numValue)) {
            metrics[key.trim()] = numValue;
          }
        });
      }

      return {
        success: true,
        data: {
          insights: insights.length > 0 ? insights : [response.substring(0, 200)],
          recommendations: recommendations.length > 0 ? recommendations : ['Review the analysis provided'],
          metrics,
          rawResponse: response,
          confidenceScore,
          processingTime: Date.now() - this.metrics.lastRequestTimestamp,
          promptTokens: Math.ceil(response.length / 4), // rough estimate
          responseTokens: Math.ceil(response.length / 4),
          totalTokens: Math.ceil(response.length / 2)
        },
        metadata: {
          model: 'gemini-pro',
          version: '1.0',
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - this.metrics.lastRequestTimestamp
        }
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        success: false,
        data: {
          insights: ['Error generating insights'],
          recommendations: ['Please check the error details and try again'],
          metrics: {},
          rawResponse: response,
          confidenceScore: 0.0,
          processingTime: Date.now() - this.metrics.lastRequestTimestamp,
          promptTokens: 0,
          responseTokens: 0,
          totalTokens: 0
        },
        error: {
          code: 'PARSING_ERROR',
          message: error instanceof Error ? error.message : 'Failed to parse response',
          details: { retryable: true }
        },
        metadata: {
          model: 'gemini-pro',
          version: '1.0',
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - this.metrics.lastRequestTimestamp
        }
      };
    }
  }

  private extractSection(text: string, startMarker: string, endMarker?: string): string {
    const startIndex = text.toLowerCase().indexOf(startMarker.toLowerCase());
    if (startIndex === -1) return '';
    
    let endIndex = text.length;
    if (endMarker) {
      const tempEndIndex = text.toLowerCase().indexOf(endMarker.toLowerCase(), startIndex);
      if (tempEndIndex !== -1) {
        endIndex = tempEndIndex;
      }
    }
    
    return text.substring(startIndex, endIndex).trim();
  }

  private updateMetrics(success: boolean, responseTime: number): void {
    this.metrics.totalRequests++;
    this.metrics.lastRequestTimestamp = Date.now();
    
    if (success) {
      this.metrics.successfulRequests++;
      this.metrics.averageResponseTime = 
        (this.metrics.averageResponseTime * (this.metrics.totalRequests - 1) + responseTime) / this.metrics.totalRequests;
    } else {
      this.metrics.failedRequests++;
    }
  }

  public async generateInsights(promptObject: GeminiPromptObject): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    try {
      // Validate prompt object
      this.validatePromptObject(promptObject);
      
      // Sanitize data
      const sanitizedPromptObject = {
        ...promptObject,
        dataContext: {
          ...promptObject.dataContext,
          datasets: this.sanitizeData(promptObject.dataContext.datasets)
        }
      };
      
      // Enforce rate limit
      await this.enforceRateLimit();
      
      // Build prompt
      const prompt = this.buildPromptFromObject(sanitizedPromptObject);
      
      // Generate content with retry logic
      const result = await this.retryWithBackoff(async () => {
        if (!this.connectionStatus.isConnected) {
          await this.initializeConnection();
        }
        
        const generationResult = await this.model.generateContent(prompt);
        return generationResult;
      });
      
      const response = await result.response;
      const text = response.text();
      
      // Parse and structure the response
      const parsedResponse = this.parseResponse(text);
      
      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(true, responseTime);
      
      console.log('Gemini insights generated successfully');
      
      return parsedResponse;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateMetrics(false, responseTime);
      
      if (error instanceof Error && error.message.includes('rate limit')) {
        this.metrics.rateLimitHits++;
        console.warn('Rate limit hit, consider increasing rate limit configuration');
      }
      
      console.error('Error generating Gemini insights:', error);
      throw new Error(`Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public getMetrics(): any {
    return { ...this.metrics };
  }

  public getConnectionStatus(): any {
    return { ...this.connectionStatus };
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.connectionStatus.isConnected) {
        await this.initializeConnection();
      }
      
      // Simple test prompt
      const testPrompt = 'Hello, this is a health check. Please respond with "OK".';
      const result = await this.model.generateContent(testPrompt);
      const response = await result.response;
      const text = response.text();
      
      return text.toLowerCase().includes('ok');
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  public resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      lastRequestTimestamp: 0,
      rateLimitHits: 0
    };
  }
}
