import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  FlatList,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import { completeMeditation, visitScreen } from '../screens/GamificationManager';

// Tipo para as músicas
type MusicTrack = {
  id: string;
  title: string;
  source: any;
};

const musicTracks: MusicTrack[] = [
  { id: '1', title: 'Respiração e Relaxamento', source: require('../../assets/audio/breathing_4_7_8.mp3') },
  { id: '2', title: 'Meditação Calma e Serena', source: require('../../assets/audio/guided_meditation_3min.mp3') },
  { id: '3', title: 'Meditação Yoga', source: require('../../assets/audio/yoga_meditaçao.mp3') },
  { id: '4', title: 'Desestressar e Acalmar', source: require('../../assets/audio/yoga_meditaçao.mp3') },
  { id: '5', title: 'Relaxar e Dormir', source: require('../../assets/audio/meditation-sleep-music-250778.mp3') },
];

const RelaxScreen = () => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const markVisit = async () => {
      await visitScreen('Relax');
    };
    markVisit();
  }, []);

  const breatheAnim = useRef(new Animated.Value(1)).current;
  const translateAnim = useRef(new Animated.Value(0)).current;

  const startBreathingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 1.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: -10,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(translateAnim, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  };

  const stopBreathingAnimation = () => {
    breatheAnim.stopAnimation();
    translateAnim.stopAnimation();
    breatheAnim.setValue(1);
    translateAnim.setValue(0);
  };

  const playSound = async (track: MusicTrack) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(track.source);
      setSound(newSound);
      setCurrentTrackId(track.id);
      await newSound.playAsync();
      setIsPlaying(true);

      startBreathingAnimation();
    } catch (error) {
      console.error('Erro ao reproduzir o áudio:', error);
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      stopBreathingAnimation();
    }
  };

  const resumeSound = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
      startBreathingAnimation();
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setCurrentTrackId(null);
      setIsPlaying(false);
      stopBreathingAnimation();

      await completeMeditation();
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      stopBreathingAnimation();
    };
  }, [sound]);

  const handleTrackPress = async (track: MusicTrack) => {
    if (currentTrackId === track.id) {
      const status = await sound?.getStatusAsync();
      if (status?.isLoaded && status.isPlaying) {
        await pauseSound();
      } else {
        await resumeSound();
      }
    } else {
      await playSound(track);
    }
  };

  const renderTrackItem = ({ item }: { item: MusicTrack }) => {
    return (
      <TouchableOpacity style={styles.trackItem} onPress={() => handleTrackPress(item)}>
        <Text style={styles.trackText}>{item.title}</Text>
        <Text style={styles.playButton}>
          {currentTrackId === item.id ? (isPlaying ? 'Pausar' : 'Retomar') : 'Tocar'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Relaxamento</Text>

      <Text style={styles.instruction}>
        Escolha uma música relaxante e siga a respiração do nosso amigo!
      </Text>

      <Animated.Image
        source={require('../../assets/breathing_buddy.png')}
        style={[
          styles.buddyImage,
          {
            transform: [
              { scaleY: breatheAnim },
              { scaleX: 1 },
              { translateY: translateAnim },
            ],
          },
        ]}
      />

      <FlatList
        data={musicTracks}
        renderItem={renderTrackItem}
        keyExtractor={(item) => item.id}
        style={styles.trackList}
      />

      {currentTrackId && (
        <TouchableOpacity style={styles.stopButton} onPress={stopSound}>
          <Text style={styles.buttonText}>Parar Música</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E8B57',
    textAlign: 'center',
    marginBottom: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buddyImage: {
    width: 150,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  trackList: {
    width: '100%',
  },
  trackItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  trackText: {
    fontSize: 16,
    color: '#333',
  },
  playButton: {
    fontSize: 16,
    color: '#32CD32',
    fontWeight: 'bold',
  },
  stopButton: {
    width: '80%',
    height: 50,
    backgroundColor: '#ff4444',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
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
});

export default RelaxScreen;