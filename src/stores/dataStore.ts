import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DataStore {
  originalData: any[];
  processedData: any[];
  ready: boolean;
  lastUpdated: string | null;
  checksums: { input: string; processed: string } | null;
  setOriginalData: (data: any[]) => void;
  setProcessedData: (data: any[]) => void;
  setReady: (ready: boolean) => void;
  setChecksums: (checksums: { input: string; processed: string }) => void;
  clearData: () => void;
}

export const useDataStore = create<DataStore>()(
  persist(
    (set) => ({
      originalData: [],
      processedData: [],
      ready: false,
      lastUpdated: null,
      checksums: null,
      setOriginalData: (data) => set({ originalData: data }),
      setProcessedData: (data) => set({ processedData: data }),
      setReady: (ready) => set({ ready, lastUpdated: new Date().toISOString() }),
      setChecksums: (checksums) => set({ checksums }),
      clearData: () => set({ originalData: [], processedData: [], ready: false, lastUpdated: null, checksums: null }),
    }),
    { name: 'data-store' }
  )
);
