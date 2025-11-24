export interface Pattern {
  type: 'trend' | 'seasonality' | 'anomaly' | 'correlation' | 'cluster' | 'outlier';
  description: string;
  field: string;
  confidence: number;
  strength: 'weak' | 'moderate' | 'strong';
  period?: number;
  amplitude?: number;
  phase?: number;
  dataPoints?: any[];
  metadata?: {
    detectedAt: string;
    algorithm: string;
    parameters: Record<string, any>;
  };
}

export const detectPatterns = (data: any[]): Pattern[] => {
  if (!data || data.length === 0) {
    return [];
  }

  const patterns: Pattern[] = [];
  const numericFields = getNumericFields(data);

  // Detect trends
  patterns.push(...detectTrends(data, numericFields));

  // Detect seasonality
  patterns.push(...detectSeasonality(data, numericFields));

  // Detect anomalies
  patterns.push(...detectAnomalies(data, numericFields));

  // Detect clusters
  patterns.push(...detectClusters(data, numericFields));

  // Detect outliers
  patterns.push(...detectOutliers(data, numericFields));

  return patterns.filter(pattern => pattern.confidence > 0.6);
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

const detectTrends = (data: any[], numericFields: string[]): Pattern[] => {
  const patterns: Pattern[] = [];
  
  numericFields.forEach(field => {
    const values = extractNumericValues(data, field);
    if (values.length < 3) return;

    const trend = calculateLinearTrend(values);
    
    if (Math.abs(trend.slope) > 0.1 && trend.rSquared > 0.3) {
      patterns.push({
        type: 'trend',
        description: `Shows a ${trend.slope > 0 ? 'positive' : 'negative'} trend with ${(trend.rSquared * 100).toFixed(1)}% confidence`,
        field,
        confidence: trend.rSquared,
        strength: trend.rSquared > 0.7 ? 'strong' : trend.rSquared > 0.5 ? 'moderate' : 'weak',
        metadata: {
          detectedAt: new Date().toISOString(),
          algorithm: 'linear_regression',
          parameters: {
            slope: trend.slope,
            intercept: trend.intercept,
            rSquared: trend.rSquared
          }
        }
      });
    }
  });
  
  return patterns;
};

const detectSeasonality = (data: any[], numericFields: string[]): Pattern[] => {
  const patterns: Pattern[] = [];
  
  numericFields.forEach(field => {
    const values = extractNumericValues(data, field);
    if (values.length < 12) return; // Need at least 12 data points for seasonality

    const seasonality = detectSeasonalPattern(values);
    
    if (seasonality.strength > 0.5) {
      patterns.push({
        type: 'seasonality',
        description: `Shows seasonal pattern with ${(seasonality.strength * 100).toFixed(1)}% strength`,
        field,
        confidence: seasonality.strength,
        strength: seasonality.strength > 0.7 ? 'strong' : 'moderate',
        period: seasonality.period,
        amplitude: seasonality.amplitude,
        phase: seasonality.phase,
        metadata: {
          detectedAt: new Date().toISOString(),
          algorithm: 'seasonal_decomposition',
          parameters: {
            period: seasonality.period,
            amplitude: seasonality.amplitude,
            phase: seasonality.phase
          }
        }
      });
    }
  });
  
  return patterns;
};

const detectAnomalies = (data: any[], numericFields: string[]): Pattern[] => {
  const patterns: Pattern[] = [];
  
  numericFields.forEach(field => {
    const values = extractNumericValues(data, field);
    if (values.length < 10) return;

    const anomalies = detectAnomalousValues(values);
    
    if (anomalies.length > 0) {
      patterns.push({
        type: 'anomaly',
        description: `Detected ${anomalies.length} anomalous values`,
        field,
        confidence: 0.8,
        strength: 'strong',
        dataPoints: anomalies,
        metadata: {
          detectedAt: new Date().toISOString(),
          algorithm: 'statistical_outlier_detection',
          parameters: {
            method: 'iqr',
            threshold: 1.5
          }
        }
      });
    }
  });
  
  return patterns;
};

const detectClusters = (data: any[], numericFields: string[]): Pattern[] => {
  const patterns: Pattern[] = [];
  
  if (numericFields.length < 2) return patterns;

  // Simple k-means clustering for 2D data
  const clusterResults = performKMeansClustering(data, numericFields.slice(0, 2), 3);
  
  if (clusterResults.clusters.length > 1) {
    patterns.push({
      type: 'cluster',
      description: `Data forms ${clusterResults.clusters.length} distinct clusters`,
      field: `${numericFields[0]} × ${numericFields[1]}`,
      confidence: clusterResults.silhouetteScore,
      strength: clusterResults.silhouetteScore > 0.7 ? 'strong' : clusterResults.silhouetteScore > 0.5 ? 'moderate' : 'weak',
      metadata: {
        detectedAt: new Date().toISOString(),
        algorithm: 'k_means',
        parameters: {
          k: 3,
          silhouetteScore: clusterResults.silhouetteScore,
          clusterSizes: clusterResults.clusterSizes
        }
      }
    });
  }
  
  return patterns;
};

const detectOutliers = (data: any[], numericFields: string[]): Pattern[] => {
  const patterns: Pattern[] = [];
  
  numericFields.forEach(field => {
    const values = extractNumericValues(data, field);
    if (values.length < 10) return;

    const outliers = detectOutlierValues(values);
    
    if (outliers.length > 0) {
      patterns.push({
        type: 'outlier',
        description: `Detected ${outliers.length} outlier values`,
        field,
        confidence: 0.9,
        strength: 'strong',
        dataPoints: outliers,
        metadata: {
          detectedAt: new Date().toISOString(),
          algorithm: 'iqr_method',
          parameters: {
            method: 'interquartile_range',
            multiplier: 1.5
          }
        }
      });
    }
  });
  
  return patterns;
};

const extractNumericValues = (data: any[], field: string): number[] => {
  return data
    .map(record => record[field])
    .filter(value => value !== null && value !== undefined && value !== '' && !isNaN(Number(value)))
    .map(value => Number(value));
};

const calculateLinearTrend = (values: number[]): { slope: number; intercept: number; rSquared: number } => {
  const n = values.length;
  const x = values.map((_, i) => i);
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = values.reduce((sum, yi) => sum + yi * yi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const meanY = sumY / n;
  const totalSumSquares = sumYY - n * meanY * meanY;
  const residualSumSquares = values.reduce((sum, yi, i) => {
    const predicted = slope * x[i] + intercept;
    return sum + Math.pow(yi - predicted, 2);
  }, 0);
  
  const rSquared = 1 - (residualSumSquares / totalSumSquares);
  
  return { slope, intercept, rSquared };
};

const detectSeasonalPattern = (values: number[]): { strength: number; period?: number; amplitude?: number; phase?: number } => {
  // Simplified seasonality detection using autocorrelation
  const maxLag = Math.min(values.length / 2, 24);
  let maxCorrelation = 0;
  let bestPeriod = 0;
  
  for (let lag = 2; lag <= maxLag; lag++) {
    const correlation = calculateAutocorrelation(values, lag);
    if (correlation > maxCorrelation) {
      maxCorrelation = correlation;
      bestPeriod = lag;
    }
  }
  
  if (maxCorrelation > 0.3) {
    const amplitude = calculateAmplitude(values, bestPeriod);
    const phase = calculatePhase(values, bestPeriod);
    
    return {
      strength: maxCorrelation,
      period: bestPeriod,
      amplitude,
      phase
    };
  }
  
  return { strength: 0 };
};

const calculateAutocorrelation = (values: number[], lag: number): number => {
  const n = values.length;
  if (lag >= n) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n - lag; i++) {
    numerator += (values[i] - mean) * (values[i + lag] - mean);
  }
  
  for (let i = 0; i < n; i++) {
    denominator += Math.pow(values[i] - mean, 2);
  }
  
  return denominator === 0 ? 0 : numerator / denominator;
};

const calculateAmplitude = (values: number[], period: number): number => {
  const seasonalMeans: number[] = [];
  
  for (let i = 0; i < period; i++) {
    const seasonalValues = [];
    for (let j = i; j < values.length; j += period) {
      seasonalValues.push(values[j]);
    }
    
    if (seasonalValues.length > 0) {
      const mean = seasonalValues.reduce((sum, val) => sum + val, 0) / seasonalValues.length;
      seasonalMeans.push(mean);
    }
  }
  
  const maxMean = Math.max(...seasonalMeans);
  const minMean = Math.min(...seasonalMeans);
  
  return (maxMean - minMean) / 2;
};

const calculatePhase = (values: number[], period: number): number => {
  const seasonalMeans: number[] = [];
  
  for (let i = 0; i < period; i++) {
    const seasonalValues = [];
    for (let j = i; j < values.length; j += period) {
      seasonalValues.push(values[j]);
    }
    
    if (seasonalValues.length > 0) {
      const mean = seasonalValues.reduce((sum, val) => sum + val, 0) / seasonalValues.length;
      seasonalMeans.push(mean);
    }
  }
  
  const maxIndex = seasonalMeans.indexOf(Math.max(...seasonalMeans));
  return (maxIndex / period) * 2 * Math.PI;
};

const detectAnomalousValues = (values: number[]): number[] => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(value => value < lowerBound || value > upperBound);
};

