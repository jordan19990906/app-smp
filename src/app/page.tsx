'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  Heart, Brain, MessageCircle, TrendingUp, Calendar, BookOpen, Users, Smile, Frown, Meh, Angry, Laugh, Zap, Sparkles,
  Menu, X, ExternalLink, Clock, Bell, Activity, AlertTriangle, Phone, Plus, Edit, Trash2, CheckCircle, Bot, Crown, Leaf, Target, Archive, MapPin, Navigation, Shield, Settings, User, Lock, CreditCard, Mail, Eye, EyeOff, Send
} from 'lucide-react'
import { EmotionalEntry, EmotionType } from '@/lib/types'
import { 
  calculateAverageMood, 
  getWeeklyEntries, 
  generateMoodData, 
  getEmotionDistribution,
  getMotivationalMessage,
  saveToLocalStorage,
  loadFromLocalStorage,
  formatDate
} from '@/lib/utils-mental-health'

const emotions: EmotionType[] = [
  { name: 'Muito Feliz', icon: Laugh, color: 'text-yellow-500', value: 'muito-feliz' },
  { name: 'Feliz', icon: Smile, color: 'text-green-500', value: 'feliz' },
  { name: 'Neutro', icon: Meh, color: 'text-gray-500', value: 'neutro' },
  { name: 'Triste', icon: Frown, color: 'text-blue-500', value: 'triste' },
  { name: 'Irritado', icon: Angry, color: 'text-red-500', value: 'irritado' },
  { name: 'Energético', icon: Zap, color: 'text-purple-500', value: 'energetico' },
]

interface ScheduleItem {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number // em minutos
  category: 'corpo' | 'mente'
  completed: boolean
}

interface Alert {
  id: string
  scheduleId: string
  title: string
  message: string
  triggerTime: number
  isActive: boolean
}

interface RoutineItem {
  id: string
  title: string
  description: string
  category: 'treino' | 'alimentacao' | 'conselho'
  completed: boolean
  streak: number
}

interface ChatMessage {
  id: string
  message: string
  isBot: boolean
  timestamp: number
}

interface DailyHours {
  sono: number
  celular: number
  lazer: number
  trabalho: number
  outros: number
}

interface MonthlyProgress {
  month: string
  score: number
}

interface Goal {
  id: string
  title: string
  description: string
  type: 'curto' | 'longo'
  targetDate: string
  completed: boolean
  createdAt: number
}

interface HistoryEntry {
  id: string
  type: 'conversa' | 'meta' | 'rotina' | 'grafico'
  title: string
  description: string
  data: any
  timestamp: number
  date: string
}

interface Professional {
  id: string
  name: string
  type: 'psicologo' | 'personal'
  specialty: string
  rating: number
  distance: number
  price: number
  image: string
  available: boolean
}

interface UserProfile {
  name: string
  email: string
  phone: string
  birthDate: string
  gender: string
  emergencyContact: string
}

interface PaymentMethod {
  id: string
  type: 'credit' | 'debit' | 'pix'
  lastFour: string
  brand: string
  isDefault: boolean
}

interface Subscription {
  id: string
  plan: string
  status: 'active' | 'cancelled' | 'expired'
  nextBilling: string
  amount: number
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  description: string
}

