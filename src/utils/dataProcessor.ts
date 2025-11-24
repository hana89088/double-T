export interface ProcessedDataRecord {
  [key: string]: any;
}

export interface ProcessingOptions {
  removeDuplicates?: boolean;
  fillMissingValues?: boolean;
  normalizeData?: boolean;
  convertDataTypes?: boolean;
}

export const processData = (
  data: any[],
  options: ProcessingOptions = {}
): ProcessedDataRecord[] => {
  if (!data || data.length === 0) {
    return [];
  }

  let processedData = [...data];

  // Remove duplicates if requested
  if (options.removeDuplicates) {
    processedData = removeDuplicates(processedData);
  }

  // Fill missing values if requested
  if (options.fillMissingValues) {
    processedData = fillMissingValues(processedData);
  }

  // Normalize data if requested
  if (options.normalizeData) {
    processedData = normalizeData(processedData);
  }

  // Convert data types if requested
  if (options.convertDataTypes) {
    processedData = convertDataTypes(processedData);
  }

  return processedData;
};

const removeDuplicates = (data: any[]): any[] => {
  const seen = new Set();
  return data.filter(record => {
    const key = JSON.stringify(record);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const fillMissingValues = (data: any[]): any[] => {
  if (data.length === 0) return data;

  const columns = Object.keys(data[0]);
  const columnStats = calculateColumnStats(data, columns);

  return data.map(record => {
    const filledRecord = { ...record };
    
    columns.forEach(column => {
      if (filledRecord[column] === null || filledRecord[column] === undefined || filledRecord[column] === '') {
        const stats = columnStats[column];
        if (stats.numeric) {
          filledRecord[column] = stats.mean || 0;
        } else {
          filledRecord[column] = stats.mode || 'Unknown';
        }
      }
    });
    
    return filledRecord;
  });
};

const normalizeData = (data: any[]): any[] => {
  if (data.length === 0) return data;

  const columns = Object.keys(data[0]);
  const numericColumns = columns.filter(column => {
    return data.every(record => {
      const value = record[column];
      return value === null || value === undefined || value === '' || typeof value === 'number';
    });
  });

  const columnRanges = calculateColumnRanges(data, numericColumns);

  return data.map(record => {
    const normalizedRecord = { ...record };
    
    numericColumns.forEach(column => {
      const value = normalizedRecord[column];
      const range = columnRanges[column];
      
      if (value !== null && value !== undefined && value !== '' && range.max > range.min) {
        normalizedRecord[column] = (value - range.min) / (range.max - range.min);
      }
    });
    
    return normalizedRecord;
  });
};

const convertDataTypes = (data: any[]): any[] => {
  if (data.length === 0) return data;

  const columns = Object.keys(data[0]);
  const dataTypes = inferDataTypes(data, columns);

  return data.map(record => {
    const convertedRecord = { ...record };
    
    columns.forEach(column => {
      const value = convertedRecord[column];
      const dataType = dataTypes[column];
      
      if (value !== null && value !== undefined && value !== '') {
        switch (dataType) {
          case 'number':
            convertedRecord[column] = Number(value);
            break;
          case 'date':
            convertedRecord[column] = new Date(value);
            break;
          case 'boolean':
            convertedRecord[column] = Boolean(value);
            break;
          default:
            convertedRecord[column] = String(value);
        }
      }
    });
    
    return convertedRecord;
  });
};

const calculateColumnStats = (data: any[], columns: string[]): Record<string, any> => {
  const stats: Record<string, any> = {};
  
  columns.forEach(column => {
    const values = data.map(record => record[column]).filter(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (values.length === 0) {
      stats[column] = { numeric: false, mean: null, mode: null };
      return;
    }
    
    const allNumeric = values.every(value => typeof value === 'number' || !isNaN(Number(value)));
    
    if (allNumeric) {
      const numericValues = values.map(value => Number(value));
      const mean = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
      
      stats[column] = {
        numeric: true,
        mean,
        mode: null
      };
    } else {
      const frequency: Record<string, number> = {};
      values.forEach(value => {
        const strValue = String(value);
        frequency[strValue] = (frequency[strValue] || 0) + 1;
      });
      
      const mode = Object.entries(frequency)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null;
      
      stats[column] = {
        numeric: false,
        mean: null,
        mode
      };
    }
  });
  
  return stats;
};

const calculateColumnRanges = (data: any[], numericColumns: string[]): Record<string, { min: number; max: number }> => {
  const ranges: Record<string, { min: number; max: number }> = {};
  
  numericColumns.forEach(column => {
    const values = data.map(record => record[column]).filter(value => 
      value !== null && value !== undefined && value !== '' && !isNaN(Number(value))
    ).map(value => Number(value));
    
    if (values.length > 0) {
      ranges[column] = {
        min: Math.min(...values),
        max: Math.max(...values)
      };
    } else {
      ranges[column] = { min: 0, max: 1 };
    }
  });
  
  return ranges;
};

const inferDataTypes = (data: any[], columns: string[]): Record<string, string> => {
  const dataTypes: Record<string, string> = {};
  
  columns.forEach(column => {
    const values = data.map(record => record[column]).filter(value => 
      value !== null && value !== undefined && value !== ''
    );
    
    if (values.length === 0) {
      dataTypes[column] = 'string';
      return;
    }
    
    // Check if all values are numbers
    if (values.every(value => typeof value === 'number' || !isNaN(Number(value)))) {
      dataTypes[column] = 'number';
    }
    // Check if all values are dates
    else if (values.every(value => !isNaN(Date.parse(String(value))))) {
      dataTypes[column] = 'date';
    }
    // Check if all values are booleans
    else if (values.every(value => typeof value === 'boolean' || value === 'true' || value === 'false')) {
      dataTypes[column] = 'boolean';
    }
    // Default to string
    else {
      dataTypes[column] = 'string';
    }
  });
  
  return dataTypes;
};

export const validateData = (data: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { isValid: false, errors };
  }
  
  if (data.length === 0) {
    errors.push('Data array is empty');
    return { isValid: false, errors };
  }
  
  const firstRecordKeys = Object.keys(data[0]);
  
  data.forEach((record, index) => {
    if (typeof record !== 'object' || record === null) {
      errors.push(`Record at index ${index} is not an object`);
      return;
    }
    
    const recordKeys = Object.keys(record);
    if (recordKeys.length !== firstRecordKeys.length) {
      errors.push(`Record at index ${index} has inconsistent number of fields`);
    }
    
    firstRecordKeys.forEach(key => {
      if (!(key in record)) {
        errors.push(`Record at index ${index} is missing field: ${key}`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};