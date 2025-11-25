# Gemini API Integration Architecture

## Overview

This document provides comprehensive documentation for the Gemini API integration in our marketing insights platform. The integration enables AI-powered analysis and report generation using Google's Gemini Pro model, providing intelligent insights from marketing data.

## Architecture Components

### 1. Type System (`src/types/gemini.ts`)

The integration uses a comprehensive TypeScript type system that defines:

- **Core Types**:
  - `GeminiPromptObject`: Main prompt structure containing user query, data context, report requirements, metadata, and security settings
  - `GeminiResponse`: Structured response from Gemini API with content, confidence scores, sections, and metadata
  - `GeminiAPIConfig`: Configuration for API connection, rate limiting, retry logic, and model parameters

- **Data Types**:
  - `ProcessedDataRow`: Standardized data format for marketing analytics
  - `StatisticalSummary`: Comprehensive statistical analysis results
  - `Anomaly`: Data anomaly detection results
  - `ConfidenceScore`: AI confidence scoring system

### 2. API Service (`src/services/gemini/GeminiAPIService.ts`)

The main service class that handles:

- **Connection Management**:
  - Secure API key handling
  - Connection state monitoring
  - Health check functionality
  - Automatic reconnection on failures

- **Request Processing**:
  - Prompt object validation
  - Data sanitization and security
  - Rate limiting enforcement
  - Retry logic with exponential backoff

- **Response Processing**:
  - Structured response parsing
  - Confidence score extraction
  - Section-based content organization
  - Error handling and logging

### 3. Configuration System (`src/config/gemini.ts`)

Comprehensive configuration management including:

- **Environment Variables**:
  - `VITE_GEMINI_API_KEY`: Google AI API key
  - `VITE_GEMINI_MAX_TOKENS`: Token limit configuration
  - `VITE_GEMINI_TEMPERATURE`: Response creativity setting
  - `VITE_GEMINI_RATE_LIMIT_RPS`: Rate limiting configuration
  - `VITE_GEMINI_MAX_RETRIES`: Retry attempt configuration

- **Validation Functions**:
  - API key format validation
  - Model name validation
  - Rate limit validation
  - Configuration parameter bounds checking

### 4. Prompt Builder (`src/utils/geminiPromptBuilder.ts`)

Advanced prompt construction system featuring:

- **Builder Pattern**: Fluent interface for creating complex prompt objects
- **Template Functions**: Pre-built templates for common marketing analysis scenarios:
  - Marketing insights analysis
  - Performance analysis
  - Customer segmentation
  - Competitive analysis
  - Trend analysis

- **Sample Data Generation**: Helper functions for creating test datasets and statistical summaries

### 5. UI Integration (`src/components/GeminiReportGenerator.tsx`)

React component that provides:

- **User Interface**:
  - Query input and report type selection
  - Real-time report generation
  - Confidence score visualization
  - Section-based report display
  - Error handling and user feedback

- **Data Integration**:
  - Seamless integration with processed marketing data
  - Automatic data format conversion
  - Fallback to sample data when needed

## Key Features

### 1. Security and Data Protection

- **API Key Security**: Secure environment-based API key management
- **Data Sanitization**: HTML/script content removal to prevent injection attacks
- **Compliance Support**: GDPR and marketing compliance requirements
- **Data Sensitivity Levels**: Configurable data sensitivity settings

### 2. Performance Optimization

- **Rate Limiting**: Configurable requests per second with automatic throttling
- **Caching**: Optional response caching for improved performance
- **Connection Pooling**: Efficient connection management
- **Async Processing**: Non-blocking API calls with proper error handling

### 3. Reliability and Error Handling

- **Retry Logic**: Exponential backoff with jitter for transient failures
- **Health Monitoring**: Continuous connection health checks
- **Graceful Degradation**: Fallback mechanisms for service failures
- **Comprehensive Logging**: Detailed error tracking and metrics

### 4. Monitoring and Analytics

- **Performance Metrics**:
  - Request success/failure rates
  - Average response times
  - Rate limit hit tracking
  - Connection status monitoring

- **Usage Analytics**:
  - API call frequency
  - Response quality scoring
  - Error pattern analysis
  - Performance trend tracking

## Usage Examples

### Basic Report Generation

```typescript
import { GeminiAPIService } from '../services/gemini/GeminiAPIService';
import { GeminiPromptBuilder } from '../utils/geminiPromptBuilder';
import { getGeminiEnvironmentConfig } from '../config/gemini';

// Initialize service
const config = getGeminiEnvironmentConfig();
const geminiService = new GeminiAPIService(config);

// Create prompt using builder
const promptObject = GeminiPromptBuilder.createMarketingInsightsPrompt(
  processedData,
  'Analyze our Q4 marketing performance',
  'ecommerce'
);

// Generate insights
const response = await geminiService.generateInsights(promptObject);
console.log('Generated Report:', response.content);
console.log('Confidence Score:', response.confidenceScore.overall);
```

### Custom Prompt Creation

```typescript
const customPrompt = new GeminiPromptBuilder()
  .setUserQuery(
    'Analyze customer behavior patterns',
    'Focus on seasonal trends and purchase frequency',
    ['Include statistical significance', 'Use 95% confidence intervals']
  )
  .setDataContext(processedData, 0.9, statisticalSummary, anomalies)
  .setReportRequirements(
    'customer_behavior_analysis',
    'executive_summary',
    'c_level_executives',
    ['customer_lifetime_value', 'retention_rate', 'purchase_frequency'],
    ['customer_journey_map', 'cohort_analysis', 'predictive_charts'],
    true
  )
  .setMetadata('retail', 'last_12_months', 'north_america', 'crm_system')
  .setSecurityContext(8192, ['customer_privacy', 'data_anonymization'], 'high', 'advanced')
  .build();

const response = await geminiService.generateInsights(customPrompt);
```