export default function SaudeMentalPlena() {
  const [entries, setEntries] = useState<EmotionalEntry[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [selectedEmotion, setSelectedEmotion] = useState('')
  const [emotionIntensity, setEmotionIntensity] = useState(5)
  const [activeTab, setActiveTab] = useState('diario')
  const [motivationalMessage, setMotivationalMessage] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('diario')
  
  // Estados para cronograma
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [newScheduleItem, setNewScheduleItem] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    category: 'corpo' as 'corpo' | 'mente'
  })
  
  // Estados para alertas
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([])
  
  // Estados para rotina
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([
    {
      id: '1',
      title: 'Exercício Matinal',
      description: '30 minutos de caminhada ou exercício leve',
      category: 'treino',
      completed: false,
      streak: 0
    },
    {
      id: '2',
      title: 'Hidratação',
      description: 'Beber pelo menos 2 litros de água ao longo do dia',
      category: 'alimentacao',
      completed: false,
      streak: 0
    },
    {
      id: '3',
      title: 'Respiração Consciente',
      description: '5 minutos de respiração profunda para reduzir o estresse',
      category: 'conselho',
      completed: false,
      streak: 0
    }
  ])
  
  // Estados para chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatStep, setChatStep] = useState(0)
  
  // Mensagem do dia
  const [dailyMessage, setDailyMessage] = useState('')

  // Estados para os gráficos
  const [dailyHours, setDailyHours] = useState<DailyHours>({
    sono: 8,
    celular: 4,
    lazer: 3,
    trabalho: 8,
    outros: 1
  })

  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress[]>([
    { month: 'Jan', score: 6.5 },
    { month: 'Fev', score: 7.2 },
    { month: 'Mar', score: 6.8 },
    { month: 'Abr', score: 7.5 },
    { month: 'Mai', score: 8.1 },
    { month: 'Jun', score: 7.9 },
    { month: 'Jul', score: 8.3 },
    { month: 'Ago', score: 8.7 },
    { month: 'Set', score: 8.2 },
    { month: 'Out', score: 8.9 },
    { month: 'Nov', score: 9.1 },
    { month: 'Dez', score: 9.3 }
  ])

  // Estados para Visão de Futuro
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'curto' as 'curto' | 'longo',
    targetDate: ''
  })

  // Estados para Histórico
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([])
  const [historyFilter, setHistoryFilter] = useState<'todos' | 'conversa' | 'meta' | 'rotina' | 'grafico'>('todos')

  // Estados para Perto de Mim
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt')
  const [nearbyProfessionals, setNearbyProfessionals] = useState<Professional[]>([])
  const [searchRadius, setSearchRadius] = useState(5) // km
  const [professionalFilter, setProfessionalFilter] = useState<'todos' | 'psicologo' | 'personal'>('todos')

  // Estados para Gerenciar Conta
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [accountTab, setAccountTab] = useState<'profile' | 'security' | 'payments'>('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1990-05-15',
    gender: 'masculino',
    emergencyContact: '(11) 88888-8888'
  })
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit',
      lastFour: '1234',
      brand: 'Visa',
      isDefault: true
    },
    {
      id: '2',
      type: 'pix',
      lastFour: '9999',
      brand: 'PIX',
      isDefault: false
    }
  ])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      plan: 'Saúde Mental Plena Premium',
      status: 'active',
      nextBilling: '2024-02-15',
      amount: 49.90
    }
  ])
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      date: '2024-01-15',
      amount: 49.90,
      status: 'paid',
      description: 'Saúde Mental Plena Premium - Janeiro'
    },
    {
      id: '2',
      date: '2023-12-15',
      amount: 49.90,
      status: 'paid',
      description: 'Saúde Mental Plena Premium - Dezembro'
    }
  ])

  // Carregar dados do localStorage
  useEffect(() => {
    const savedEntries = loadFromLocalStorage('saudeMentalEntries')
    const savedSchedule = loadFromLocalStorage('scheduleItems')
    const savedAlerts = loadFromLocalStorage('alerts')
    const savedRoutine = loadFromLocalStorage('routineItems')
    const savedDailyMessage = loadFromLocalStorage('dailyMessage')
    const savedChatMessages = loadFromLocalStorage('chatMessages')
    const savedDailyHours = loadFromLocalStorage('dailyHours')
    const savedMonthlyProgress = loadFromLocalStorage('monthlyProgress')
    const savedGoals = loadFromLocalStorage('goals')
    const savedHistory = loadFromLocalStorage('historyEntries')
    const savedUserProfile = loadFromLocalStorage('userProfile')
    
    if (savedEntries) setEntries(savedEntries)
    if (savedSchedule) setScheduleItems(savedSchedule)
    if (savedAlerts) setAlerts(savedAlerts)
    if (savedRoutine) setRoutineItems(savedRoutine)
    if (savedDailyMessage) setDailyMessage(savedDailyMessage)
    if (savedChatMessages) setChatMessages(savedChatMessages)
    if (savedDailyHours) setDailyHours(savedDailyHours)
    if (savedMonthlyProgress) setMonthlyProgress(savedMonthlyProgress)
    if (savedGoals) setGoals(savedGoals)
    if (savedHistory) setHistoryEntries(savedHistory)
    if (savedUserProfile) setUserProfile(savedUserProfile)
    
    setMotivationalMessage(getMotivationalMessage())
  }, [])

  // Salvar dados no localStorage
  useEffect(() => {
    if (entries.length > 0) saveToLocalStorage('saudeMentalEntries', entries)
  }, [entries])
  
  useEffect(() => {
    if (scheduleItems.length > 0) saveToLocalStorage('scheduleItems', scheduleItems)
  }, [scheduleItems])
  
  useEffect(() => {
    if (alerts.length > 0) saveToLocalStorage('alerts', alerts)
  }, [alerts])
  
  useEffect(() => {
    if (routineItems.length > 0) saveToLocalStorage('routineItems', routineItems)
  }, [routineItems])
  
  useEffect(() => {
    if (dailyMessage) saveToLocalStorage('dailyMessage', dailyMessage)
  }, [dailyMessage])
  
  useEffect(() => {
    if (chatMessages.length > 0) saveToLocalStorage('chatMessages', chatMessages)
  }, [chatMessages])

  useEffect(() => {
    saveToLocalStorage('dailyHours', dailyHours)
  }, [dailyHours])

  useEffect(() => {
    saveToLocalStorage('monthlyProgress', monthlyProgress)
  }, [monthlyProgress])

  useEffect(() => {
    saveToLocalStorage('goals', goals)
  }, [goals])

  useEffect(() => {
    saveToLocalStorage('historyEntries', historyEntries)
  }, [historyEntries])

  useEffect(() => {
    saveToLocalStorage('userProfile', userProfile)
  }, [userProfile])

  // Função para adicionar entrada ao histórico
  const addToHistory = (type: 'conversa' | 'meta' | 'rotina' | 'grafico', title: string, description: string, data: any) => {
    const historyEntry: HistoryEntry = {
      id: Date.now().toString(),
      type,
      title,
      description,
      data,
      timestamp: Date.now(),
      date: formatDate(new Date())
    }
    
    setHistoryEntries(prev => [historyEntry, ...prev])
  }

  // Sistema de alertas para cronograma
  useEffect(() => {
    const checkAlerts = () => {
      const now = Date.now()
      const newActiveAlerts: Alert[] = []
      
      scheduleItems.forEach(item => {
        if (!item.completed) {
          const itemDateTime = new Date(`${item.date}T${item.time}`).getTime()
          const endTime = itemDateTime + (item.duration * 60 * 1000)
          
          if (now > endTime) {
            const alert: Alert = {
              id: `alert-${item.id}`,
              scheduleId: item.id,
              title: `Tempo Excedido: ${item.title}`,
              message: `Você passou do tempo programado para "${item.title}". Tempo programado: ${item.duration} minutos.`,
              triggerTime: now,
              isActive: true
            }
            newActiveAlerts.push(alert)
          }
        }
      })
      
      // Verificar alertas de metas próximas do prazo
      goals.forEach(goal => {
        if (!goal.completed) {
          const targetDate = new Date(goal.targetDate).getTime()
          const daysUntilTarget = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24))
          
          if (daysUntilTarget <= 7 && daysUntilTarget > 0) {
            const alert: Alert = {
              id: `goal-alert-${goal.id}`,
              scheduleId: goal.id,
              title: `Meta Próxima do Prazo: ${goal.title}`,
              message: `Sua meta "${goal.title}" tem prazo em ${daysUntilTarget} dia(s). Não esqueça de trabalhar nela!`,
              triggerTime: now,
              isActive: true
            }
            newActiveAlerts.push(alert)
          } else if (daysUntilTarget <= 0) {
            const alert: Alert = {
              id: `goal-expired-${goal.id}`,
              scheduleId: goal.id,
              title: `Meta Vencida: ${goal.title}`,
              message: `O prazo da sua meta "${goal.title}" já passou. Que tal revisar e definir uma nova data?`,
              triggerTime: now,
              isActive: true
            }
            newActiveAlerts.push(alert)
          }
        }
      })
      
      setActiveAlerts(newActiveAlerts)
    }
    
    const interval = setInterval(checkAlerts, 60000) // Verifica a cada minuto
    checkAlerts() // Verificação inicial
    return () => clearInterval(interval)
  }, [scheduleItems, goals])

  // Função para solicitar localização GPS
  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada pelo seu navegador')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocationPermission('granted')
        // Simular busca de profissionais próximos
        searchNearbyProfessionals(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.error('Erro ao obter localização:', error)
        setLocationPermission('denied')
        alert('Não foi possível obter sua localização. Verifique as permissões do navegador.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  }

  // Simular busca de profissionais próximos
  const searchNearbyProfessionals = (lat: number, lng: number) => {
    // Dados simulados de profissionais próximos
    const mockProfessionals: Professional[] = [
      {
        id: '1',
        name: 'Dra. Ana Silva',
        type: 'psicologo',
        specialty: 'Terapia Cognitivo-Comportamental',
        rating: 4.8,
        distance: 1.2,
        price: 150,
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
        available: true
      },
      {
        id: '2',
        name: 'Carlos Mendes',
        type: 'personal',
        specialty: 'Treinamento Funcional',
        rating: 4.9,
        distance: 0.8,
        price: 80,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop&crop=face',
        available: true
      },
      {
        id: '3',
        name: 'Dr. Roberto Costa',
        type: 'psicologo',
        specialty: 'Psicologia Clínica',
        rating: 4.7,
        distance: 2.1,
        price: 180,
        image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
        available: false
      },
      {
        id: '4',
        name: 'Marina Santos',
        type: 'personal',
        specialty: 'Pilates e Yoga',
        rating: 4.6,
        distance: 1.5,
        price: 90,
        image: 'https://images.unsplash.com/photo-1594824388853-e0c8b8e8e7e8?w=400&h=400&fit=crop&crop=face',
        available: true
      },
      {
        id: '5',
        name: 'Dra. Fernanda Lima',
        type: 'psicologo',
        specialty: 'Terapia de Casal',
        rating: 4.9,
        distance: 3.2,
        price: 200,
        image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
        available: true
      }
    ]

    // Filtrar por raio de busca
    const filtered = mockProfessionals.filter(prof => prof.distance <= searchRadius)
    setNearbyProfessionals(filtered)
  }

  // Inicializar chatbot
  const initializeChatbot = () => {
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      message: "Olá! Sou seu assistente de bem-estar. Posso te ajudar a encontrar o profissional ideal para você. Você está procurando apoio de um psicólogo ou um personal trainer?",
      isBot: true,
      timestamp: Date.now()
    }
    setChatMessages([initialMessage])
    setChatStep(1)
    setActiveSection('chatbot')
  }

  const handleChatResponse = (response: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: response,
      isBot: false,
      timestamp: Date.now()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    
    // Adicionar conversa ao histórico
    addToHistory('conversa', 'Conversa com Assistente', `Usuário: ${response}`, { userMessage })
    
    setTimeout(() => {
      let botResponse = ""
      
      if (chatStep === 1) {
        if (response.toLowerCase().includes('psicólogo') || response.toLowerCase().includes('psicologo')) {
          botResponse = "Ótima escolha! Um psicólogo pode te ajudar com questões emocionais, ansiedade, depressão e desenvolvimento pessoal. Gostaria que eu te conecte com nossos profissionais especializados ou prefere explorar nossos recursos de autoajuda primeiro?"
        } else if (response.toLowerCase().includes('personal') || response.toLowerCase().includes('trainer')) {
          botResponse = "Excelente! Um personal trainer pode te ajudar a criar uma rotina de exercícios personalizada e alcançar seus objetivos físicos. Que tal conhecer nosso AtlasFit Premium com os melhores treinos e dietas?"
        } else {
          botResponse = "Entendo. Posso te ajudar com ambas as áreas! Temos recursos tanto para saúde mental quanto física. Você gostaria de saber mais sobre nossos serviços de psicologia ou fitness?"
        }
        setChatStep(2)
      } else {
        botResponse = "Obrigado pelo seu interesse! Nossa equipe entrará em contato em breve. Enquanto isso, explore nossos recursos disponíveis no aplicativo."
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        isBot: true,
        timestamp: Date.now()
      }
      
      setChatMessages(prev => [...prev, botMessage])
      
      // Adicionar resposta do bot ao histórico
      addToHistory('conversa', 'Resposta do Assistente', `Bot: ${botResponse}`, { botMessage })
    }, 1000)
  }

  const handleSubmitEntry = () => {
    if (!currentMessage.trim() || !selectedEmotion) return

    const newEntry: EmotionalEntry = {
      id: Date.now().toString(),
      date: formatDate(new Date()),
      emotion: selectedEmotion,
      intensity: emotionIntensity,
      message: currentMessage,
      timestamp: Date.now()
    }

    setEntries(prev => [newEntry, ...prev])
    setCurrentMessage('')
    setSelectedEmotion('')
    setEmotionIntensity(5)
    
    setMotivationalMessage(getMotivationalMessage())
  }

  const handleAddScheduleItem = () => {
    if (!newScheduleItem.title || !newScheduleItem.date || !newScheduleItem.time) return
    
    const item: ScheduleItem = {
      id: Date.now().toString(),
      ...newScheduleItem,
      completed: false
    }
    
    setScheduleItems(prev => [...prev, item])
    setNewScheduleItem({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      category: 'corpo'
    })
  }

  const toggleScheduleComplete = (id: string) => {
    setScheduleItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const deleteScheduleItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id))
  }

  const toggleRoutineComplete = (id: string) => {
    const item = routineItems.find(r => r.id === id)
    if (item) {
      const newCompleted = !item.completed
      const newStreak = newCompleted ? item.streak + 1 : Math.max(0, item.streak - 1)
      
      // Adicionar ao histórico
      addToHistory('rotina', `Rotina ${newCompleted ? 'Completada' : 'Desmarcada'}`, 
        `${item.title} - ${item.description}`, 
        { routineId: id, completed: newCompleted, streak: newStreak })
    }
    
    setRoutineItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              completed: !item.completed,
              streak: !item.completed ? item.streak + 1 : Math.max(0, item.streak - 1)
            } 
          : item
      )
    )
  }

  const handleEmergencyCall = () => {
    if (confirm('Você será direcionado para ligar para o Centro de Valorização da Vida (CVV - 188). Deseja continuar?')) {
      window.location.href = 'tel:188'
    }
  }

  // Funções para Visão de Futuro
  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) return
    
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      completed: false,
      createdAt: Date.now()
    }
    
    setGoals(prev => [...prev, goal])
    
    // Adicionar ao histórico
    addToHistory('meta', `Nova Meta: ${goal.title}`, 
      `Tipo: ${goal.type === 'curto' ? 'Curto Prazo' : 'Longo Prazo'} - Prazo: ${new Date(goal.targetDate).toLocaleDateString('pt-BR')}`, 
      goal)
    
    setNewGoal({
      title: '',
      description: '',
      type: 'curto',
      targetDate: ''
    })
  }

  const toggleGoalComplete = (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (goal) {
      const newCompleted = !goal.completed
      
      // Adicionar ao histórico
      addToHistory('meta', `Meta ${newCompleted ? 'Concluída' : 'Reaberta'}`, 
        `${goal.title} - ${goal.description}`, 
        { goalId: id, completed: newCompleted })
    }
    
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    )
  }

  const deleteGoal = (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (goal) {
      // Adicionar ao histórico
      addToHistory('meta', `Meta Excluída: ${goal.title}`, 
        `${goal.description}`, 
        { goalId: id, deleted: true })
    }
    
    setGoals(prev => prev.filter(goal => goal.id !== id))
  }

  const getEmotionIcon = (emotionValue: string) => {
    const emotion = emotions.find(e => e.value === emotionValue)
    return emotion ? emotion.icon : Smile
  }

  const getEmotionColor = (emotionValue: string) => {
    const emotion = emotions.find(e => e.value === emotionValue)
    return emotion ? emotion.color : 'text-gray-500'
  }

  const getEmotionName = (emotionValue: string) => {
    const emotion = emotions.find(e => e.value === emotionValue)
    return emotion ? emotion.name : 'Neutro'
  }

  // Função para salvar snapshot dos gráficos no histórico
  const saveGraphSnapshot = () => {
    const graphData = {
      dailyHours: { ...dailyHours },
      monthlyProgress: [...monthlyProgress],
      timestamp: Date.now()
    }
    
    addToHistory('grafico', 'Snapshot dos Gráficos', 
      `Distribuição do Dia e Evolução Mensal salvos`, 
      graphData)
  }

  // Função para publicar mensagem do dia
  const handlePublishDailyMessage = () => {
    if (dailyMessage.trim()) {
      setMotivationalMessage(dailyMessage)
      alert('Mensagem do dia publicada com sucesso!')
    }
  }

  // Funções para Gerenciar Conta
  const handleUpdateProfile = () => {
    // Simular atualização do perfil
    alert('Perfil atualizado com sucesso!')
  }

  const handleChangePassword = () => {
    // Simular troca de senha
    alert('Senha alterada com sucesso!')
  }

  const handleVerifyEmail = () => {
    // Simular verificação de email
    alert('Email de verificação enviado!')
  }

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    )
  }

  const handleRemovePayment = (id: string) => {
    setPaymentMethods(prev => prev.filter(method => method.id !== id))
  }

  const handleCancelSubscription = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      setSubscriptions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, status: 'cancelled' as const } : sub
        )
      )
    }
  }

  const handlePaymentQuestion = () => {
    alert('Sua dúvida foi enviada para nossa equipe de suporte. Retornaremos em até 24 horas.')
  }

  // Calcular estatísticas
  const weeklyEntries = getWeeklyEntries(entries)
  const averageMood = calculateAverageMood(entries)
  const moodData = generateMoodData(entries)
  const emotionDistribution = getEmotionDistribution(entries)
  const consistency = weeklyEntries >= 5 ? 90 : (weeklyEntries / 7) * 100

  // Dados para o gráfico de pizza
  const pieData = [
    { name: 'Sono', value: dailyHours.sono, color: '#3B82F6' },
    { name: 'Celular', value: dailyHours.celular, color: '#EF4444' },
    { name: 'Lazer', value: dailyHours.lazer, color: '#10B981' },
    { name: 'Trabalho', value: dailyHours.trabalho, color: '#F59E0B' },
    { name: 'Outros', value: dailyHours.outros, color: '#8B5CF6' }
  ]

  // Filtrar histórico
  const filteredHistory = historyFilter === 'todos' 
    ? historyEntries 
    : historyEntries.filter(entry => entry.type === historyFilter)

  // Filtrar profissionais próximos
  const filteredProfessionals = professionalFilter === 'todos' 
    ? nearbyProfessionals 
    : nearbyProfessionals.filter(prof => prof.type === professionalFilter)

  const menuItems = [
    {
      id: 'site',
      label: 'Acesso ao Site',
      icon: ExternalLink,
      action: () => window.open('https://www.saudementalplena.com', '_blank')
    },
    {
      id: 'cronograma',
      label: 'Cronograma',
      icon: Calendar,
      action: () => setActiveSection('cronograma')
    },
    {
      id: 'alertas',
      label: 'Alertas',
      icon: Bell,
      action: () => setActiveSection('alertas')
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: Archive,
      action: () => setActiveSection('historico')
    },
    {
      id: 'perto-de-mim',
      label: 'Perto de Mim',
      icon: MapPin,
      action: () => setActiveSection('perto-de-mim')
    },
    {
      id: 'rotina',
      label: 'Rotina',
      icon: Activity,
      action: () => setActiveSection('rotina')
    },
    {
      id: 'urgencia',
      label: 'Urgência',
      icon: AlertTriangle,
      action: handleEmergencyCall
    },
    {
      id: 'diario',
      label: 'Diário',
      icon: MessageCircle,
      action: () => setActiveSection('diario')
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Menu Lateral */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black/30 backdrop-blur-sm border-r border-white/10 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Menu</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                  activeSection === item.id 
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.id === 'urgencia' && (
                  <AlertTriangle className="w-4 h-4 text-red-500 ml-auto" />
                )}
                {item.id === 'alertas' && activeAlerts.length > 0 && (
                  <Badge variant="destructive" className="ml-auto text-xs">
                    {activeAlerts.length}
                  </Badge>
                )}
                {item.id === 'historico' && historyEntries.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {historyEntries.length}
                  </Badge>
                )}
                {item.id === 'perto-de-mim' && nearbyProfessionals.length > 0 && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {nearbyProfessionals.length}
                  </Badge>
                )}
              </button>
            )
          })}
        </nav>
        
        {/* Mensagem do Dia no Menu */}
        <div className="p-4 mt-auto">
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                <div className="w-full">
                  <h4 className="text-xs font-semibold text-yellow-300 mb-1">Mensagem Diária</h4>
                  <Textarea
                    placeholder="Digite sua mensagem do dia..."
                    value={dailyMessage}
                    onChange={(e) => setDailyMessage(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-xs min-h-[60px] resize-none mb-2"
                  />
                  <Button
                    onClick={handlePublishDailyMessage}
                    disabled={!dailyMessage.trim()}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold text-xs py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Publicar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo Principal */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-30">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-white hover:bg-white/10"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div className="flex items-center space-x-3">
                  <img 
                    src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/b709a33c-4fc8-47c9-987d-cf5f3458fe87.png" 
                    alt="Saúde Mental Plena" 
                    className="w-10 h-10 rounded-full object-cover shadow-lg" 
                  />
                  <div>
                    <h1 className="text-xl font-bold text-white">Saúde Mental Plena</h1>
                    <p className="text-sm text-gray-300">Cuidando do seu bem-estar emocional</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Heart className="w-3 h-3 mr-1" />
                  Versão 2.0
                </Badge>
                
                {/* Botão Gerenciar Conta */}
                <Button
                  onClick={() => setShowAccountModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Conta
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Modal Gerenciar Conta */}
        {showAccountModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Gerenciar Conta</h2>
                      <p className="text-gray-300 text-sm">Gerencie suas informações pessoais, segurança e pagamentos</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAccountModal(false)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <Tabs value={accountTab} onValueChange={(value) => setAccountTab(value as 'profile' | 'security' | 'payments')}>
                  <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
                      <User className="w-4 h-4 mr-2" />
                      Informações Pessoais
                    </TabsTrigger>
                    <TabsTrigger value="security" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-300">
                      <Lock className="w-4 h-4 mr-2" />
                      Segurança
                    </TabsTrigger>
                    <TabsTrigger value="payments" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagamentos
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="profile" className="space-y-6 mt-6">
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <User className="w-5 h-5 mr-2 text-blue-500" />
                          Informações Pessoais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Nome Completo</label>
                            <Input
                              value={userProfile.name}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Email</label>
                            <Input
                              type="email"
                              value={userProfile.email}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Telefone</label>
                            <Input
                              value={userProfile.phone}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Data de Nascimento</label>
                            <Input
                              type="date"
                              value={userProfile.birthDate}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, birthDate: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Gênero</label>
                            <select
                              value={userProfile.gender}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, gender: e.target.value }))}
                              className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                            >
                              <option value="masculino">Masculino</option>
                              <option value="feminino">Feminino</option>
                              <option value="outro">Outro</option>
                              <option value="prefiro-nao-informar">Prefiro não informar</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Contato de Emergência</label>
                            <Input
                              value={userProfile.emergencyContact}
                              onChange={(e) => setUserProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleUpdateProfile}
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        >
                          Salvar Alterações
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Troca de Senha */}
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Lock className="w-5 h-5 mr-2 text-green-500" />
                            Alterar Senha
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Senha Atual</label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Digite sua senha atual"
                                className="bg-white/10 border-white/20 text-white pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Nova Senha</label>
                            <div className="relative">
                              <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="Digite sua nova senha"
                                className="bg-white/10 border-white/20 text-white pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 block">Confirmar Nova Senha</label>
                            <Input
                              type="password"
                              placeholder="Confirme sua nova senha"
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <Button
                            onClick={handleChangePassword}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            Alterar Senha
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Verificação de Email */}
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-blue-500" />
                            Verificação de Email
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-3 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                            <div>
                              <p className="text-green-300 font-medium">Email Verificado</p>
                              <p className="text-green-200 text-sm">{userProfile.email}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-gray-300 text-sm">
                              Seu email está verificado e ativo. Caso precise alterar ou reverificar, clique no botão abaixo.
                            </p>
                            <Button
                              onClick={handleVerifyEmail}
                              variant="outline"
                              className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                            >
                              Reenviar Verificação
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="payments" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Assinaturas Ativas */}
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Crown className="w-5 h-5 mr-2 text-purple-500" />
                            Assinaturas Ativas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {subscriptions.map((subscription) => (
                            <div key={subscription.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{subscription.plan}</h4>
                                <Badge variant={subscription.status === 'active' ? 'default' : 'destructive'}>
                                  {subscription.status === 'active' ? 'Ativa' : 'Cancelada'}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-gray-300">
                                <p>💰 R$ {subscription.amount.toFixed(2)}/mês</p>
                                <p>📅 Próxima cobrança: {new Date(subscription.nextBilling).toLocaleDateString('pt-BR')}</p>
                              </div>
                              {subscription.status === 'active' && (
                                <Button
                                  onClick={() => handleCancelSubscription(subscription.id)}
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/20"
                                >
                                  Cancelar Assinatura
                                </Button>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {/* Formas de Pagamento */}
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-green-500" />
                            Formas de Pagamento
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {paymentMethods.map((method) => (
                            <div key={method.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                    <CreditCard className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      {method.brand} •••• {method.lastFour}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {method.type === 'credit' ? 'Cartão de Crédito' : 
                                       method.type === 'debit' ? 'Cartão de Débito' : 'PIX'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {method.isDefault && (
                                    <Badge variant="secondary" className="text-xs">Padrão</Badge>
                                  )}
                                  <Button
                                    onClick={() => handleSetDefaultPayment(method.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-400 hover:bg-blue-500/20"
                                  >
                                    Definir Padrão
                                  </Button>
                                  <Button
                                    onClick={() => handleRemovePayment(method.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-400 hover:bg-red-500/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Forma de Pagamento
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Histórico de Faturas */}
                      <Card className="bg-white/5 border-white/10 lg:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center justify-between">
                            <div className="flex items-center">
                              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
                              Histórico de Faturas
                            </div>
                            <Button
                              onClick={handlePaymentQuestion}
                              variant="outline"
                              size="sm"
                              className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                            >
                              Questionar Pagamento
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {invoices.map((invoice) => (
                              <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-3 h-3 rounded-full ${
                                    invoice.status === 'paid' ? 'bg-green-500' :
                                    invoice.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`} />
                                  <div>
                                    <p className="font-medium text-white">{invoice.description}</p>
                                    <p className="text-sm text-gray-300">
                                      {new Date(invoice.date).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-white">R$ {invoice.amount.toFixed(2)}</p>
                                  <Badge variant={
                                    invoice.status === 'paid' ? 'default' :
                                    invoice.status === 'pending' ? 'secondary' : 'destructive'
                                  }>
                                    {invoice.status === 'paid' ? 'Pago' :
                                     invoice.status === 'pending' ? 'Pendente' : 'Vencido'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Alertas Ativos */}
        {activeAlerts.length > 0 && (
          <div className="p-4">
            <div className="space-y-2">
              {activeAlerts.map((alert) => (
                <Card key={alert.id} className="bg-red-500/20 border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Bell className="w-5 h-5 text-red-400 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-300">{alert.title}</h4>
                        <p className="text-red-200 text-sm">{alert.message}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Conteúdo baseado na seção ativa */}
        <div className="p-4">
          {activeSection === 'perto-de-mim' && (
            <div className="space-y-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-green-500" />
                    Perto de Mim - Profissionais Presenciais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status da Localização */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          locationPermission === 'granted' ? 'bg-green-500' : 
                          locationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-white font-medium">
                          {locationPermission === 'granted' ? 'Localização Ativa' : 
                           locationPermission === 'denied' ? 'Localização Negada' : 'Localização Necessária'}
                        </span>
                      </div>
                      {locationPermission !== 'granted' && (
                        <Button
                          onClick={requestLocation}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Ativar GPS
                        </Button>
                      )}
                    </div>
                    
                    {locationPermission === 'granted' && userLocation && (
                      <div className="text-sm text-gray-300">
                        📍 Localização: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </div>
                    )}
                    
                    {locationPermission === 'denied' && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mt-3">
                        <p className="text-red-200 text-sm">
                          Para encontrar profissionais próximos, é necessário permitir o acesso à sua localização. 
                          Verifique as configurações do seu navegador.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Filtros e Configurações */}
                  {locationPermission === 'granted' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Tipo de Profissional:
                        </label>
                        <select
                          value={professionalFilter}
                          onChange={(e) => setProfessionalFilter(e.target.value as 'todos' | 'psicologo' | 'personal')}
                          className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                        >
                          <option value="todos">Todos</option>
                          <option value="psicologo">Psicólogos</option>
                          <option value="personal">Personal Trainers</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 block">
                          Raio de Busca: {searchRadius}km
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={searchRadius}
                          onChange={(e) => {
                            setSearchRadius(Number(e.target.value))
                            if (userLocation) {
                              searchNearbyProfessionals(userLocation.lat, userLocation.lng)
                            }
                          }}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          onClick={() => userLocation && searchNearbyProfessionals(userLocation.lat, userLocation.lng)}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          🔄 Atualizar Busca
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Profissionais */}
                  {locationPermission === 'granted' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold">
                          Profissionais Encontrados ({filteredProfessionals.length})
                        </h3>
                        <div className="text-sm text-gray-400">
                          Raio: {searchRadius}km
                        </div>
                      </div>
                      
                      {filteredProfessionals.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">
                            {nearbyProfessionals.length === 0 
                              ? 'Nenhum profissional encontrado na região'
                              : 'Nenhum profissional encontrado com os filtros aplicados'}
                          </p>
                          <p className="text-gray-500 text-sm mt-2">
                            Tente aumentar o raio de busca ou alterar os filtros
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredProfessionals.map((professional) => (
                            <Card
                              key={professional.id}
                              className={`bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200 ${
                                !professional.available ? 'opacity-60' : ''
                              }`}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                  <img
                                    src={professional.image}
                                    alt={professional.name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                                  />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="font-semibold text-white">{professional.name}</h4>
                                      <div className={`w-3 h-3 rounded-full ${
                                        professional.available ? 'bg-green-500' : 'bg-red-500'
                                      }`} />
                                    </div>
                                    
                                    <div className="space-y-1 mb-3">
                                      <div className="flex items-center space-x-2">
                                        <Badge variant={professional.type === 'psicologo' ? 'default' : 'secondary'}>
                                          {professional.type === 'psicologo' ? '🧠 Psicólogo' : '💪 Personal'}
                                        </Badge>
                                        <span className="text-xs text-gray-400">
                                          📍 {professional.distance}km
                                        </span>
                                      </div>
                                      
                                      <p className="text-sm text-gray-300">{professional.specialty}</p>
                                      
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-1">
                                          <span className="text-yellow-500">⭐</span>
                                          <span className="text-sm text-gray-300">{professional.rating}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-green-400">
                                          R$ {professional.price}/sessão
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex space-x-2">
                                      <Button
                                        size="sm"
                                        disabled={!professional.available}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                                      >
                                        📞 Contatar
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-white/20 text-gray-300 hover:bg-white/10"
                                      >
                                        📍 Ver no Mapa
                                      </Button>
                                    </div>
                                    
                                    {!professional.available && (
                                      <p className="text-xs text-red-400 mt-2">
                                        Indisponível no momento
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informações sobre o serviço */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-xl p-4">
                    <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Como Funciona o "Perto de Mim"
                    </h3>
                    <div className="space-y-2 text-blue-200 text-sm">
                      <p>• 📍 Utilizamos sua localização GPS para encontrar profissionais próximos</p>
                      <p>• 🔍 Busca personalizada por psicólogos e personal trainers</p>
                      <p>• 📊 Avaliações reais e informações de contato verificadas</p>
                      <p>• 🚀 Conexão direta com profissionais disponíveis na sua região</p>
                      <p>• 🔒 Sua localização é usada apenas para a busca e não é armazenada</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'historico' && (
            <div className="space-y-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center">
                      <Archive className="w-5 h-5 mr-2 text-purple-500" />
                      Histórico Completo
                    </div>
                    <Button
                      onClick={saveGraphSnapshot}
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-sm"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Salvar Gráficos
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Filtros */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={historyFilter === 'todos' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('todos')}
                      className={historyFilter === 'todos' ? 'bg-purple-500 hover:bg-purple-600' : 'border-white/20 text-gray-300'}
                    >
                      Todos ({historyEntries.length})
                    </Button>
                    <Button
                      variant={historyFilter === 'conversa' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('conversa')}
                      className={historyFilter === 'conversa' ? 'bg-blue-500 hover:bg-blue-600' : 'border-white/20 text-gray-300'}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Conversas ({historyEntries.filter(h => h.type === 'conversa').length})
                    </Button>
                    <Button
                      variant={historyFilter === 'meta' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('meta')}
                      className={historyFilter === 'meta' ? 'bg-green-500 hover:bg-green-600' : 'border-white/20 text-gray-300'}
                    >
                      <Target className="w-3 h-3 mr-1" />
                      Metas ({historyEntries.filter(h => h.type === 'meta').length})
                    </Button>
                    <Button
                      variant={historyFilter === 'rotina' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('rotina')}
                      className={historyFilter === 'rotina' ? 'bg-orange-500 hover:bg-orange-600' : 'border-white/20 text-gray-300'}
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      Rotinas ({historyEntries.filter(h => h.type === 'rotina').length})
                    </Button>
                    <Button
                      variant={historyFilter === 'grafico' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setHistoryFilter('grafico')}
                      className={historyFilter === 'grafico' ? 'bg-yellow-500 hover:bg-yellow-600' : 'border-white/20 text-gray-300'}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Gráficos ({historyEntries.filter(h => h.type === 'grafico').length})
                    </Button>
                  </div>

                  {/* Estatísticas do Histórico */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30 text-center">
                      <div className="text-blue-400 font-bold text-lg">
                        {historyEntries.filter(h => h.type === 'conversa').length}
                      </div>
                      <div className="text-blue-300 text-xs">Conversas</div>
                    </div>
                    <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30 text-center">
                      <div className="text-green-400 font-bold text-lg">
                        {historyEntries.filter(h => h.type === 'meta').length}
                      </div>
                      <div className="text-green-300 text-xs">Metas</div>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg p-3 border border-orange-500/30 text-center">
                      <div className="text-orange-400 font-bold text-lg">
                        {historyEntries.filter(h => h.type === 'rotina').length}
                      </div>
                      <div className="text-orange-300 text-xs">Rotinas</div>
                    </div>
                    <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/30 text-center">
                      <div className="text-yellow-400 font-bold text-lg">
                        {historyEntries.filter(h => h.type === 'grafico').length}
                      </div>
                      <div className="text-yellow-300 text-xs">Gráficos</div>
                    </div>
                  </div>

                  {/* Lista do Histórico */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Archive className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">
                          {historyFilter === 'todos' 
                            ? 'Nenhum registro no histórico ainda' 
                            : `Nenhum registro de ${historyFilter} encontrado`}
                        </p>
                      </div>
                    ) : (
                      filteredHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              entry.type === 'conversa' ? 'bg-blue-500/20 border border-blue-500/30' :
                              entry.type === 'meta' ? 'bg-green-500/20 border border-green-500/30' :
                              entry.type === 'rotina' ? 'bg-orange-500/20 border border-orange-500/30' :
                              'bg-yellow-500/20 border border-yellow-500/30'
                            }`}>
                              {entry.type === 'conversa' && <MessageCircle className="w-4 h-4 text-blue-400" />}
                              {entry.type === 'meta' && <Target className="w-4 h-4 text-green-400" />}
                              {entry.type === 'rotina' && <Activity className="w-4 h-4 text-orange-400" />}
                              {entry.type === 'grafico' && <TrendingUp className="w-4 h-4 text-yellow-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white text-sm">{entry.title}</h4>
                                <div className="text-xs text-gray-400">
                                  {new Date(entry.timestamp).toLocaleString('pt-BR')}
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{entry.description}</p>
                              <Badge variant="outline" className={`text-xs ${
                                entry.type === 'conversa' ? 'border-blue-500/30 text-blue-300' :
                                entry.type === 'meta' ? 'border-green-500/30 text-green-300' :
                                entry.type === 'rotina' ? 'border-orange-500/30 text-orange-300' :
                                'border-yellow-500/30 text-yellow-300'
                              }`}>
                                {entry.type === 'conversa' ? 'Conversa' :
                                 entry.type === 'meta' ? 'Meta' :
                                 entry.type === 'rotina' ? 'Rotina' : 'Gráfico'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'diario' && (
            <div className="space-y-6">
              {/* Mensagem Positiva */}
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 backdrop-blur-sm shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Mensagem do Dia</h3>
                      <p className="text-yellow-100 leading-relaxed">
                        {motivationalMessage}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráficos */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Pizza - Distribuição do Dia */}
                <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-blue-500" />
                      Distribuição do Seu Dia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}h`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0,0,0,0.8)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                            formatter={(value) => [`${value} horas`, 'Tempo']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Controles para editar horas */}
                    <div className="mt-4 space-y-3">
                      <h4 className="text-white font-semibold text-sm">Ajustar Horas do Dia:</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(dailyHours).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            <label className="text-gray-300 text-xs capitalize min-w-[60px]">
                              {key === 'sono' ? 'Sono' : 
                               key === 'celular' ? 'Celular' :
                               key === 'lazer' ? 'Lazer' :
                               key === 'trabalho' ? 'Trabalho' : 'Outros'}:
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max="24"
                              value={value}
                              onChange={(e) => setDailyHours(prev => ({
                                ...prev,
                                [key]: Math.min(24, Math.max(0, Number(e.target.value)))
                              }))}
                              className="bg-white/10 border-white/20 text-white text-xs h-8 w-16"
                            />
                            <span className="text-gray-400 text-xs">h</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400">
                        Total: {Object.values(dailyHours).reduce((a, b) => a + b, 0)}/24 horas
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gráfico de Linhas - Evolução Mensal */}
                <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      Gráfico Melhora - Evolução Mensal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyProgress}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis 
                            dataKey="month" 
                            stroke="rgba(255,255,255,0.6)"
                            fontSize={12}
                          />
                          <YAxis 
                            stroke="rgba(255,255,255,0.6)"
                            fontSize={12}
                            domain={[0, 10]}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0,0,0,0.8)', 
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '8px',
                              color: 'white'
                            }}
                            formatter={(value) => [`${value}/10`, 'Score de Bem-estar']}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="score" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                            activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Estatísticas da evolução */}
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                      <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                        <div className="text-green-400 font-bold text-lg">
                          {monthlyProgress[monthlyProgress.length - 1]?.score || 0}/10
                        </div>
                        <div className="text-green-300 text-xs">Score Atual</div>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
                        <div className="text-blue-400 font-bold text-lg">
                          +{((monthlyProgress[monthlyProgress.length - 1]?.score || 0) - (monthlyProgress[0]?.score || 0)).toFixed(1)}
                        </div>
                        <div className="text-blue-300 text-xs">Melhora Total</div>
                      </div>
                      <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                        <div className="text-purple-400 font-bold text-lg">
                          {monthlyProgress.length}
                        </div>
                        <div className="text-purple-300 text-xs">Meses Acompanhados</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visão de Futuro */}
              <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-500" />
                    Visão de Futuro - Suas Metas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Formulário para nova meta */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-white font-semibold mb-4">Definir Nova Meta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Título da meta"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                      <select
                        value={newGoal.type}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as 'curto' | 'longo' }))}
                        className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                      >
                        <option value="curto">Curto Prazo (3-6 meses)</option>
                        <option value="longo">Longo Prazo (+1 ano)</option>
                      </select>
                      <Input
                        type="date"
                        value={newGoal.targetDate}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <Textarea
                        placeholder="Descrição da meta"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 md:col-span-2"
                      />
                    </div>
                    <Button
                      onClick={handleAddGoal}
                      className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Meta
                    </Button>
                  </div>

                  {/* Lista de metas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Metas de Curto Prazo */}
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-blue-500" />
                        Curto Prazo (3-6 meses)
                      </h3>
                      <div className="space-y-3">
                        {goals.filter(goal => goal.type === 'curto').length === 0 ? (
                          <div className="text-center py-4 text-gray-400 text-sm">
                            Nenhuma meta de curto prazo definida
                          </div>
                        ) : (
                          goals.filter(goal => goal.type === 'curto').map((goal) => (
                            <div
                              key={goal.id}
                              className={`p-3 rounded-lg border transition-all duration-200 ${
                                goal.completed
                                  ? 'bg-green-500/20 border-green-500/30'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <button
                                      onClick={() => toggleGoalComplete(goal.id)}
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        goal.completed
                                          ? 'bg-green-500 border-green-500'
                                          : 'border-white/30 hover:border-white/50'
                                      }`}
                                    >
                                      {goal.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                    </button>
                                    <h4 className={`font-semibold text-sm ${goal.completed ? 'text-green-300' : 'text-white'}`}>
                                      {goal.title}
                                    </h4>
                                  </div>
                                  <p className="text-gray-300 text-xs mb-2">{goal.description}</p>
                                  <div className="text-xs text-gray-400">
                                    📅 Prazo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteGoal(goal.id)}
                                  className="text-red-400 hover:bg-red-500/20 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Metas de Longo Prazo */}
                    <div>
                      <h3 className="text-white font-semibold mb-3 flex items-center">
                        <Target className="w-4 h-4 mr-2 text-purple-500" />
                        Longo Prazo (+1 ano)
                      </h3>
                      <div className="space-y-3">
                        {goals.filter(goal => goal.type === 'longo').length === 0 ? (
                          <div className="text-center py-4 text-gray-400 text-sm">
                            Nenhuma meta de longo prazo definida
                          </div>
                        ) : (
                          goals.filter(goal => goal.type === 'longo').map((goal) => (
                            <div
                              key={goal.id}
                              className={`p-3 rounded-lg border transition-all duration-200 ${
                                goal.completed
                                  ? 'bg-green-500/20 border-green-500/30'
                                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <button
                                      onClick={() => toggleGoalComplete(goal.id)}
                                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                        goal.completed
                                          ? 'bg-green-500 border-green-500'
                                          : 'border-white/30 hover:border-white/50'
                                      }`}
                                    >
                                      {goal.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                    </button>
                                    <h4 className={`font-semibold text-sm ${goal.completed ? 'text-green-300' : 'text-white'}`}>
                                      {goal.title}
                                    </h4>
                                  </div>
                                  <p className="text-gray-300 text-xs mb-2">{goal.description}</p>
                                  <div className="text-xs text-gray-400">
                                    📅 Prazo: {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteGoal(goal.id)}
                                  className="text-red-400 hover:bg-red-500/20 p-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estatísticas Rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-500">{entries.length}</div>
                    <div className="text-sm text-gray-300">Registros Totais</div>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">{averageMood.toFixed(1)}/10</div>
                    <div className="text-sm text-gray-300">Humor Médio</div>
                  </CardContent>
                </Card>
                <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-500">{weeklyEntries}/7</div>
                    <div className="text-sm text-gray-300">Esta Semana</div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulário de Registro */}
              <Card className="bg-black/20 backdrop-blur-sm border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-yellow-500" />
                    Como você está se sentindo hoje?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Seleção de Emoção */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">
                      Escolha sua emoção atual:
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {emotions.map((emotion) => {
                        const IconComponent = emotion.icon
                        return (
                          <button
                            key={emotion.value}
                            onClick={() => setSelectedEmotion(emotion.value)}
                            className={`p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                              selectedEmotion === emotion.value
                                ? 'border-yellow-500 bg-yellow-500/20 shadow-lg'
                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                            }`}
                          >
                            <IconComponent className={`w-8 h-8 mx-auto mb-2 ${emotion.color}`} />
                            <p className="text-xs text-gray-300 text-center font-medium">{emotion.name}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Intensidade da Emoção */}
                  {selectedEmotion && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                      <label className="text-sm font-medium text-gray-300 mb-3 block">
                        Intensidade da emoção: <span className="text-yellow-500 font-bold">{emotionIntensity}/10</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={emotionIntensity}
                        onChange={(e) => setEmotionIntensity(Number(e.target.value))}
                        className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>Muito Baixa</span>
                        <span>Moderada</span>
                        <span>Muito Alta</span>
                      </div>
                    </div>
                  )}

                  {/* Campo de Mensagem */}
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-3 block">
                      Compartilhe seus pensamentos e sentimentos:
                    </label>
                    <Textarea
                      placeholder="Como foi seu dia? O que você está sentindo? Escreva aqui seus pensamentos, preocupações ou conquistas..."
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-400 min-h-[120px] resize-none focus:ring-2 focus:ring-yellow-500/50"
                    />
                    <div className="text-xs text-gray-400 mt-2">
                      {currentMessage.length}/500 caracteres
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitEntry}
                    disabled={!currentMessage.trim() || !selectedEmotion}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold py-3 text-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Registrar no Diário Emocional
                  </Button>
                </CardContent>
              </Card>

              {/* Novas Opções de Serviços */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Iniciar Conversa - ChatBot */}
                <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Iniciar Conversa</h3>
                    <p className="text-blue-100 text-sm mb-4 leading-relaxed">
                      Converse com nossa IA especializada que te ajudará a encontrar o profissional ideal - psicólogo ou personal trainer.
                    </p>
                    <Button
                      onClick={initializeChatbot}
                      className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Começar Chat
                    </Button>
                  </CardContent>
                </Card>

                {/* AtlasFit Premium */}
                <Card className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">AtlasFit Premium</h3>
                    <p className="text-orange-100 text-sm mb-4 leading-relaxed">
                      Acesso premium com as melhores dietas personalizadas, treinos profissionais e exercícios avançados.
                    </p>
                    <Button
                      onClick={() => window.open('https://pay.kirvano.com/a08d4d24-a69b-42cc-9a6d-2dadfa2a52a7', '_blank')}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Assinar Premium
                    </Button>
                  </CardContent>
                </Card>

                {/* Pleni Terapêutico */}
                <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Leaf className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Pleni Terapêutico</h3>
                    <p className="text-green-100 text-sm mb-4 leading-relaxed">
                      Exercícios terapêuticos especializados, controle emocional e técnicas avançadas de respiração.
                    </p>
                    <Button
                      onClick={() => window.open('https://pay.kirvano.com/12695837-2e21-4924-a2b7-abe68abcf4ee', '_blank')}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg"
                    >
                      <Leaf className="w-4 h-4 mr-2" />
                      Acessar Pleni
                    </Button>
                  </CardContent>
                </Card>

                {/* Saúde Mental Plena Premium */}
                <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Saúde Mental Plena Premium</h3>
                    <p className="text-purple-100 text-sm mb-4 leading-relaxed">
                      Acesso premium a dietas personalizadas, exercícios, controle de raiva e técnicas avançadas de yoga terapêutico.
                    </p>
                    <Button
                      onClick={() => window.open('https://pay.kirvano.com/76d24e17-4849-4968-ab93-22130b8e33e9', '_blank')}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold shadow-lg"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Assinar Premium
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'chatbot' && (
            <div className="space-y-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-blue-500" />
                    Assistente de Bem-estar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isBot
                              ? 'bg-blue-500/20 text-blue-100 border border-blue-500/30'
                              : 'bg-yellow-500/20 text-yellow-100 border border-yellow-500/30'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {chatStep > 0 && (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Digite sua resposta..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && chatInput.trim()) {
                            handleChatResponse(chatInput)
                            setChatInput('')
                          }
                        }}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                      <Button
                        onClick={() => {
                          if (chatInput.trim()) {
                            handleChatResponse(chatInput)
                            setChatInput('')
                          }
                        }}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Enviar
                      </Button>
                    </div>
                  )}
                  
                  {chatStep === 1 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      <Button
                        onClick={() => handleChatResponse('Psicólogo')}
                        variant="outline"
                        className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                      >
                        Psicólogo
                      </Button>
                      <Button
                        onClick={() => handleChatResponse('Personal Trainer')}
                        variant="outline"
                        className="border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
                      >
                        Personal Trainer
                      </Button>
                      <Button
                        onClick={() => handleChatResponse('Ambos')}
                        variant="outline"
                        className="border-green-500/30 text-green-300 hover:bg-green-500/20"
                      >
                        Ambos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'cronograma' && (
            <div className="space-y-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-yellow-500" />
                    Cronograma de Atividades
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Formulário para nova atividade */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <h3 className="text-white font-semibold mb-4">Adicionar Nova Atividade</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Título da atividade"
                        value={newScheduleItem.title}
                        onChange={(e) => setNewScheduleItem(prev => ({ ...prev, title: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                      <select
                        value={newScheduleItem.category}
                        onChange={(e) => setNewScheduleItem(prev => ({ ...prev, category: e.target.value as 'corpo' | 'mente' }))}
                        className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                      >
                        <option value="corpo">Corpo</option>
                        <option value="mente">Mente</option>
                      </select>
                      <Input
                        type="date"
                        value={newScheduleItem.date}
                        onChange={(e) => setNewScheduleItem(prev => ({ ...prev, date: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <Input
                        type="time"
                        value={newScheduleItem.time}
                        onChange={(e) => setNewScheduleItem(prev => ({ ...prev, time: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                      <Input
                        type="number"
                        placeholder="Duração (minutos)"
                        value={newScheduleItem.duration}
                        onChange={(e) => setNewScheduleItem(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                      />
                      <Textarea
                        placeholder="Descrição da atividade"
                        value={newScheduleItem.description}
                        onChange={(e) => setNewScheduleItem(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 md:col-span-2"
                      />
                    </div>
                    <Button
                      onClick={handleAddScheduleItem}
                      className="mt-4 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Atividade
                    </Button>
                  </div>

                  {/* Lista de atividades */}
                  <div className="space-y-3">
                    {scheduleItems.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhuma atividade programada</p>
                      </div>
                    ) : (
                      scheduleItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all duration-200 ${
                            item.completed
                              ? 'bg-green-500/20 border-green-500/30'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <button
                                  onClick={() => toggleScheduleComplete(item.id)}
                                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    item.completed
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-white/30 hover:border-white/50'
                                  }`}
                                >
                                  {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                </button>
                                <h4 className={`font-semibold ${item.completed ? 'text-green-300' : 'text-white'}`}>
                                  {item.title}
                                </h4>
                                <Badge variant={item.category === 'corpo' ? 'default' : 'secondary'}>
                                  {item.category === 'corpo' ? 'Corpo' : 'Mente'}
                                </Badge>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span>📅 {new Date(item.date).toLocaleDateString('pt-BR')}</span>
                                <span>🕐 {item.time}</span>
                                <span>⏱️ {item.duration} min</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteScheduleItem(item.id)}
                              className="text-red-400 hover:bg-red-500/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'alertas' && (
            <div className="space-y-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                    Sistema de Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                      <h3 className="text-blue-300 font-semibold mb-2">Como funciona</h3>
                      <p className="text-blue-200 text-sm">
                        O sistema monitora automaticamente as atividades do seu cronograma e suas metas. 
                        Quando você exceder o tempo programado para uma atividade ou quando uma meta estiver próxima do prazo, um alerta será exibido.
                      </p>
                    </div>
                    
                    {activeAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhum alerta ativo no momento</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Os alertas aparecerão quando você exceder o tempo das atividades programadas ou quando suas metas estiverem próximas do prazo
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <h3 className="text-white font-semibold">Alertas Ativos ({activeAlerts.length})</h3>
                        {activeAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl"
                          >
                            <div className="flex items-start space-x-3">
                              <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-red-300">{alert.title}</h4>
                                <p className="text-red-200 text-sm">{alert.message}</p>
                                <p className="text-red-300 text-xs mt-2">
                                  Disparado em: {new Date(alert.triggerTime).toLocaleString('pt-BR')}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setActiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                                className="text-red-400 hover:bg-red-500/20"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === 'rotina' && (
            <div className="space-y-6">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-yellow-500" />
                    Rotina de Bem-estar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {routineItems.map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          item.completed
                            ? 'bg-green-500/20 border-green-500/30'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <button
                            onClick={() => toggleRoutineComplete(item.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                              item.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-white/30 hover:border-white/50'
                            }`}
                          >
                            {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className={`font-semibold ${item.completed ? 'text-green-300' : 'text-white'}`}>
                                {item.title}
                              </h4>
                              <Badge 
                                variant={
                                  item.category === 'treino' ? 'default' : 
                                  item.category === 'alimentacao' ? 'secondary' : 
                                  'outline'
                                }
                              >
                                {item.category === 'treino' ? '💪 Treino' : 
                                 item.category === 'alimentacao' ? '🥗 Alimentação' : 
                                 '💡 Conselho'}
                              </Badge>
                              {item.streak > 0 && (
                                <Badge variant="outline" className="border-yellow-500/30 text-yellow-300">
                                  🔥 {item.streak} dias
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-300 text-sm">{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #EAB308, #F59E0B);
          cursor: pointer;
          border: 3px solid #FFF;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #EAB308, #F59E0B);
          cursor: pointer;
          border: 3px solid #FFF;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .slider::-webkit-slider-track {
          background: linear-gradient(to right, #EF4444, #F59E0B, #EAB308, #22C55E);
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}