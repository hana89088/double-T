export const findCorrelations = (data: any[]): any[] => {
  // Simple correlation analysis implementation
  const correlations: any[] = [];
  
  if (data.length === 0) return correlations;
  
  const numericFields = Object.keys(data[0]).filter(key => 
    typeof data[0][key] === 'number'
  );
  
  for (let i = 0; i < numericFields.length; i++) {
    for (let j = i + 1; j < numericFields.length; j++) {
      const field1 = numericFields[i];
      const field2 = numericFields[j];
      
      const values1 = data.map(row => row[field1]).filter(val => val !== null && val !== undefined);
      const values2 = data.map(row => row[field2]).filter(val => val !== null && val !== undefined);
      
      if (values1.length === values2.length && values1.length > 0) {
        const correlation = calculateCorrelation(values1, values2);
        
        if (Math.abs(correlation) > 0.3) { // Only show meaningful correlations
          correlations.push({
            field1,
            field2,
            correlation,
            strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.5 ? 'moderate' : 'weak',
            direction: correlation > 0 ? 'positive' : 'negative'
          });
        }
      }
    }
  }
  
  return correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
};

function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}