const performKMeansClustering = (data: any[], fields: string[], k: number): { 
  clusters: number[][]; 
  silhouetteScore: number;
  clusterSizes: number[];
} => {
  const points = data.map(record => fields.map(field => Number(record[field]) || 0));
  
  // Simple k-means implementation
  const centroids = initializeCentroids(points, k);
  let clusters: number[][] = [];
  let previousClusters: number[][] = [];
  let iterations = 0;
  const maxIterations = 100;
  
  do {
    previousClusters = clusters;
    clusters = assignPointsToClusters(points, centroids);
    updateCentroids(points, clusters, centroids);
    iterations++;
  } while (!clustersEqual(clusters, previousClusters) && iterations < maxIterations);
  
  const clusterSizes = clusters.map(cluster => cluster.length);
  const silhouetteScore = calculateSilhouetteScore(points, clusters, centroids);
  
  return { clusters, silhouetteScore, clusterSizes };
};

const initializeCentroids = (points: number[][], k: number): number[][] => {
  const centroids: number[][] = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < k; i++) {
    let index;
    do {
      index = Math.floor(Math.random() * points.length);
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    centroids.push([...points[index]]);
  }
  
  return centroids;
};

const assignPointsToClusters = (points: number[][], centroids: number[][]): number[][] => {
  const clusters: number[][] = Array(centroids.length).fill(null).map(() => []);
  
  points.forEach((point, pointIndex) => {
    let minDistance = Infinity;
    let closestCentroid = 0;
    
    centroids.forEach((centroid, centroidIndex) => {
      const distance = euclideanDistance(point, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        closestCentroid = centroidIndex;
      }
    });
    
    clusters[closestCentroid].push(pointIndex);
  });
  
  return clusters;
};

