export interface StatisticalResults {
  [fieldName: string]: FieldStatistics;
}

export interface FieldStatistics {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  standardDeviation: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  skewness: number;
  kurtosis: number;
  outliers: number[];
  nullCount: number;
  uniqueCount: number;
}

export const performStatisticalAnalysis = (data: any[]): StatisticalResults => {
  if (!data || data.length === 0) {
    return {};
  }

  const results: StatisticalResults = {};
  const numericFields = getNumericFields(data);

  numericFields.forEach(field => {
    const values = extractNumericValues(data, field);
    if (values.length > 0) {
      results[field] = calculateFieldStatistics(values);
    }
  });

  return results;
};

const getNumericFields = (data: any[]): string[] => {
  if (data.length === 0) return [];
  
  const firstRecord = data[0];
  const fields = Object.keys(firstRecord);
  
  return fields.filter(field => {
    return data.every(record => {
      const value = record[field];
      return value === null || value === undefined || value === '' || typeof value === 'number' || !isNaN(Number(value));
    });
  });
};

const extractNumericValues = (data: any[], field: string): number[] => {
  return data
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined && value !== '' && !isNaN(Number(value)))
    .map(value => Number(value));
};

const calculateFieldStatistics = (values: number[]): FieldStatistics => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const count = values.length;
  const mean = values.reduce((sum, val) => sum + val, 0) / count;
  const median = calculateMedian(sortedValues);
  const mode = calculateMode(values);
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
  const standardDeviation = Math.sqrt(variance);
  const min = sortedValues[0];
  const max = sortedValues[count - 1];
  const range = max - min;
  const quartiles = calculateQuartiles(sortedValues);
  const skewness = calculateSkewness(values, mean, standardDeviation);
  const kurtosis = calculateKurtosis(values, mean, standardDeviation);
  const outliers = detectOutliers(sortedValues, quartiles.q1, quartiles.q3);
  const uniqueCount = new Set(values).size;

  return {
    count,
    mean,
    median,
    mode,
    standardDeviation,
    variance,
    min,
    max,
    range,
    quartiles,
    skewness,
    kurtosis,
    outliers,
    nullCount: 0,
    uniqueCount
  };
};

const calculateMedian = (sortedValues: number[]): number => {
  const n = sortedValues.length;
  if (n % 2 === 0) {
    return (sortedValues[n / 2 - 1] + sortedValues[n / 2]) / 2;
  } else {
    return sortedValues[Math.floor(n / 2)];
  }
};

const calculateMode = (values: number[]): number[] => {
  const frequency: Record<number, number> = {};
  let maxFrequency = 0;
  
  values.forEach(value => {
    frequency[value] = (frequency[value] || 0) + 1;
    maxFrequency = Math.max(maxFrequency, frequency[value]);
  });
  
  return Object.keys(frequency)
    .map(Number)
    .filter(value => frequency[value] === maxFrequency);
};

const calculateQuartiles = (sortedValues: number[]): { q1: number; q2: number; q3: number } => {
  const n = sortedValues.length;
  const q1Index = Math.floor(n * 0.25);
  const q2Index = Math.floor(n * 0.5);
  const q3Index = Math.floor(n * 0.75);
  
  return {
    q1: sortedValues[q1Index],
    q2: sortedValues[q2Index],
    q3: sortedValues[q3Index]
  };
};

const calculateSkewness = (values: number[], mean: number, standardDeviation: number): number => {
  if (standardDeviation === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 3), 0);
  return sum / values.length;
};

const calculateKurtosis = (values: number[], mean: number, standardDeviation: number): number => {
  if (standardDeviation === 0) return 0;
  
  const sum = values.reduce((acc, val) => acc + Math.pow((val - mean) / standardDeviation, 4), 0);
  return (sum / values.length) - 3; // Excess kurtosis
};

const detectOutliers = (sortedValues: number[], q1: number, q3: number): number[] => {
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return sortedValues.filter(value => value < lowerBound || value > upperBound);
};

export const calculateCorrelation = (x: number[], y: number[]): number => {
  if (x.length !== y.length || x.length === 0) {
    return 0;
  }
  
  const n = x.length;
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0);
  const denominatorX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
  const denominatorY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));
  
  if (denominatorX === 0 || denominatorY === 0) {
    return 0;
  }
  
  return numerator / (denominatorX * denominatorY);
};

export const interpretCorrelation = (correlation: number): string => {
  const abs = Math.abs(correlation);
  
  if (abs >= 0.9) return 'very strong';
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.5) return 'moderate';
  if (abs >= 0.3) return 'weak';
  return 'very weak';
};

export const performTTest = (sample1: number[], sample2: number[]): { tStatistic: number; pValue: number; significant: boolean } => {
  const n1 = sample1.length;
  const n2 = sample2.length;
  
  if (n1 === 0 || n2 === 0) {
    return { tStatistic: 0, pValue: 1, significant: false };
  }
  
  const mean1 = sample1.reduce((sum, val) => sum + val, 0) / n1;
  const mean2 = sample2.reduce((sum, val) => sum + val, 0) / n2;
  
  const variance1 = sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (n1 - 1);
  const variance2 = sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (n2 - 1);
  
  const pooledVariance = ((n1 - 1) * variance1 + (n2 - 1) * variance2) / (n1 + n2 - 2);
  const standardError = Math.sqrt(pooledVariance * (1 / n1 + 1 / n2));
  
  const tStatistic = (mean1 - mean2) / standardError;
  
  // Simplified p-value calculation (two-tailed test)
  const degreesOfFreedom = n1 + n2 - 2;
  const pValue = approximatePValue(Math.abs(tStatistic), degreesOfFreedom);
  
  return {
    tStatistic,
    pValue,
    significant: pValue < 0.05
  };
};

const approximatePValue = (tStatistic: number, degreesOfFreedom: number): number => {
  // Simplified approximation using t-distribution
  // This is a rough approximation and should be replaced with proper statistical library for production use
  const a = degreesOfFreedom - 2;
  if (a <= 0) return 1;
  
  const x = (a / (a + tStatistic * tStatistic));
  const probability = 1 - Math.pow(x, a / 2);
  
  return 2 * probability; // Two-tailed test
};