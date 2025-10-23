import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart, PieChart } from 'react-native-chart-kit';

// Interfaces
interface EmotionalEntry {
  id: string;
  date: string;
  emotion: string;
  intensity: number;
  message: string;
  timestamp: number;
}

interface EmotionType {
  name: string;
  icon: string;
  color: string;
  value: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  category: 'corpo' | 'mente';
  completed: boolean;
}

interface RoutineItem {
  id: string;
  title: string;
  description: string;
  category: 'treino' | 'alimentacao' | 'conselho';
  completed: boolean;
  streak: number;
}

interface ChatMessage {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: number;
}

interface DailyHours {
  sono: number;
  celular: number;
  lazer: number;
  trabalho: number;
  outros: number;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'curto' | 'longo';
  targetDate: string;
  completed: boolean;
  createdAt: number;
}

const { width: screenWidth } = Dimensions.get('window');

const emotions: EmotionType[] = [
  { name: 'Muito Feliz', icon: '😄', color: '#EAB308', value: 'muito-feliz' },
  { name: 'Feliz', icon: '😊', color: '#22C55E', value: 'feliz' },
  { name: 'Neutro', icon: '😐', color: '#6B7280', value: 'neutro' },
  { name: 'Triste', icon: '😢', color: '#3B82F6', value: 'triste' },
  { name: 'Irritado', icon: '😠', color: '#EF4444', value: 'irritado' },
  { name: 'Energético', icon: '⚡', color: '#8B5CF6', value: 'energetico' },
];

const motivationalMessages = [
  "Cada dia é uma nova oportunidade para crescer e se desenvolver.",
  "Você é mais forte do que imagina e capaz de superar qualquer desafio.",
  "Pequenos passos todos os dias levam a grandes transformações.",
  "Sua jornada de bem-estar é única e valiosa.",
  "Lembre-se: cuidar de si mesmo não é egoísmo, é necessidade.",
];

