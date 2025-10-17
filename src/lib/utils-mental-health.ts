import { EmotionalEntry, MoodData } from './types'

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateAverageMood = (entries: EmotionalEntry[]): number => {
  if (entries.length === 0) return 0
  
  const total = entries.reduce((sum, entry) => sum + entry.intensity, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export const getWeeklyEntries = (entries: EmotionalEntry[]): number => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return entries.filter(entry => 
    new Date(entry.timestamp) >= oneWeekAgo
  ).length
}

export const generateMoodData = (entries: EmotionalEntry[]): MoodData[] => {
  const last7Days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.timestamp)
      return entryDate.toDateString() === date.toDateString()
    })
    
    const averageMood = dayEntries.length > 0 
      ? dayEntries.reduce((sum, entry) => sum + entry.intensity, 0) / dayEntries.length
      : 0
    
    const mostCommonEmotion = dayEntries.length > 0
      ? dayEntries[0].emotion
      : 'neutro'
    
    last7Days.push({
      date: date.toISOString().split('T')[0],
      mood: Math.round(averageMood * 10) / 10,
      emotion: mostCommonEmotion
    })
  }
  
  return last7Days
}

export const getEmotionDistribution = (entries: EmotionalEntry[]) => {
  const emotionCounts: { [key: string]: number } = {}
  
  entries.forEach(entry => {
    emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1
  })
  
  const total = entries.length
  
  return Object.entries(emotionCounts).map(([emotion, count]) => ({
    name: emotion,
    value: Math.round((count / total) * 100),
    color: getEmotionColor(emotion)
  }))
}

export const getEmotionColor = (emotion: string): string => {
  const colors: { [key: string]: string } = {
    'muito-feliz': '#FFD700',
    'feliz': '#32CD32',
    'neutro': '#87CEEB',
    'triste': '#4169E1',
    'irritado': '#FF6347',
    'energetico': '#9370DB'
  }
  
  return colors[emotion] || '#87CEEB'
}

export const getMotivationalMessage = (): string => {
  const messages = [
    "Cada pequeno passo em direção ao autocuidado é uma vitória. Você está no caminho certo! 💛",
    "Lembre-se: é normal ter dias difíceis. O importante é continuar cuidando de si mesmo. 🌟",
    "Sua jornada de bem-estar é única. Celebre cada progresso, por menor que seja! 🎉",
    "Respirar fundo, se conectar consigo mesmo e seguir em frente. Você é mais forte do que imagina! 💪",
    "Hoje é uma nova oportunidade para cuidar da sua saúde mental. Você merece esse cuidado! 🌸",
    "Cada registro no seu diário é um ato de amor próprio. Continue assim! ❤️",
    "Não existe caminho perfeito para o bem-estar. O seu caminho é válido e importante! 🛤️"
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}

export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

export const loadFromLocalStorage = (key: string): any => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return null
  }
}