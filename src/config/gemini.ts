import { GeminiAPIConfig } from '../types/gemini';

// Environment variable validation
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

// Configuration validation functions
const validateApiKey = (apiKey: string): boolean => {
  // Basic validation for Google AI API key format
  return apiKey && apiKey.length > 20 && apiKey.startsWith('AI');
};

const validateModelName = (modelName: string): boolean => {
  const validModels = [
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-1.0-pro'
  ];
  return validModels.includes(modelName);
};

// Default configuration
export const DEFAULT_GEMINI_CONFIG: GeminiAPIConfig = {
  apiKey: '',
  model: 'gemini-1.5-flash',
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192
};

// Create configuration from environment variables
export const createGeminiConfig = (): GeminiAPIConfig => {
  try {
    const apiKey = getEnvVar('VITE_GEMINI_API_KEY');
    const model = getEnvVar('VITE_GEMINI_MODEL_NAME', DEFAULT_GEMINI_CONFIG.model);
    
    // Validate API key
    if (!validateApiKey(apiKey)) {
      throw new Error('Invalid Gemini API key format. API key should start with "AI" and be longer than 20 characters.');
    }
    
    // Validate model name
    if (!validateModelName(model)) {
      throw new Error(`Invalid model name: ${model}. Valid models are: ${DEFAULT_GEMINI_CONFIG.model}, gemini-pro-vision, gemini-1.5-pro, gemini-1.5-flash, gemini-1.0-pro`);
    }
    
    // Parse optional configuration values
    const maxOutputTokens = parseInt(getEnvVar('VITE_GEMINI_MAX_TOKENS', String(DEFAULT_GEMINI_CONFIG.maxOutputTokens)));
    const temperature = parseFloat(getEnvVar('VITE_GEMINI_TEMPERATURE', String(DEFAULT_GEMINI_CONFIG.temperature)));
    const topP = parseFloat(getEnvVar('VITE_GEMINI_TOP_P', String(DEFAULT_GEMINI_CONFIG.topP)));
    const topK = parseInt(getEnvVar('VITE_GEMINI_TOP_K', String(DEFAULT_GEMINI_CONFIG.topK)));
    
    // Validate temperature
    if (temperature < 0 || temperature > 2) {
      throw new Error('Temperature must be between 0 and 2');
    }
    
    // Validate topP
    if (topP < 0 || topP > 1) {
      throw new Error('TopP must be between 0 and 1');
    }
    
    // Validate topK
    if (topK < 1 || topK > 100) {
      throw new Error('TopK must be between 1 and 100');
    }
    
    // Validate maxOutputTokens
    if (maxOutputTokens < 1 || maxOutputTokens > 8192) {
      throw new Error('Max output tokens must be between 1 and 8192');
    }
    
    const rateLimitRps = parseInt(getEnvVar('VITE_GEMINI_RATE_LIMIT_RPS', '2'))
    const maxConcurrent = parseInt(getEnvVar('VITE_GEMINI_MAX_CONCURRENT', '2'))
    
    return {
      apiKey,
      model,
      temperature,
      topP,
      topK,
      maxOutputTokens,
      rateLimitRps: isNaN(rateLimitRps) ? 2 : rateLimitRps,
      maxConcurrent: isNaN(maxConcurrent) ? 2 : maxConcurrent,
    } as any;
    
  } catch (error) {
    return {
      apiKey: '',
      model: DEFAULT_GEMINI_CONFIG.model,
      temperature: DEFAULT_GEMINI_CONFIG.temperature,
      topP: DEFAULT_GEMINI_CONFIG.topP,
      topK: DEFAULT_GEMINI_CONFIG.topK,
      maxOutputTokens: DEFAULT_GEMINI_CONFIG.maxOutputTokens,
      rateLimitRps: 2,
      maxConcurrent: 2,
    } as any;
  }
};
export const getGeminiConfig = () => createGeminiConfig();
