import { auth, db } from '../services/firebaseConfig';
import { format, differenceInDays, parseISO } from 'date-fns';
import { getFirestore, doc, getDoc, setDoc, collection } from 'firebase/firestore';

// Tipos para os dados de gamificação
type Achievement = {
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  progress: { current: number; target: number };
};

type Certificate = {
  level: string;
  unlocked: boolean;
};

// Definir as imagens dos certificados fora do Firestore
const CERTIFICATE_IMAGES = {
  bronze: require('../../assets/certificado_bronze.png'),
  silver: require('../../assets/certificado_prata.png'),
  gold: require('../../assets/certificado_ouro.png'),
};

type GamificationData = {
  points: number;
  achievements: Achievement[];
  certificates: Certificate[];
  consecutiveMeditationDays: number;
  consecutiveMoodDays: number;
  lastMeditationDate: string | null;
  lastMoodDate: string | null;
  totalMeditations: number;
  totalMoodEntries: number;
  totalActivities: number;
  spotifyAccesses: number;
  messagesAccesses: number;
  visitedScreens: string[];
  dailyActivities: { date: string; count: number }[];
};

// Dados iniciais para gamificação
const getInitialGamificationData = (): GamificationData => ({
  points: 0,
  achievements: [
    { id: 'relax_beginner', name: 'Relaxador Iniciante', description: 'Medite por 1 dia.', achieved: false, progress: { current: 0, target: 1 } },
    { id: 'meditation_master', name: 'Mestre da Meditação', description: 'Medite por 5 dias seguidos.', achieved: false, progress: { current: 0, target: 5 } },
    { id: 'emotional_aware', name: 'Emocional Consciente', description: 'Registre o humor por 3 dias seguidos.', achieved: false, progress: { current: 0, target: 3 } },
    { id: 'mood_explorer', name: 'Explorador de Humor', description: 'Registre o humor 5 vezes.', achieved: false, progress: { current: 0, target: 5 } },
    { id: 'frequent_relaxer', name: 'Relaxador Frequente', description: 'Medite 10 vezes.', achieved: false, progress: { current: 0, target: 10 } },
    { id: 'persistent_emotional', name: 'Persistente Emocional', description: 'Registre o humor por 7 dias seguidos.', achieved: false, progress: { current: 0, target: 7 } },
    { id: 'dedicated_meditator', name: 'Meditador Dedicado', description: 'Medite por 10 dias seguidos.', achieved: false, progress: { current: 0, target: 10 } },
    { id: 'first_steps', name: 'Primeiros Passos', description: 'Complete 1 atividade.', achieved: false, progress: { current: 0, target: 1 } },
    { id: 'committed_newbie', name: 'Novato Comprometido', description: 'Complete 5 atividades.', achieved: false, progress: { current: 0, target: 5 } },
    { id: 'relaxation_veteran', name: 'Veterano do Relaxamento', description: 'Complete 20 atividades.', achieved: false, progress: { current: 0, target: 20 } },
    { id: 'active_messenger', name: 'Mensageiro Ativo', description: 'Acesse Mensagens 3 vezes.', achieved: false, progress: { current: 0, target: 3 } },
    { id: 'music_lover', name: 'Amante da Música', description: 'Acesse o Spotify 3 vezes.', achieved: false, progress: { current: 0, target: 3 } },
    { id: 'app_explorer', name: 'Explorador do App', description: 'Visite todas as telas do app.', achieved: false, progress: { current: 0, target: 5 } },
    { id: 'perfect_week', name: 'Semana Perfeita', description: 'Complete 1 atividade por dia por 7 dias.', achieved: false, progress: { current: 0, target: 7 } },
    { id: 'points_beginner', name: 'Pontuador Iniciante', description: 'Acumule 50 pontos.', achieved: false, progress: { current: 0, target: 50 } },
    { id: 'points_expert', name: 'Pontuador Experiente', description: 'Acumule 100 pontos.', achieved: false, progress: { current: 0, target: 100 } },
    { id: 'mova_ai_master', name: 'Mestre do Mova Ai', description: 'Desbloqueie 10 conquistas.', achieved: false, progress: { current: 0, target: 10 } },
  ],
  certificates: [
    { level: 'bronze', unlocked: false },
    { level: 'silver', unlocked: false },
    { level: 'gold', unlocked: false },
  ],
  consecutiveMeditationDays: 0,
  consecutiveMoodDays: 0,
  lastMeditationDate: null,
  lastMoodDate: null,
  totalMeditations: 0,
  totalMoodEntries: 0,
  totalActivities: 0,
  spotifyAccesses: 0,
  messagesAccesses: 0,
  visitedScreens: [],
  dailyActivities: [],
});

