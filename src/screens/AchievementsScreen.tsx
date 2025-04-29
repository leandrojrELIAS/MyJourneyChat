import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Sharing from 'expo-sharing';
import { GamificationData, getGamificationData, visitScreen, getCertificateImage } from '../screens/GamificationManager';

const AchievementsScreen = () => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeGamification = async () => {
      try {
        setIsLoading(true);
        await visitScreen('Achievements');
        const data = await getGamificationData();
        setGamificationData(data);
      } catch (error) {
        console.error('Erro ao carregar dados de gamificação:', error);
        Alert.alert('Erro', 'Não foi possível carregar as conquistas. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeGamification();
  }, []);

  const downloadCertificate = async (certificate: { level: string; unlocked: boolean }) => {
    if (!certificate.unlocked) {
      Alert.alert('Certificado Bloqueado', 'Você ainda não desbloqueou este certificado.');
      return;
    }

    try {
      const imageUri = await getCertificateImage(certificate.level);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(imageUri, {
          dialogTitle: 'Compartilhar Certificado',
          mimeType: 'image/png', // Especificar o tipo MIME da imagem
          UTI: 'public.png', // Para iOS, definir o UTI correto
        });
      } else {
        Alert.alert('Erro', 'Compartilhamento não disponível no seu dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao compartilhar certificado:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar o certificado. Tente novamente.');
    }
  };

  const renderAchievement = ({ item }: { item: { id: string; name: string; description: string; achieved: boolean } }) => (
    <View style={styles.achievementCard}>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{item.name}</Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
        <Text style={styles.achievementStatus}>
          {item.achieved ? 'Desbloqueado' : 'Bloqueado'}
        </Text>
      </View>
    </View>
  );

  const renderCertificate = ({ item }: { item: { level: string; unlocked: boolean } }) => (
    <View style={styles.achievementCard}>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>Certificado {item.level}</Text>
        <Text style={styles.achievementStatus}>
          {item.unlocked ? 'Desbloqueado' : 'Bloqueado'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => downloadCertificate(item)}
        disabled={!item.unlocked}
      >
        <MaterialCommunityIcons
          name={item.unlocked ? 'download' : 'lock'}
          size={24}
          color={item.unlocked ? '#2E8B57' : '#888'}
        />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  if (!gamificationData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Erro ao carregar conquistas.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Conquistas</Text>
      <Text style={styles.subtitle}>Conquistas</Text>
      <FlatList
        data={gamificationData.achievements}
        renderItem={renderAchievement}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
      <Text style={styles.subtitle}>Certificados</Text>
      <FlatList
        data={gamificationData.certificates}
        renderItem={renderCertificate}
        keyExtractor={(item) => item.level}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginVertical: 10,
  },
  list: {
    paddingBottom: 20,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  achievementStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  downloadButton: {
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
});

export default AchievementsScreen;