const updateCentroids = (points: number[][], clusters: number[][], centroids: number[][]): void => {
  clusters.forEach((cluster, clusterIndex) => {
    if (cluster.length === 0) return;
    
    const newCentroid = calculateCentroid(points, cluster);
    centroids[clusterIndex] = newCentroid;
  });
};

const calculateCentroid = (points: number[][], cluster: number[]): number[] => {
  const dimensions = points[0].length;
  const centroid = Array(dimensions).fill(0);
  
  cluster.forEach(pointIndex => {
    const point = points[pointIndex];
    point.forEach((coord, dim) => {
      centroid[dim] += coord;
    });
  });
  
  return centroid.map(coord => coord / cluster.length);
};

const euclideanDistance = (point1: number[], point2: number[]): number => {
  return Math.sqrt(point1.reduce((sum, coord, i) => sum + Math.pow(coord - point2[i], 2), 0));
};

const clustersEqual = (clusters1: number[][], clusters2: number[][]): boolean => {
  if (clusters1.length !== clusters2.length) return false;
  
  return clusters1.every((cluster, index) => {
    const otherCluster = clusters2[index];
    return cluster.length === otherCluster.length && cluster.every(point => otherCluster.includes(point));
  });
};

const calculateSilhouetteScore = (points: number[][], clusters: number[][], centroids: number[][]): number => {
  let totalSilhouette = 0;
  let totalPoints = 0;
  
  clusters.forEach((cluster, clusterIndex) => {
    cluster.forEach(pointIndex => {
      const point = points[pointIndex];
      
      // Calculate a(i) - average distance to points in same cluster
      const a = calculateAverageDistanceToCluster(point, points, cluster);
      
      // Calculate b(i) - minimum average distance to points in other clusters
      let b = Infinity;
      clusters.forEach((otherCluster, otherClusterIndex) => {
        if (otherClusterIndex === clusterIndex) return;
        
        const avgDistance = calculateAverageDistanceToCluster(point, points, otherCluster);
        b = Math.min(b, avgDistance);
      });
      
      // Calculate silhouette coefficient for this point
      const silhouette = (b - a) / Math.max(a, b);
      totalSilhouette += silhouette;
      totalPoints++;
    });
  });
  
  return totalPoints > 0 ? totalSilhouette / totalPoints : 0;
};

const calculateAverageDistanceToCluster = (point: number[], points: number[][], cluster: number[]): number => {
  if (cluster.length <= 1) return 0;
  
  let totalDistance = 0;
  cluster.forEach(otherPointIndex => {
    totalDistance += euclideanDistance(point, points[otherPointIndex]);
  });
  
  return totalDistance / cluster.length;
};

const detectOutlierValues = (values: number[]): number[] => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sortedValues.length * 0.25);
  const q3Index = Math.floor(sortedValues.length * 0.75);
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  
  return values.filter(value => value < lowerBound || value > upperBound);
};