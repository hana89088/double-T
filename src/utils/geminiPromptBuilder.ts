import { 
  GeminiPromptObject, 
  UserQuery, 
  DataContext, 
  ReportRequirements, 
  PromptMetadata, 
  SecurityContext,
  StatisticalSummary,
  Dataset
} from '../types/gemini';

export class GeminiPromptBuilder {
  private promptObject: Partial<GeminiPromptObject>;

  constructor() {
    this.promptObject = {};
  }

  // Set user query
  public setUserQuery(query: string, context?: string, requirements?: string[]): GeminiPromptBuilder {
    this.promptObject.userQuery = {
      query,
      context,
      requirements: requirements || []
    };
    return this;
  }

  // Set data context
  public setDataContext(
    datasets: Dataset[], 
    metadata?: {
      totalRecords: number
      dataQuality: number
      lastUpdated: string
    }
  ): GeminiPromptBuilder {
    this.promptObject.dataContext = {
      datasets,
      metadata: metadata || {
        totalRecords: datasets.reduce((sum, ds) => sum + ds.recordCount, 0),
        dataQuality: 0.8,
        lastUpdated: new Date().toISOString()
      }
    };
    return this;
  }

  // Set report requirements
  public setReportRequirements(
    reportType: string,
    targetAudience?: 'technical' | 'business' | 'executive' | 'client',
    deliveryFormat?: 'pdf' | 'html' | 'json' | 'markdown',
    sections?: Array<{
      title: string
      description: string
      required: boolean
      order?: number
      subsections?: any[]
    }>,
    formatting?: {
      includeCharts: boolean
      includeTables: boolean
      includeMetrics: boolean
      includeRecommendations: boolean
      confidenceIndicators: boolean
      dataSources: boolean
      executiveSummary: boolean
      detailedAnalysis: boolean
      template?: string
      branding?: {
        logo?: string
        companyName?: string
        primaryColor?: string
        secondaryColor?: string
      }
    }
  ): GeminiPromptBuilder {
    this.promptObject.reportRequirements = {
      reportType,
      targetAudience,
      deliveryFormat,
      sections,
      formatting: formatting || {
        includeCharts: true,
        includeTables: true,
        includeMetrics: true,
        includeRecommendations: true,
        confidenceIndicators: true,
        dataSources: true,
        executiveSummary: true,
        detailedAnalysis: true
      }
    };
    return this;
  }

  // Set metadata
  public setMetadata(
    userId?: string,
    sessionId?: string,
    priority?: 'low' | 'medium' | 'high' | 'critical',
    systemContext?: string,
    tags?: string[]
  ): GeminiPromptBuilder {
    this.promptObject.metadata = {
      userId,
      sessionId,
      priority,
      systemContext,
      tags: tags || []
    };
    return this;
  }

  // Set security context
  public setSecurityContext(
    dataSensitivity: 'public' | 'internal' | 'confidential' | 'restricted',
    complianceRequirements?: string[],
    encryptionLevel?: 'none' | 'basic' | 'enhanced' | 'maximum',
    accessControls?: {
      roles: string[]
      permissions: string[]
    },
    auditTrail?: {
      enabled: boolean
      retentionPeriod: number
    }
  ): GeminiPromptBuilder {
    this.promptObject.securityContext = {
      dataSensitivity,
      complianceRequirements: complianceRequirements || [],
      encryptionLevel,
      accessControls,
      auditTrail
    };
    return this;
  }

  // Build final prompt object
  public build(): GeminiPromptObject {
    if (!this.promptObject.userQuery || !this.promptObject.dataContext || !this.promptObject.reportRequirements) {
      throw new Error('User query, data context, and report requirements are required');
    }

    return this.promptObject as GeminiPromptObject;
  }

  // Create marketing insights prompt
  public static createMarketingInsightsPrompt(
    datasets: Dataset[],
    query: string = 'Analyze our marketing performance and provide actionable insights'
  ): GeminiPromptObject {
    return new GeminiPromptBuilder()
      .setUserQuery(query, 'Marketing performance analysis for data-driven decision making')
      .setDataContext(datasets)
      .setReportRequirements(
        'marketing_insights',
        'business',
        'json',
        [
          {
            title: 'Executive Summary',
            description: 'High-level overview of key findings',
            required: true,
            order: 1
          },
          {
            title: 'Performance Metrics',
            description: 'Detailed performance analysis',
            required: true,
            order: 2
          },
          {
            title: 'Recommendations',
            description: 'Actionable recommendations',
            required: true,
            order: 3
          }
        ]
      )
      .setMetadata(
        'marketing_user',
        'session_123',
        'medium'
      )
      .setSecurityContext(
        'internal',
        ['gdpr', 'marketing_compliance'],
        'basic'
      )
      .build();
  }
}

// Helper function to create sample datasets
export const createSampleDatasets = (): Dataset[] => {
  return [
    {
      name: 'Campaign Performance',
      type: 'marketing_metrics',
      recordCount: 100,
      fields: ['campaign_name', 'impressions', 'clicks', 'conversions', 'spend', 'revenue'],
      sampleData: {
        campaign_name: 'Winter Sale 2024',
        impressions: 125000,
        clicks: 3750,
        conversions: 150,
        spend: 2500,
        revenue: 15000
      },
      metadata: {
        createdAt: '2024-01-01T00:00:00Z',
        lastModified: '2024-01-31T23:59:59Z',
        source: 'Google Ads',
        format: 'csv'
      }
    }
  ];
};

export default {
  GeminiPromptBuilder,
  createSampleDatasets
};