// Função para obter o ID do usuário
const getUserId = (): string => {
  const user = auth().currentUser;
  if (user) {
    return user.uid;
  }
  throw new Error('Usuário não autenticado. Faça login para continuar.');
};

// Função para inicializar os dados de gamificação no Firestore
const initializeGamificationData = async (): Promise<GamificationData> => {
  try {
    const initialData = getInitialGamificationData();

    const userId = getUserId();
    const firestore = getFirestore();
    const gamificationRef = doc(collection(firestore, 'gamificationData'), userId);

    const docSnap = await getDoc(gamificationRef);
    if (!docSnap.exists()) {
      console.log('Nenhum dado encontrado no Firestore. Inicializando com dados padrão.');
      await setDoc(gamificationRef, initialData);
      return initialData;
    }

    const storedData = docSnap.data() as GamificationData;
    console.log('Dados recuperados do Firestore:', storedData);
    console.log('Dados recuperados do Firestore:', storedData);

    // Mesclar os dados salvos com os dados iniciais para garantir compatibilidade
    const mergedData: GamificationData = {
      ...initialData,
      ...storedData,
      achievements: initialData.achievements.map((initAchievement: Achievement) => {
        const storedAchievement = storedData.achievements?.find((a: Achievement) => a.id === initAchievement.id);
        return storedAchievement ? { ...initAchievement, ...storedAchievement } : initAchievement;
      }),
      certificates: initialData.certificates.map((initCertificate: Certificate) => {
        const storedCertificate = storedData.certificates?.find((c: Certificate) => c.level === initCertificate.level);
        return storedCertificate ? { ...initCertificate, ...storedCertificate } : initCertificate;
      }),
    };

    console.log('Dados mesclados com sucesso:', mergedData);
    return mergedData;
  } 
  catch (error) {
    console.error('Erro ao inicializar os dados de gamificação no Firestore:', error);
    throw error; // Propaga o erro para ser tratado na UI
  } 
}
  
const saveGamificationData = async (data: GamificationData) => {
  try {
    const userId = getUserId();
    const firestore = getFirestore();
    const gamificationRef = doc(collection(firestore, 'gamificationData'), userId);
    await setDoc(gamificationRef, data, { merge: true });
    console.log('Dados salvos no Firestore:', data);
  } catch (error) {
    console.error('Erro ao salvar os dados de gamificação no Firestore:', error);
    throw error;
  }
};

// Função para verificar e resetar os contadores de dias consecutivos
const checkAndResetConsecutiveDays = (data: GamificationData, currentDate: string): GamificationData => {
  const updatedData = { ...data };

  if (updatedData.lastMeditationDate) {
    const lastMeditation = parseISO(updatedData.lastMeditationDate);
    const daysDiff = differenceInDays(new Date(currentDate), lastMeditation);
    if (daysDiff > 1) {
      updatedData.consecutiveMeditationDays = 0;
      updatedData.achievements.find(a => a.id === 'meditation_master')!.progress.current = 0;
      updatedData.achievements.find(a => a.id === 'dedicated_meditator')!.progress.current = 0;
    }
  }

  if (updatedData.lastMoodDate) {
    const lastMood = parseISO(updatedData.lastMoodDate);
    const daysDiff = differenceInDays(new Date(currentDate), lastMood);
    if (daysDiff > 1) {
      updatedData.consecutiveMoodDays = 0;
      updatedData.achievements.find(a => a.id === 'emotional_aware')!.progress.current = 0;
      updatedData.achievements.find(a => a.id === 'persistent_emotional')!.progress.current = 0;
    }
  }

  return updatedData;
};