### Health Monitoring

```typescript
// Check service health
const isHealthy = await geminiService.healthCheck();
console.log('Service Health:', isHealthy);

// Get performance metrics
const metrics = geminiService.getMetrics();
console.log('Success Rate:', metrics.successfulRequests / metrics.totalRequests);
console.log('Average Response Time:', metrics.averageResponseTime);

// Get connection status
const status = geminiService.getConnectionStatus();
console.log('Connection Status:', status.isConnected);
```

## Configuration

### Environment Setup

Create a `.env` file in your project root:

```bash
# Gemini API Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_MODEL_NAME=gemini-2.5-flash
VITE_GEMINI_MAX_TOKENS=8192
VITE_GEMINI_TEMPERATURE=0.7
VITE_GEMINI_TOP_P=0.8
VITE_GEMINI_TOP_K=40

# Rate Limiting Configuration
VITE_GEMINI_RATE_LIMIT_RPS=2
VITE_GEMINI_MAX_CONCURRENT=5
VITE_GEMINI_QUEUE_TIMEOUT=30000

# Retry Configuration
VITE_GEMINI_MAX_RETRIES=3
VITE_GEMINI_BASE_DELAY=1000
VITE_GEMINI_MAX_DELAY=30000

# General Configuration
VITE_GEMINI_TIMEOUT=30000
VITE_GEMINI_ENABLE_CACHING=true
VITE_GEMINI_CACHE_TIMEOUT=300000
VITE_GEMINI_ENABLE_METRICS=true
VITE_GEMINI_LOG_LEVEL=info
```

### API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with "AI")
4. Add it to your `.env` file as `VITE_GEMINI_API_KEY`

## Testing

### Unit Tests

The integration includes comprehensive unit tests covering:

- API service functionality
- Configuration validation
- Prompt builder operations
- Error handling scenarios
- Rate limiting behavior
- Retry logic implementation

Run tests with:
```bash
npm test src/services/gemini/__tests__/
```

### Integration Testing

Test the complete integration flow:

```typescript
// Test with sample data
const sampleData = createSampleProcessedData();
const prompt = GeminiPromptBuilder.createMarketingInsightsPrompt(sampleData);
const response = await geminiService.generateInsights(prompt);

// Verify response structure
expect(response.content).toBeDefined();
expect(response.confidenceScore.overall).toBeGreaterThan(0);
expect(response.sections.executiveSummary).toBeDefined();
```

## Best Practices

### 1. Security

- Never hardcode API keys in source code
- Use environment variables for sensitive configuration
- Implement proper data sanitization
- Follow principle of least privilege for API access

### 2. Performance

- Configure appropriate rate limits based on usage patterns
- Enable caching for frequently requested analyses
- Monitor API usage and optimize prompt complexity
- Use appropriate model selection for different use cases

### 3. Reliability

- Implement proper error handling and user feedback
- Use retry logic for transient failures
- Monitor service health and implement alerting
- Have fallback mechanisms for service unavailability

### 4. Data Quality

- Validate and clean input data before processing
- Use appropriate statistical summaries for context
- Monitor confidence scores and flag low-confidence results
- Implement data quality checks and anomaly detection

## Troubleshooting

### Common Issues

1. **API Key Issues**:
   - Ensure API key starts with "AI"
   - Verify key has not expired
   - Check API key permissions

2. **Rate Limiting**:
   - Reduce `VITE_GEMINI_RATE_LIMIT_RPS` if hitting limits
   - Implement client-side request queuing
   - Monitor rate limit hit metrics

3. **Connection Issues**:
   - Check network connectivity
   - Verify Google AI service status
   - Review connection timeout settings

4. **Response Quality**:
   - Adjust temperature settings for creativity vs. accuracy
   - Provide more detailed prompts for better context
   - Use appropriate model for your use case

### Debug Mode

Enable debug logging by setting:
```bash
VITE_GEMINI_LOG_LEVEL=debug
```

This will provide detailed logs for:
- API request/response details
- Connection status changes
- Rate limiting behavior
- Error stack traces

## Future Enhancements

### Planned Features

1. **Multi-Model Support**: Integration with additional AI models
2. **Advanced Analytics**: Enhanced statistical analysis capabilities
3. **Custom Model Training**: Fine-tuning for specific marketing domains
4. **Real-time Processing**: Streaming response support
5. **Advanced Visualization**: AI-generated chart recommendations

### Performance Improvements

1. **Caching Optimization**: Intelligent response caching
2. **Batch Processing**: Multiple request optimization
3. **Connection Pooling**: Enhanced connection management
4. **Response Streaming**: Real-time response delivery

## Support and Maintenance

### Regular Maintenance Tasks

1. Monitor API usage and costs
2. Update dependencies regularly
3. Review and update configuration settings
4. Analyze performance metrics and optimize
5. Update documentation with new features

### Getting Help

- Check the [Google AI documentation](https://ai.google.dev/)
- Review the troubleshooting section above
- Examine debug logs for detailed error information
- Test with sample data to isolate issues

---

This integration provides a robust, secure, and scalable solution for AI-powered marketing analytics. The comprehensive type system, error handling, and monitoring capabilities ensure reliable operation in production environments.