export default function SaudeMentalPlena() {
  // Estados principais
  const [entries, setEntries] = useState<EmotionalEntry[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const [emotionIntensity, setEmotionIntensity] = useState(5);
  const [activeSection, setActiveSection] = useState('diario');
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados para cronograma
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [newScheduleItem, setNewScheduleItem] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 60,
    category: 'corpo' as 'corpo' | 'mente'
  });
  
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
  ]);
  
  // Estados para chatbot
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStep, setChatStep] = useState(0);
  
  // Mensagem do dia
  const [dailyMessage, setDailyMessage] = useState('');

  // Estados para os gráficos
  const [dailyHours, setDailyHours] = useState<DailyHours>({
    sono: 8,
    celular: 4,
    lazer: 3,
    trabalho: 8,
    outros: 1
  });

  // Estados para Visão de Futuro
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'curto' as 'curto' | 'longo',
    targetDate: ''
  });

  // Funções de utilidade
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  const getMotivationalMessage = () => {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
  };

  const saveToStorage = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const loadFromStorage = async (key: string) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return null;
    }
  };

  // Carregar dados do AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      const savedEntries = await loadFromStorage('saudeMentalEntries');
      const savedSchedule = await loadFromStorage('scheduleItems');
      const savedRoutine = await loadFromStorage('routineItems');
      const savedDailyMessage = await loadFromStorage('dailyMessage');
      const savedChatMessages = await loadFromStorage('chatMessages');
      const savedDailyHours = await loadFromStorage('dailyHours');
      const savedGoals = await loadFromStorage('goals');
      
      if (savedEntries) setEntries(savedEntries);
      if (savedSchedule) setScheduleItems(savedSchedule);
      if (savedRoutine) setRoutineItems(savedRoutine);
      if (savedDailyMessage) setDailyMessage(savedDailyMessage);
      if (savedChatMessages) setChatMessages(savedChatMessages);
      if (savedDailyHours) setDailyHours(savedDailyHours);
      if (savedGoals) setGoals(savedGoals);
      
      setMotivationalMessage(getMotivationalMessage());
    };
    
    loadData();
  }, []);

  // Salvar dados no AsyncStorage
  useEffect(() => {
    if (entries.length > 0) saveToStorage('saudeMentalEntries', entries);
  }, [entries]);
  
  useEffect(() => {
    if (scheduleItems.length > 0) saveToStorage('scheduleItems', scheduleItems);
  }, [scheduleItems]);
  
  useEffect(() => {
    if (routineItems.length > 0) saveToStorage('routineItems', routineItems);
  }, [routineItems]);
  
  useEffect(() => {
    if (dailyMessage) saveToStorage('dailyMessage', dailyMessage);
  }, [dailyMessage]);
  
  useEffect(() => {
    if (chatMessages.length > 0) saveToStorage('chatMessages', chatMessages);
  }, [chatMessages]);

  useEffect(() => {
    saveToStorage('dailyHours', dailyHours);
  }, [dailyHours]);

  useEffect(() => {
    saveToStorage('goals', goals);
  }, [goals]);

  // Inicializar chatbot
  const initializeChatbot = () => {
    const initialMessage: ChatMessage = {
      id: Date.now().toString(),
      message: "Olá! Sou seu assistente de bem-estar. Posso te ajudar a encontrar o profissional ideal para você. Você está procurando apoio de um psicólogo ou um personal trainer?",
      isBot: true,
      timestamp: Date.now()
    };
    setChatMessages([initialMessage]);
    setChatStep(1);
    setActiveSection('chatbot');
  };

  const handleChatResponse = (response: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: response,
      isBot: false,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    setTimeout(() => {
      let botResponse = "";
      
      if (chatStep === 1) {
        if (response.toLowerCase().includes('psicólogo') || response.toLowerCase().includes('psicologo')) {
          botResponse = "Ótima escolha! Um psicólogo pode te ajudar com questões emocionais, ansiedade, depressão e desenvolvimento pessoal. Gostaria que eu te conecte com nossos profissionais especializados ou prefere explorar nossos recursos de autoajuda primeiro?";
        } else if (response.toLowerCase().includes('personal') || response.toLowerCase().includes('trainer')) {
          botResponse = "Excelente! Um personal trainer pode te ajudar a criar uma rotina de exercícios personalizada e alcançar seus objetivos físicos. Que tal conhecer nosso AtlasFit Premium com os melhores treinos e dietas?";
        } else {
          botResponse = "Entendo. Posso te ajudar com ambas as áreas! Temos recursos tanto para saúde mental quanto física. Você gostaria de saber mais sobre nossos serviços de psicologia ou fitness?";
        }
        setChatStep(2);
      } else {
        botResponse = "Obrigado pelo seu interesse! Nossa equipe entrará em contato em breve. Enquanto isso, explore nossos recursos disponíveis no aplicativo.";
      }
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: botResponse,
        isBot: true,
        timestamp: Date.now()
      };
      
      setChatMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleSubmitEntry = () => {
    if (!currentMessage.trim() || !selectedEmotion) return;

    const newEntry: EmotionalEntry = {
      id: Date.now().toString(),
      date: formatDate(new Date()),
      emotion: selectedEmotion,
      intensity: emotionIntensity,
      message: currentMessage,
      timestamp: Date.now()
    };

    setEntries(prev => [newEntry, ...prev]);
    setCurrentMessage('');
    setSelectedEmotion('');
    setEmotionIntensity(5);
    
    setMotivationalMessage(getMotivationalMessage());
  };

  const handleAddScheduleItem = () => {
    if (!newScheduleItem.title || !newScheduleItem.date || !newScheduleItem.time) return;
    
    const item: ScheduleItem = {
      id: Date.now().toString(),
      ...newScheduleItem,
      completed: false
    };
    
    setScheduleItems(prev => [...prev, item]);
    setNewScheduleItem({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
      category: 'corpo'
    });
  };

  const toggleScheduleComplete = (id: string) => {
    setScheduleItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const deleteScheduleItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleRoutineComplete = (id: string) => {
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
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergência',
      'Você será direcionado para ligar para o Centro de Valorização da Vida (CVV - 188). Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ligar', onPress: () => Linking.openURL('tel:188') }
      ]
    );
  };

  // Funções para Visão de Futuro
  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetDate) return;
    
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      completed: false,
      createdAt: Date.now()
    };
    
    setGoals(prev => [...prev, goal]);
    
    setNewGoal({
      title: '',
      description: '',
      type: 'curto',
      targetDate: ''
    });
  };

  const toggleGoalComplete = (id: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getEmotionIcon = (emotionValue: string) => {
    const emotion = emotions.find(e => e.value === emotionValue);
    return emotion ? emotion.icon : '😐';
  };

  const getEmotionColor = (emotionValue: string) => {
    const emotion = emotions.find(e => e.value === emotionValue);
    return emotion ? emotion.color : '#6B7280';
  };

  const getEmotionName = (emotionValue: string) => {
    const emotion = emotions.find(e => e.value === emotionValue);
    return emotion ? emotion.name : 'Neutro';
  };

  // Função para publicar mensagem do dia
  const handlePublishDailyMessage = () => {
    if (dailyMessage.trim()) {
      setMotivationalMessage(dailyMessage);
      Alert.alert('Sucesso', 'Mensagem do dia publicada com sucesso!');
    }
  };

  // Calcular estatísticas
  const averageMood = entries.length > 0 
    ? entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length 
    : 0;
  const weeklyEntries = entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  }).length;

  // Dados para gráficos
  const pieData = [
    { name: 'Sono', population: dailyHours.sono, color: '#3B82F6', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Celular', population: dailyHours.celular, color: '#EF4444', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Lazer', population: dailyHours.lazer, color: '#10B981', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Trabalho', population: dailyHours.trabalho, color: '#F59E0B', legendFontColor: '#FFF', legendFontSize: 12 },
    { name: 'Outros', population: dailyHours.outros, color: '#8B5CF6', legendFontColor: '#FFF', legendFontSize: 12 }
  ];

  const lineData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      data: [6.5, 7.2, 6.8, 7.5, 8.1, 7.9],
      strokeWidth: 3,
      color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
    }]
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(0,0,0,0.1)',
    backgroundGradientTo: 'rgba(0,0,0,0.1)',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  const menuItems = [
    { id: 'site', label: 'Acesso ao Site', icon: '🌐', action: () => Linking.openURL('https://www.saudementalplena.com') },
    { id: 'cronograma', label: 'Cronograma', icon: '📅', action: () => setActiveSection('cronograma') },
    { id: 'rotina', label: 'Rotina', icon: '⚡', action: () => setActiveSection('rotina') },
    { id: 'diario', label: 'Diário', icon: '💬', action: () => setActiveSection('diario') },
    { id: 'urgencia', label: 'Urgência', icon: '🚨', action: handleEmergencyCall }
  ];

  const renderSidebar = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={sidebarOpen}
      onRequestClose={() => setSidebarOpen(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🧠</Text>
              <Text style={styles.logoText}>Menu</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSidebarOpen(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.menuContainer}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  item.action();
                  setSidebarOpen(false);
                }}
                style={[
                  styles.menuItem,
                  activeSection === item.id && styles.menuItemActive
                ]}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[
                  styles.menuLabel,
                  activeSection === item.id && styles.menuLabelActive
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Mensagem do Dia no Menu */}
          <View style={styles.dailyMessageContainer}>
            <View style={styles.dailyMessageCard}>
              <View style={styles.dailyMessageHeader}>
                <Text style={styles.sparkleIcon}>✨</Text>
                <Text style={styles.dailyMessageTitle}>Mensagem Diária</Text>
              </View>
              <TextInput
                placeholder="Digite sua mensagem do dia..."
                placeholderTextColor="#9CA3AF"
                value={dailyMessage}
                onChangeText={setDailyMessage}
                style={styles.dailyMessageInput}
                multiline
              />
              <TouchableOpacity
                onPress={handlePublishDailyMessage}
                disabled={!dailyMessage.trim()}
                style={[
                  styles.publishButton,
                  !dailyMessage.trim() && styles.publishButtonDisabled
                ]}
              >
                <Text style={styles.publishButtonText}>📤 Publicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderDiario = () => (
    <ScrollView style={styles.content}>
      {/* Mensagem Positiva */}
      <View style={styles.motivationalCard}>
        <View style={styles.motivationalHeader}>
          <View style={styles.motivationalIcon}>
            <Text style={styles.sparkleText}>✨</Text>
          </View>
          <View style={styles.motivationalContent}>
            <Text style={styles.motivationalTitle}>Mensagem do Dia</Text>
            <Text style={styles.motivationalText}>{motivationalMessage}</Text>
          </View>
        </View>
      </View>

      {/* Gráficos */}
      <View style={styles.chartsContainer}>
        {/* Gráfico de Pizza */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>🕐 Distribuição do Seu Dia</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Gráfico de Linhas */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>📈 Evolução Mensal</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>
      </View>

      {/* Visão de Futuro */}
      <View style={styles.futureVisionCard}>
        <Text style={styles.sectionTitle}>🎯 Visão de Futuro - Suas Metas</Text>
        
        {/* Formulário para nova meta */}
        <View style={styles.newGoalForm}>
          <Text style={styles.formTitle}>Definir Nova Meta</Text>
          <TextInput
            placeholder="Título da meta"
            placeholderTextColor="#9CA3AF"
            value={newGoal.title}
            onChangeText={(text) => setNewGoal(prev => ({ ...prev, title: text }))}
            style={styles.input}
          />
          <TextInput
            placeholder="Descrição da meta"
            placeholderTextColor="#9CA3AF"
            value={newGoal.description}
            onChangeText={(text) => setNewGoal(prev => ({ ...prev, description: text }))}
            style={[styles.input, styles.textArea]}
            multiline
          />
          <TextInput
            placeholder="Data limite (DD/MM/AAAA)"
            placeholderTextColor="#9CA3AF"
            value={newGoal.targetDate}
            onChangeText={(text) => setNewGoal(prev => ({ ...prev, targetDate: text }))}
            style={styles.input}
          />
          <TouchableOpacity
            onPress={handleAddGoal}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>➕ Adicionar Meta</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de metas */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => (
            <View key={goal.id} style={[
              styles.goalItem,
              goal.completed && styles.goalItemCompleted
            ]}>
              <TouchableOpacity
                onPress={() => toggleGoalComplete(goal.id)}
                style={[
                  styles.goalCheckbox,
                  goal.completed && styles.goalCheckboxCompleted
                ]}
              >
                {goal.completed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.goalContent}>
                <Text style={[
                  styles.goalTitle,
                  goal.completed && styles.goalTitleCompleted
                ]}>
                  {goal.title}
                </Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
                <Text style={styles.goalDate}>📅 Prazo: {goal.targetDate}</Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteGoal(goal.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Estatísticas Rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{entries.length}</Text>
          <Text style={styles.statLabel}>Registros Totais</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{averageMood.toFixed(1)}/10</Text>
          <Text style={styles.statLabel}>Humor Médio</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{weeklyEntries}/7</Text>
          <Text style={styles.statLabel}>Esta Semana</Text>
        </View>
      </View>

      {/* Formulário de Registro */}
      <View style={styles.registrationCard}>
        <Text style={styles.sectionTitle}>💬 Como você está se sentindo hoje?</Text>
        
        {/* Seleção de Emoção */}
        <Text style={styles.formLabel}>Escolha sua emoção atual:</Text>
        <View style={styles.emotionsGrid}>
          {emotions.map((emotion) => (
            <TouchableOpacity
              key={emotion.value}
              onPress={() => setSelectedEmotion(emotion.value)}
              style={[
                styles.emotionButton,
                selectedEmotion === emotion.value && styles.emotionButtonSelected
              ]}
            >
              <Text style={styles.emotionIcon}>{emotion.icon}</Text>
              <Text style={styles.emotionName}>{emotion.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Intensidade da Emoção */}
        {selectedEmotion && (
          <View style={styles.intensityContainer}>
            <Text style={styles.intensityLabel}>
              Intensidade da emoção: <Text style={styles.intensityValue}>{emotionIntensity}/10</Text>
            </Text>
            {/* Aqui você pode adicionar um slider nativo ou usar uma biblioteca */}
            <View style={styles.intensityButtons}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setEmotionIntensity(value)}
                  style={[
                    styles.intensityButton,
                    emotionIntensity === value && styles.intensityButtonSelected
                  ]}
                >
                  <Text style={[
                    styles.intensityButtonText,
                    emotionIntensity === value && styles.intensityButtonTextSelected
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Campo de Mensagem */}
        <Text style={styles.formLabel}>Compartilhe seus pensamentos e sentimentos:</Text>
        <TextInput
          placeholder="Como foi seu dia? O que você está sentindo? Escreva aqui seus pensamentos, preocupações ou conquistas..."
          placeholderTextColor="#9CA3AF"
          value={currentMessage}
          onChangeText={setCurrentMessage}
          style={[styles.input, styles.messageInput]}
          multiline
        />
        <Text style={styles.characterCount}>{currentMessage.length}/500 caracteres</Text>

        <TouchableOpacity
          onPress={handleSubmitEntry}
          disabled={!currentMessage.trim() || !selectedEmotion}
          style={[
            styles.submitButton,
            (!currentMessage.trim() || !selectedEmotion) && styles.submitButtonDisabled
          ]}
        >
          <Text style={styles.submitButtonText}>❤️ Registrar no Diário Emocional</Text>
        </TouchableOpacity>
      </View>

      {/* Serviços Premium */}
      <View style={styles.servicesContainer}>
        <TouchableOpacity
          onPress={initializeChatbot}
          style={styles.serviceCard}
        >
          <Text style={styles.serviceIcon}>🤖</Text>
          <Text style={styles.serviceTitle}>Iniciar Conversa</Text>
          <Text style={styles.serviceDescription}>
            Converse com nossa IA especializada que te ajudará a encontrar o profissional ideal.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://pay.kirvano.com/a08d4d24-a69b-42cc-9a6d-2dadfa2a52a7')}
          style={styles.serviceCard}
        >
          <Text style={styles.serviceIcon}>👑</Text>
          <Text style={styles.serviceTitle}>AtlasFit Premium</Text>
          <Text style={styles.serviceDescription}>
            Acesso premium com as melhores dietas personalizadas e treinos profissionais.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://pay.kirvano.com/12695837-2e21-4924-a2b7-abe68abcf4ee')}
          style={styles.serviceCard}
        >
          <Text style={styles.serviceIcon}>🍃</Text>
          <Text style={styles.serviceTitle}>Pleni Terapêutico</Text>
          <Text style={styles.serviceDescription}>
            Exercícios terapêuticos especializados e técnicas avançadas de respiração.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL('https://pay.kirvano.com/76d24e17-4849-4968-ab93-22130b8e33e9')}
          style={styles.serviceCard}
        >
          <Text style={styles.serviceIcon}>🛡️</Text>
          <Text style={styles.serviceTitle}>Saúde Mental Plena Premium</Text>
          <Text style={styles.serviceDescription}>
            Acesso premium a dietas personalizadas, exercícios e técnicas avançadas de yoga terapêutico.
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderChatbot = () => (
    <View style={styles.content}>
      <View style={styles.chatContainer}>
        <Text style={styles.sectionTitle}>🤖 Assistente de Bem-estar</Text>
        
        <ScrollView style={styles.chatMessages}>
          {chatMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.chatMessage,
                message.isBot ? styles.chatMessageBot : styles.chatMessageUser
              ]}
            >
              <Text style={[
                styles.chatMessageText,
                message.isBot ? styles.chatMessageTextBot : styles.chatMessageTextUser
              ]}>
                {message.message}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        {chatStep > 0 && (
          <View style={styles.chatInputContainer}>
            <TextInput
              placeholder="Digite sua resposta..."
              placeholderTextColor="#9CA3AF"
              value={chatInput}
              onChangeText={setChatInput}
              style={styles.chatInput}
              onSubmitEditing={() => {
                if (chatInput.trim()) {
                  handleChatResponse(chatInput);
                  setChatInput('');
                }
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (chatInput.trim()) {
                  handleChatResponse(chatInput);
                  setChatInput('');
                }
              }}
              style={styles.chatSendButton}
            >
              <Text style={styles.chatSendButtonText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {chatStep === 1 && (
          <View style={styles.chatQuickReplies}>
            <TouchableOpacity
              onPress={() => handleChatResponse('Psicólogo')}
              style={styles.quickReplyButton}
            >
              <Text style={styles.quickReplyText}>Psicólogo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleChatResponse('Personal Trainer')}
              style={styles.quickReplyButton}
            >
              <Text style={styles.quickReplyText}>Personal Trainer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleChatResponse('Ambos')}
              style={styles.quickReplyButton}
            >
              <Text style={styles.quickReplyText}>Ambos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  const renderCronograma = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>📅 Cronograma de Atividades</Text>
      
      {/* Formulário para nova atividade */}
      <View style={styles.newScheduleForm}>
        <Text style={styles.formTitle}>Adicionar Nova Atividade</Text>
        <TextInput
          placeholder="Título da atividade"
          placeholderTextColor="#9CA3AF"
          value={newScheduleItem.title}
          onChangeText={(text) => setNewScheduleItem(prev => ({ ...prev, title: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Descrição da atividade"
          placeholderTextColor="#9CA3AF"
          value={newScheduleItem.description}
          onChangeText={(text) => setNewScheduleItem(prev => ({ ...prev, description: text }))}
          style={[styles.input, styles.textArea]}
          multiline
        />
        <TextInput
          placeholder="Data (DD/MM/AAAA)"
          placeholderTextColor="#9CA3AF"
          value={newScheduleItem.date}
          onChangeText={(text) => setNewScheduleItem(prev => ({ ...prev, date: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Horário (HH:MM)"
          placeholderTextColor="#9CA3AF"
          value={newScheduleItem.time}
          onChangeText={(text) => setNewScheduleItem(prev => ({ ...prev, time: text }))}
          style={styles.input}
        />
        <TextInput
          placeholder="Duração (minutos)"
          placeholderTextColor="#9CA3AF"
          value={newScheduleItem.duration.toString()}
          onChangeText={(text) => setNewScheduleItem(prev => ({ ...prev, duration: Number(text) || 60 }))}
          style={styles.input}
          keyboardType="numeric"
        />
        <TouchableOpacity
          onPress={handleAddScheduleItem}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>➕ Adicionar Atividade</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de atividades */}
      <View style={styles.scheduleList}>
        {scheduleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📅</Text>
            <Text style={styles.emptyStateText}>Nenhuma atividade programada</Text>
          </View>
        ) : (
          scheduleItems.map((item) => (
            <View key={item.id} style={[
              styles.scheduleItem,
              item.completed && styles.scheduleItemCompleted
            ]}>
              <TouchableOpacity
                onPress={() => toggleScheduleComplete(item.id)}
                style={[
                  styles.scheduleCheckbox,
                  item.completed && styles.scheduleCheckboxCompleted
                ]}
              >
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <View style={styles.scheduleContent}>
                <Text style={[
                  styles.scheduleTitle,
                  item.completed && styles.scheduleTitleCompleted
                ]}>
                  {item.title}
                </Text>
                <Text style={styles.scheduleDescription}>{item.description}</Text>
                <Text style={styles.scheduleDetails}>
                  📅 {item.date} • 🕐 {item.time} • ⏱️ {item.duration} min
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteScheduleItem(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );

  const renderRotina = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>⚡ Rotina de Bem-estar</Text>
      
      <View style={styles.routineList}>
        {routineItems.map((item) => (
          <View key={item.id} style={[
            styles.routineItem,
            item.completed && styles.routineItemCompleted
          ]}>
            <TouchableOpacity
              onPress={() => toggleRoutineComplete(item.id)}
              style={[
                styles.routineCheckbox,
                item.completed && styles.routineCheckboxCompleted
              ]}
            >
              {item.completed && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.routineContent}>
              <View style={styles.routineHeader}>
                <Text style={[
                  styles.routineTitle,
                  item.completed && styles.routineTitleCompleted
                ]}>
                  {item.title}
                </Text>
                <View style={styles.routineBadges}>
                  <Text style={styles.routineBadge}>
                    {item.category === 'treino' ? '💪 Treino' : 
                     item.category === 'alimentacao' ? '🥗 Alimentação' : 
                     '💡 Conselho'}
                  </Text>
                  {item.streak > 0 && (
                    <Text style={styles.streakBadge}>🔥 {item.streak} dias</Text>
                  )}
                </View>
              </View>
              <Text style={styles.routineDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.menuButton}
          >
            <Text style={styles.menuButtonText}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Image 
              source={{ uri: 'https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/b709a33c-4fc8-47c9-987d-cf5f3458fe87.png' }}
              style={styles.logo}
            />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Saúde Mental Plena</Text>
              <Text style={styles.headerSubtitle}>Cuidando do seu bem-estar emocional</Text>
            </View>
          </View>
        </View>
        <View style={styles.versionBadge}>
          <Text style={styles.versionText}>❤️ v2.0</Text>
        </View>
      </View>

      {/* Sidebar */}
      {renderSidebar()}

      {/* Conteúdo baseado na seção ativa */}
      {activeSection === 'diario' && renderDiario()}
      {activeSection === 'chatbot' && renderChatbot()}
      {activeSection === 'cronograma' && renderCronograma()}
      {activeSection === 'rotina' && renderRotina()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 12,
  },
  menuButtonText: {
    color: '#FFF',
    fontSize: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#D1D5DB',
    fontSize: 12,
  },
  versionBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  versionText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: 280,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.9)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 18,
  },
  menuContainer: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    color: '#D1D5DB',
    fontSize: 16,
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#FCD34D',
  },
  dailyMessageContainer: {
    padding: 16,
  },
  dailyMessageCard: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  dailyMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sparkleIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dailyMessageTitle: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '600',
  },
  dailyMessageInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    color: '#FFF',
    fontSize: 12,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  publishButton: {
    backgroundColor: 'linear-gradient(45deg, #EAB308, #F59E0B)',
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  motivationalCard: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  motivationalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  motivationalIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EAB308',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sparkleText: {
    fontSize: 20,
    color: '#FFF',
  },
  motivationalContent: {
    flex: 1,
  },
  motivationalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  motivationalText: {
    color: '#FEF3C7',
    fontSize: 14,
    lineHeight: 20,
  },
  chartsContainer: {
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  futureVisionCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  newGoalForm: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: 'rgba(139, 92, 246, 1)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goalsContainer: {
    marginTop: 16,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  goalItemCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  goalCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  goalCheckboxCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalTitleCompleted: {
    color: '#86EFAC',
  },
  goalDescription: {
    color: '#D1D5DB',
    fontSize: 12,
    marginBottom: 4,
  },
  goalDate: {
    color: '#9CA3AF',
    fontSize: 11,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statNumber: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
  },
  registrationCard: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formLabel: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  emotionButton: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emotionButtonSelected: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  emotionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  emotionName: {
    color: '#D1D5DB',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  intensityContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  intensityLabel: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  intensityValue: {
    color: '#EAB308',
    fontWeight: 'bold',
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  intensityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  intensityButtonSelected: {
    backgroundColor: '#EAB308',
  },
  intensityButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  intensityButtonTextSelected: {
    color: '#000',
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'right',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: 'linear-gradient(45deg, #EAB308, #F59E0B)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  serviceTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  serviceDescription: {
    color: '#DBEAFE',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  chatContainer: {
    flex: 1,
  },
  chatMessages: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    maxHeight: 400,
  },
  chatMessage: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  chatMessageBot: {
    alignSelf: 'flex-start',
  },
  chatMessageUser: {
    alignSelf: 'flex-end',
  },
  chatMessageText: {
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
  },
  chatMessageTextBot: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    color: '#DBEAFE',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  chatMessageTextUser: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    color: '#FEF3C7',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chatInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 14,
    marginRight: 8,
  },
  chatSendButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  chatSendButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chatQuickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickReplyButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  quickReplyText: {
    color: '#DBEAFE',
    fontSize: 12,
  },
  newScheduleForm: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scheduleList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scheduleItemCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  scheduleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  scheduleCheckboxCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  scheduleTitleCompleted: {
    color: '#86EFAC',
  },
  scheduleDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 8,
  },
  scheduleDetails: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  routineList: {
    flex: 1,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  routineItemCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  routineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 4,
  },
  routineCheckboxCompleted: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  routineContent: {
    flex: 1,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routineTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  routineTitleCompleted: {
    color: '#86EFAC',
  },
  routineBadges: {
    alignItems: 'flex-end',
  },
  routineBadge: {
    color: '#D1D5DB',
    fontSize: 12,
    marginBottom: 4,
  },
  streakBadge: {
    color: '#FCD34D',
    fontSize: 11,
  },
  routineDescription: {
    color: '#D1D5DB',
    fontSize: 14,
  },
});