// Função para verificar a conquista "Semana Perfeita"
const checkPerfectWeek = (dailyActivities: { date: string; count: number }[]): { achieved: boolean; progress: number } => {
  if (dailyActivities.length < 7) return { achieved: false, progress: dailyActivities.length };

  const sortedActivities = dailyActivities
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Últimos 7 dias

  let consecutiveDays = 0;
  for (let i = 0; i < sortedActivities.length - 1; i++) {
    const currentDate = parseISO(sortedActivities[i].date);
    const nextDate = parseISO(sortedActivities[i + 1].date);
    if (differenceInDays(nextDate, currentDate) === 1 && sortedActivities[i].count > 0) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  if (sortedActivities[sortedActivities.length - 1].count > 0) {
    consecutiveDays++;
  }

  return { achieved: consecutiveDays >= 7, progress: consecutiveDays };
};

// Função para atualizar os certificados
const updateCertificates = (data: GamificationData): GamificationData => {
  const achievedCount = data.achievements.filter(a => a.achieved).length;
  if (achievedCount >= 5) data.certificates[0].unlocked = true; // Bronze
  if (achievedCount >= 10) data.certificates[1].unlocked = true; // Prata
  if (achievedCount >= 15) data.certificates[2].unlocked = true; // Ouro
  return data;
};

// Função para registrar uma meditação
const completeMeditation = async (): Promise<GamificationData> => {
  let data = await initializeGamificationData();
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  data = checkAndResetConsecutiveDays(data, currentDate);

  data.points += 10;
  data.totalMeditations += 1;
  data.totalActivities += 1;

  if (data.lastMeditationDate && differenceInDays(new Date(currentDate), parseISO(data.lastMeditationDate)) === 1) {
    data.consecutiveMeditationDays += 1;
  } else if (!data.lastMeditationDate || differenceInDays(new Date(currentDate), parseISO(data.lastMeditationDate)) > 1) {
    data.consecutiveMeditationDays = 1;
  }

  data.lastMeditationDate = currentDate;

  const dailyActivity = data.dailyActivities.find(da => da.date === currentDate);
  if (dailyActivity) {
    dailyActivity.count += 1;
  } else {
    data.dailyActivities.push({ date: currentDate, count: 1 });
  }

  // Atualizar progresso das conquistas
  data.achievements.find(a => a.id === 'relax_beginner')!.progress.current = Math.min(data.consecutiveMeditationDays, 1);
  data.achievements.find(a => a.id === 'meditation_master')!.progress.current = Math.min(data.consecutiveMeditationDays, 5);
  data.achievements.find(a => a.id === 'dedicated_meditator')!.progress.current = Math.min(data.consecutiveMeditationDays, 10);
  data.achievements.find(a => a.id === 'frequent_relaxer')!.progress.current = Math.min(data.totalMeditations, 10);
  data.achievements.find(a => a.id === 'first_steps')!.progress.current = Math.min(data.totalActivities, 1);
  data.achievements.find(a => a.id === 'committed_newbie')!.progress.current = Math.min(data.totalActivities, 5);
  data.achievements.find(a => a.id === 'relaxation_veteran')!.progress.current = Math.min(data.totalActivities, 20);
  data.achievements.find(a => a.id === 'points_beginner')!.progress.current = Math.min(data.points, 50);
  data.achievements.find(a => a.id === 'points_expert')!.progress.current = Math.min(data.points, 100);

  const perfectWeek = checkPerfectWeek(data.dailyActivities);
  data.achievements.find(a => a.id === 'perfect_week')!.progress.current = perfectWeek.progress;

  // Verificar conquistas
  if (data.consecutiveMeditationDays >= 1) {
    const relaxBeginner = data.achievements.find(a => a.id === 'relax_beginner');
    if (relaxBeginner) relaxBeginner.achieved = true;
  }
  if (data.consecutiveMeditationDays >= 5) {
    const meditationMaster = data.achievements.find(a => a.id === 'meditation_master');
    if (meditationMaster) meditationMaster.achieved = true;
  }
  if (data.consecutiveMeditationDays >= 10) {
    const dedicatedMeditator = data.achievements.find(a => a.id === 'dedicated_meditator');
    if (dedicatedMeditator) dedicatedMeditator.achieved = true;
  }
  if (data.totalMeditations >= 10) {
    const frequentRelaxer = data.achievements.find(a => a.id === 'frequent_relaxer');
    if (frequentRelaxer) frequentRelaxer.achieved = true;
  }
  if (data.totalActivities >= 1) {
    const firstSteps = data.achievements.find(a => a.id === 'first_steps');
    if (firstSteps) firstSteps.achieved = true;
  }
  if (data.totalActivities >= 5) {
    const committedNewbie = data.achievements.find(a => a.id === 'committed_newbie');
    if (committedNewbie) committedNewbie.achieved = true;
  }
  if (data.totalActivities >= 20) {
    const relaxationVeteran = data.achievements.find(a => a.id === 'relaxation_veteran');
    if (relaxationVeteran) relaxationVeteran.achieved = true;
  }
  if (data.points >= 50) {
    const pointsBeginner = data.achievements.find(a => a.id === 'points_beginner');
    if (pointsBeginner) pointsBeginner.achieved = true;
  }
  if (data.points >= 100) {
    const pointsExpert = data.achievements.find(a => a.id === 'points_expert');
    if (pointsExpert) pointsExpert.achieved = true;
  }
  if (perfectWeek.achieved) {
    const perfectWeekAchievement = data.achievements.find(a => a.id === 'perfect_week');
    if (perfectWeekAchievement) perfectWeekAchievement.achieved = true;
  }

  const achievedCount = data.achievements.filter(a => a.achieved).length;
  data.achievements.find(a => a.id === 'mova_ai_master')!.progress.current = Math.min(achievedCount, 10);
  if (achievedCount >= 10) {
    const movaAiMaster = data.achievements.find(a => a.id === 'mova_ai_master');
    if (movaAiMaster) movaAiMaster.achieved = true;
  }

  data = updateCertificates(data);
  await saveGamificationData(data);
  return data;
};

// Função para registrar um humor
const completeMoodEntry = async (): Promise<GamificationData> => {
  let data = await initializeGamificationData();
  const currentDate = format(new Date(), 'yyyy-MM-dd');

  data = checkAndResetConsecutiveDays(data, currentDate);

  data.points += 5;
  data.totalMoodEntries += 1;
  data.totalActivities += 1;

  if (data.lastMoodDate && differenceInDays(new Date(currentDate), parseISO(data.lastMoodDate)) === 1) {
    data.consecutiveMoodDays += 1;
  } else if (!data.lastMoodDate || differenceInDays(new Date(currentDate), parseISO(data.lastMoodDate)) > 1) {
    data.consecutiveMoodDays = 1;
  }

  data.lastMoodDate = currentDate;

  const dailyActivity = data.dailyActivities.find(da => da.date === currentDate);
  if (dailyActivity) {
    dailyActivity.count += 1;
  } else {
    data.dailyActivities.push({ date: currentDate, count: 1 });
  }

  // Atualizar progresso das conquistas
  data.achievements.find(a => a.id === 'emotional_aware')!.progress.current = Math.min(data.consecutiveMoodDays, 3);
  data.achievements.find(a => a.id === 'persistent_emotional')!.progress.current = Math.min(data.consecutiveMoodDays, 7);
  data.achievements.find(a => a.id === 'mood_explorer')!.progress.current = Math.min(data.totalMoodEntries, 5);
  data.achievements.find(a => a.id === 'first_steps')!.progress.current = Math.min(data.totalActivities, 1);
  data.achievements.find(a => a.id === 'committed_newbie')!.progress.current = Math.min(data.totalActivities, 5);
  data.achievements.find(a => a.id === 'relaxation_veteran')!.progress.current = Math.min(data.totalActivities, 20);
  data.achievements.find(a => a.id === 'points_beginner')!.progress.current = Math.min(data.points, 50);
  data.achievements.find(a => a.id === 'points_expert')!.progress.current = Math.min(data.points, 100);

  const perfectWeek = checkPerfectWeek(data.dailyActivities);
  data.achievements.find(a => a.id === 'perfect_week')!.progress.current = perfectWeek.progress;

  // Verificar conquistas
  if (data.consecutiveMoodDays >= 3) {
    const emotionalAware = data.achievements.find(a => a.id === 'emotional_aware');
    if (emotionalAware) emotionalAware.achieved = true;
  }
  if (data.consecutiveMoodDays >= 7) {
    const persistentEmotional = data.achievements.find(a => a.id === 'persistent_emotional');
    if (persistentEmotional) persistentEmotional.achieved = true;
  }
  if (data.totalMoodEntries >= 5) {
    const moodExplorer = data.achievements.find(a => a.id === 'mood_explorer');
    if (moodExplorer) moodExplorer.achieved = true;
  }
  if (data.totalActivities >= 1) {
    const firstSteps = data.achievements.find(a => a.id === 'first_steps');
    if (firstSteps) firstSteps.achieved = true;
  }
  if (data.totalActivities >= 5) {
    const committedNewbie = data.achievements.find(a => a.id === 'committed_newbie');
    if (committedNewbie) committedNewbie.achieved = true;
  }
  if (data.totalActivities >= 20) {
    const relaxationVeteran = data.achievements.find(a => a.id === 'relaxation_veteran');
    if (relaxationVeteran) relaxationVeteran.achieved = true;
  }
  if (data.points >= 50) {
    const pointsBeginner = data.achievements.find(a => a.id === 'points_beginner');
    if (pointsBeginner) pointsBeginner.achieved = true;
  }
  if (data.points >= 100) {
    const pointsExpert = data.achievements.find(a => a.id === 'points_expert');
    if (pointsExpert) pointsExpert.achieved = true;
  }
  if (perfectWeek.achieved) {
    const perfectWeekAchievement = data.achievements.find(a => a.id === 'perfect_week');
    if (perfectWeekAchievement) perfectWeekAchievement.achieved = true;
  }

  const achievedCount = data.achievements.filter(a => a.achieved).length;
  data.achievements.find(a => a.id === 'mova_ai_master')!.progress.current = Math.min(achievedCount, 10);
  if (achievedCount >= 10) {
    const movaAiMaster = data.achievements.find(a => a.id === 'mova_ai_master');
    if (movaAiMaster) movaAiMaster.achieved = true;
  }

  data = updateCertificates(data);
  await saveGamificationData(data);
  return data;
};

// Função para registrar acesso ao Spotify
const accessSpotify = async (): Promise<GamificationData> => {
  let data = await initializeGamificationData();
  data.spotifyAccesses += 1;

  data.achievements.find(a => a.id === 'music_lover')!.progress.current = Math.min(data.spotifyAccesses, 3);
  if (data.spotifyAccesses >= 3) {
    const musicLover = data.achievements.find(a => a.id === 'music_lover');
    if (musicLover) musicLover.achieved = true;
  }

  data.visitedScreens = [...new Set([...data.visitedScreens, 'Spotify'])];
  data.achievements.find(a => a.id === 'app_explorer')!.progress.current = Math.min(data.visitedScreens.length, 5);
  if (data.visitedScreens.length >= 5) {
    const appExplorer = data.achievements.find(a => a.id === 'app_explorer');
    if (appExplorer) appExplorer.achieved = true;
  }

  const achievedCount = data.achievements.filter(a => a.achieved).length;
  data.achievements.find(a => a.id === 'mova_ai_master')!.progress.current = Math.min(achievedCount, 10);
  if (achievedCount >= 10) {
    const movaAiMaster = data.achievements.find(a => a.id === 'mova_ai_master');
    if (movaAiMaster) movaAiMaster.achieved = true;
  }

  data = updateCertificates(data);
  await saveGamificationData(data);
  return data;
};

// Função para registrar acesso às Mensagens
const accessMessages = async (): Promise<GamificationData> => {
  let data = await initializeGamificationData();
  data.messagesAccesses += 1;

  data.achievements.find(a => a.id === 'active_messenger')!.progress.current = Math.min(data.messagesAccesses, 3);
  if (data.messagesAccesses >= 3) {
    const activeMessenger = data.achievements.find(a => a.id === 'active_messenger');
    if (activeMessenger) activeMessenger.achieved = true;
  }

  data.visitedScreens = [...new Set([...data.visitedScreens, 'Messages'])];
  data.achievements.find(a => a.id === 'app_explorer')!.progress.current = Math.min(data.visitedScreens.length, 5);
  if (data.visitedScreens.length >= 5) {
    const appExplorer = data.achievements.find(a => a.id === 'app_explorer');
    if (appExplorer) appExplorer.achieved = true;
  }

  const achievedCount = data.achievements.filter(a => a.achieved).length;
  data.achievements.find(a => a.id === 'mova_ai_master')!.progress.current = Math.min(achievedCount, 10);
  if (achievedCount >= 10) {
    const movaAiMaster = data.achievements.find(a => a.id === 'mova_ai_master');
    if (movaAiMaster) movaAiMaster.achieved = true;
  }

  data = updateCertificates(data);
  await saveGamificationData(data);
  return data;
};

// Função para registrar visita a uma tela
const visitScreen = async (screen: string): Promise<GamificationData> => {
  let data = await initializeGamificationData();
  data.visitedScreens = [...new Set([...data.visitedScreens, screen])];

  data.achievements.find(a => a.id === 'app_explorer')!.progress.current = Math.min(data.visitedScreens.length, 5);
  if (data.visitedScreens.length >= 5) {
    const appExplorer = data.achievements.find(a => a.id === 'app_explorer');
    if (appExplorer) appExplorer.achieved = true;
  }

  const achievedCount = data.achievements.filter(a => a.achieved).length;
  data.achievements.find(a => a.id === 'mova_ai_master')!.progress.current = Math.min(achievedCount, 10);
  if (achievedCount >= 10) {
    const movaAiMaster = data.achievements.find(a => a.id === 'mova_ai_master');
    if (movaAiMaster) movaAiMaster.achieved = true;
  }

  data = updateCertificates(data);
  await saveGamificationData(data);
  return data;
};

// Função para obter os dados de gamificação
const getGamificationData = async (): Promise<GamificationData> => {
  const data = await initializeGamificationData();
  const currentDate = format(new Date(), 'yyyy-MM-dd');
  return checkAndResetConsecutiveDays(data, currentDate);
};

// Função para obter as imagens dos certificados
const getCertificateImage = (level: string) => {
  return CERTIFICATE_IMAGES[level as keyof typeof CERTIFICATE_IMAGES];
};

export {
  completeMeditation,
  completeMoodEntry,
  accessSpotify,
  accessMessages,
  visitScreen,
  getGamificationData,
  getCertificateImage,
};
export type { GamificationData };