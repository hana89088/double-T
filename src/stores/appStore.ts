import { create } from 'zustand'
import { Dataset, Analysis, Visualization, Report, User } from '../types'

interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Data state
  datasets: Dataset[]
  currentDataset: Dataset | null
  
  // Analysis state
  analyses: Analysis[]
  currentAnalysis: Analysis | null
  isAnalyzing: boolean
  
  // Visualization state
  visualizations: Visualization[]
  currentVisualization: Visualization | null
  
  // Reports state
  reports: Report[]
  currentReport: Report | null
  
  // UI state
  isLoading: boolean
  error: string | null
  successMessage: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setDatasets: (datasets: Dataset[]) => void
  setCurrentDataset: (dataset: Dataset | null) => void
  setAnalyses: (analyses: Analysis[]) => void
  setCurrentAnalysis: (analysis: Analysis | null) => void
  setAnalyzing: (isAnalyzing: boolean) => void
  setVisualizations: (visualizations: Visualization[]) => void
  setCurrentVisualization: (visualization: Visualization | null) => void
  setReports: (reports: Report[]) => void
  setCurrentReport: (report: Report | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setSuccessMessage: (message: string | null) => void
  clearMessages: () => void
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  datasets: [],
  currentDataset: null,
  analyses: [],
  currentAnalysis: null,
  isAnalyzing: false,
  visualizations: [],
  currentVisualization: null,
  reports: [],
  currentReport: null,
  isLoading: false,
  error: null,
  successMessage: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setDatasets: (datasets) => set({ datasets }),
  
  setCurrentDataset: (currentDataset) => set({ currentDataset }),
  
  setAnalyses: (analyses) => set({ analyses }),
  
  setCurrentAnalysis: (currentAnalysis) => set({ currentAnalysis }),
  
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  
  setVisualizations: (visualizations) => set({ visualizations }),
  
  setCurrentVisualization: (currentVisualization) => set({ currentVisualization }),
  
  setReports: (reports) => set({ reports }),
  
  setCurrentReport: (currentReport) => set({ currentReport }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error, successMessage: null }),
  
  setSuccessMessage: (successMessage) => set({ successMessage, error: null }),
  
  clearMessages: () => set({ error: null, successMessage: null }),
}))