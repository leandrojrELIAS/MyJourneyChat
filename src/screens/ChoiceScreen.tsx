import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { accessSpotify, accessMessages, visitScreen } from '../screens/GamificationManager';

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

type ChoiceScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Choice'>;

const ChoiceScreen = () => {
  const navigation = useNavigation<ChoiceScreenNavigationProp>();

  useEffect(() => {
    const markVisit = async () => {
      await visitScreen('Choice');
    };
    markVisit();
  }, []);

  const openSpotifyLink = async () => {
    const url = 'https://open.spotify.com/show/3pvBDk8dcETsjMA1680iTu?si=42af44b7f1ec410b';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      await accessSpotify();
    } else {
      console.error('Não foi possível abrir o link do Spotify');
    }
  };

  const openMessagesLink = async () => {
    const url = 'https://www.chatbase.co/chatbot-iframe/WiOOCUHdzoMo-DyujoiRn';
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
      await accessMessages();
    } else {
      console.error('Não foi possível abrir o link de Mensagens');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo(a) ao Mova Ai</Text>
      <Text style={styles.subtitle}>Escolha uma opção:</Text>

      <TouchableOpacity
        style={[styles.button, styles.moodDiaryButton]}
        onPress={() => navigation.navigate('MoodDiary')}
      >
        <MaterialCommunityIcons name="emoticon-happy-outline" size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>Diário de Humor</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.relaxButton]}
        onPress={() => navigation.navigate('Relax')}
      >
        <MaterialCommunityIcons name="meditation" size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>Relaxamento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.spotifyButton]}
        onPress={openSpotifyLink}
      >
        <MaterialCommunityIcons name="music" size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>Spotify</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.messagesButton]}
        onPress={openMessagesLink}
      >
        <MaterialCommunityIcons name="message-text-outline" size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>Mensagens</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.achievementsButton]}
        onPress={() => navigation.navigate('Achievements')}
      >
        <MaterialCommunityIcons name="trophy-outline" size={24} color="#ffffff" style={styles.icon} />
        <Text style={styles.buttonText}>Conquistas</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
  },
  button: {
    width: '80%',
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  moodDiaryButton: {
    backgroundColor: '#A2DFFA', // Azul pastel suave
  },
  relaxButton: {
    backgroundColor: '#B5EAD7', // Verde pastel suave
  },
  spotifyButton: {
    backgroundColor: '#C7CEEA', // Roxo pastel suave
  },
  messagesButton: {
    backgroundColor: '#FFDAC1', // Laranja pastel suave
  },
  achievementsButton: {
    backgroundColor: '#FFD1DC', // Rosa pastel suave
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 10,
  },
});

export default ChoiceScreen;