import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { GamificationData, getGamificationData, visitScreen, getCertificateImage } from '../screens/GamificationManager';

const AchievementsScreen = () => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        await visitScreen('Achievements');
        const data = await getGamificationData();
        setGamificationData(data);
      } catch (error) {
        console.error('Erro ao carregar dados de gamificação:', error);
        Alert.alert('Erro', 'Não foi possível carregar as conquistas. Tente novamente mais tarde.');
        setGamificationData(null); // Garantir que o estado seja atualizado
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const downloadCertificate = async (certificate: { level: string; unlocked: boolean }) => {
    try {
      const image = getCertificateImage(certificate.level);
      const uri = Image.resolveAssetSource(image).uri;
      const fileUri = `${FileSystem.documentDirectory}certificado_${certificate.level}.png`;
      
      await FileSystem.downloadAsync(uri, fileUri);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Salvar ou compartilhar o certificado',
        });
      } else {
        Alert.alert('Sucesso', `Certificado salvo em ${fileUri}`);
      }
    } catch (error) {
      console.error('Erro ao baixar o certificado:', error);
      Alert.alert('Erro', 'Não foi possível baixar o certificado.');
    }
  };

  const renderAchievementItem = ({ item }: { item: { id: string; name: string; description: string; achieved: boolean; progress: { current: number; target: number } } }) => (
    <View style={[styles.achievementItem, item.achieved ? styles.achieved : styles.notAchieved]}>
      <View style={styles.achievementHeader}>
        <Text style={styles.achievementName}>{item.name}</Text>
        {item.achieved && (
          <MaterialCommunityIcons name="crown" size={24} color="#FFD700" style={styles.crownIcon} />
        )}
      </View>
      <Text style={styles.achievementDescription}>{item.description}</Text>
      <Text style={styles.progressText}>
        Progresso: {item.progress.current}/{item.progress.target}
      </Text>
      <Text style={styles.achievementStatus}>{item.achieved ? 'Desbloqueada!' : 'Não desbloqueada'}</Text>
    </View>
  );

  const renderCertificateItem = ({ item }: { item: { level: string; unlocked: boolean } }) => (
    <View style={styles.certificateItem}>
      <Text style={styles.certificateTitle}>
        Certificado {item.level === 'bronze' ? 'Bronze' : item.level === 'silver' ? 'Prata' : 'Ouro'}
      </Text>
      {item.unlocked ? (
        <>
          <Image source={getCertificateImage(item.level)} style={styles.certificateImage} />
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => downloadCertificate(item)}
          >
            <Text style={styles.downloadButtonText}>Baixar Certificado</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.lockedText}>Bloqueado</Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Carregando...</Text>
      </View>
    );
  }

  if (!gamificationData) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Erro ao carregar conquistas</Text>
        <Text style={styles.errorText}>Ocorreu um erro ao carregar as conquistas. Tente novamente mais tarde.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conquistas</Text>
      <Text style={styles.points}>Pontos: {gamificationData.points}</Text>
      
      <Text style={styles.sectionTitle}>Suas Conquistas</Text>
      <FlatList
        data={gamificationData.achievements}
        renderItem={renderAchievementItem}
        keyExtractor={(item) => item.id}
        style={styles.achievementList}
      />

      <Text style={styles.sectionTitle}>Certificados</Text>
      <FlatList
        data={gamificationData.certificates}
        renderItem={renderCertificateItem}
        keyExtractor={(item) => item.level}
        style={styles.certificateList}
      />
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
  points: {
    fontSize: 20,
    color: '#333',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    marginTop: 10,
  },
  achievementList: {
    width: '100%',
    marginBottom: 20,
  },
  achievementItem: {
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  achieved: {
    backgroundColor: '#B5EAD7', // Verde pastel para conquistas desbloqueadas
  },
  notAchieved: {
    backgroundColor: '#ffffff', // Branco para conquistas não desbloqueadas
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  crownIcon: {
    marginLeft: 10,
  },
  achievementDescription: {
    fontSize:

 14,
    color: '#666',
  },
  progressText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  achievementStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  certificateList: {
    width: '100%',
  },
  certificateItem: {
    alignItems: 'center',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  certificateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  certificateImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  downloadButton: {
    backgroundColor: '#32CD32',
    borderRadius: 10,
    padding: 10,
  },
  downloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  lockedText: {
    fontSize: 16,
    color: '#666',
  },
});

export default AchievementsScreen;