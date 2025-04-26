import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { auth, db } from '../services/firebaseConfig';
import { completeMoodEntry } from '../screens/GamificationManager'; // Importar a função de gamificação
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { QuerySnapshot, DocumentData } from '@react-native-firebase/firestore'; // Importar tipos do Firestore

// Definição dos tipos para a navegação
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Cadastro: undefined;
  Choice: undefined;
  MoodDiary: undefined;
  Relax: undefined;
  Achievements: undefined;
};

type MoodDiaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MoodDiary'>;

// Tipo para os registros de humor
type Mood = {
  id: string;
  mood: string;
  note: string;
  createdAt: string;
};

// Interface para o estilo do gráfico
interface ChartStyle extends ViewStyle {
  marginVertical?: number;
  borderRadius?: number;
}

// Mapeamento de emojis para humores
const moodEmojis: { [key: string]: string } = {
  Feliz: '😊',
  Triste: '😢',
  Neutro: '😕',
  Ansioso: '😣',
  Nervoso: '😡',
};

// Lista de humores disponíveis (em português)
const moods = ['Feliz', 'Triste', 'Neutro', 'Ansioso', 'Nervoso'];

const MoodDiaryScreen = () => {
  const navigation = useNavigation<MoodDiaryScreenNavigationProp>();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<Mood[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);

  useEffect(() => {
    // Escutar registros de humor do Firestore
    const user = auth().currentUser;
    if (user) {
      const unsubscribe = db
        .collection('moods')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .onSnapshot((snapshot: QuerySnapshot<DocumentData>) => {
          const moodsList: Mood[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          } as Mood));
          setMoodHistory(moodsList);

          // Filtrar registros do dia atual
          const today = new Date();
          const todayString = today.toISOString().split('T')[0]; // Formato: "YYYY-MM-DD"

          const todayMoods = moodsList
            .filter((mood) => {
              const moodDate = new Date(mood.createdAt).toISOString().split('T')[0];
              return moodDate === todayString;
            })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

          // Preparar dados para o gráfico (variações no mesmo dia)
          const moodValues = todayMoods.map((mood) => {
            switch (mood.mood) {
              case 'Feliz':
                return 5;
              case 'Neutro':
                return 3;
              case 'Triste':
                return 1;
              case 'Ansioso':
                return 2;
              case 'Nervoso':
                return 2;
              default:
                return 3;
            }
          });

          // Criar labels com o horário do registro (ex.: "14:49")
          const moodLabels = todayMoods.map((mood) => {
            const date = new Date(mood.createdAt);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          });

          setChartData(moodValues.length > 0 ? moodValues : [3]); // Default para Neutro se vazio
          setChartLabels(moodLabels.length > 0 ? moodLabels : ['Sem registros']);
        }, (error) => {
          console.error('Erro ao escutar registros de humor:', error);
          Toast.show({
            type: 'error',
            text1: 'Erro',
            text2: 'Não foi possível carregar o histórico de humor.',
          });
        });

      return () => unsubscribe();
    }
  }, []);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Selecione um humor antes de salvar.',
      });
      return;
    }

    const user = auth().currentUser;
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Usuário não autenticado. Faça login novamente.',
      });
      navigation.replace('Splash');
      return;
    }

    try {
      // Salvar no Firestore
      await db.collection('moods').add({
        userId: user.uid,
        mood: selectedMood,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      });

      // Registrar a entrada de humor no sistema de gamificação
      await completeMoodEntry();

      setSelectedMood(null);
      setNote('');
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Humor registrado com sucesso!',
      });
    } catch (error: any) {
      console.error('Erro ao salvar humor:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar o humor. Tente novamente.',
      });
    }
  };

  const renderMoodButton = (mood: string) => (
    <TouchableOpacity
      key={mood}
      style={[styles.moodButton, selectedMood === mood && styles.moodButtonSelected]}
      onPress={() => setSelectedMood(mood)}
    >
      <Text style={styles.moodEmoji}>{moodEmojis[mood]}</Text>
      <Text style={styles.moodText}>{mood}</Text>
    </TouchableOpacity>
  );

  const renderMoodHistoryItem = ({ item }: { item: Mood }) => (
    <View style={styles.historyItem}>
      <Text style={styles.historyMood}>
        {moodEmojis[item.mood]} {item.mood}
      </Text>
      <Text style={styles.historyDate}>
        {new Date(item.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })}
      </Text>
      {item.note ? <Text style={styles.historyNote}>{item.note}</Text> : null}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Diário de Humor</Text>

        <Text style={styles.subtitle}>Como você está se sentindo hoje?</Text>
        <View style={styles.moodButtonsContainer}>
          {moods.map(renderMoodButton)}
        </View>

        <TextInput
          style={styles.noteInput}
          placeholder="Adicione uma nota (opcional)"
          placeholderTextColor="#888"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveMood}>
          <Text style={styles.buttonText}>Salvar Humor</Text>
        </TouchableOpacity>

        <Text style={styles.subtitle}>Seu Histórico de Humor</Text>
        {chartData.length > 0 && (
          <LineChart
            data={{
              labels: chartLabels,
              datasets: [{ data: chartData }],
            }}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: () => '#2E8B57',
              labelColor: () => '#333',
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#2E8B57',
              },
            }}
            bezier
            style={styles.chart as ChartStyle}
          />
        )}

        <FlatList
          data={moodHistory}
          renderItem={renderMoodHistoryItem}
          keyExtractor={(item) => item.id}
          style={styles.historyList}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  innerContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
  },
  moodButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  moodButton: {
    width: 100,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  moodButtonSelected: {
    backgroundColor: '#32CD32',
    borderColor: '#2E8B57',
  },
  moodEmoji: {
    fontSize: 30,
  },
  moodText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  noteInput: {
    width: '100%',
    minHeight: 60,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
  },
  historyList: {
    marginTop: 10,
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  historyMood: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  historyNote: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
});

export default MoodDiaryScreen;