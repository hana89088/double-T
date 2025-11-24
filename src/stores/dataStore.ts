import { create } from 'zustand';

interface DataStore {
  originalData: any[];
  processedData: any[];
  setOriginalData: (data: any[]) => void;
  setProcessedData: (data: any[]) => void;
  clearData: () => void;
}

export const useDataStore = create<DataStore>((set) => ({
  originalData: [],
  processedData: [],
  setOriginalData: (data) => set({ originalData: data }),
  setProcessedData: (data) => set({ processedData: data }),
  clearData: () => set({ originalData: [], processedData: [] }),
}));