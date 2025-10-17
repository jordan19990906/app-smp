export interface EmotionalEntry {
  id: string
  date: string
  emotion: string
  intensity: number
  message: string
  timestamp: number
}

export interface MoodData {
  date: string
  mood: number
  emotion: string
}

export interface EmotionDistribution {
  name: string
  value: number
  color: string
}

export interface EmotionType {
  name: string
  icon: any
  color: string
  value: string
}

export interface UserProgress {
  weeklyEntries: number
  averageMood: number
  consistency: number
}