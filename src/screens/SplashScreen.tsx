import React, { useRef } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Definição dos tipos para a navegação
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Cadastro: undefined;
  Choice: undefined;
  Mensagens: undefined;
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

const SplashScreen = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animação de fade-in

  // Removemos o useEffect com setTimeout para evitar redirecionamento automático
  // A navegação será controlada pelos botões

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

      {/* Botão Entrar */}
      <View style={styles.buttonContainer}>
        <Image
          source={require('../../assets/menina_entrar.png')} // Certifique-se de que o caminho está correto
          style={styles.buttonImage}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#32CD32' }]} // Verde
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>

      {/* Botão Criar */}
      <View style={[styles.buttonContainer, styles.buttonContainerBottom]}>
        <Image
          source={require('../../assets/menina_criar.png')} // Certifique-se de que o caminho está correto
          style={styles.buttonImage}
        />
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#FF4040' }]} // Vermelho
          onPress={() => navigation.navigate('Cadastro')}
        >
          <Text style={styles.buttonText}>Criar</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -460,
  },
  buttonContainerBottom: {
    position: 'absolute',
    bottom: 120,
  },
  buttonImage: {
    width: 140,
    height: 180,
    resizeMode: 'contain',
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
    elevation: 5, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
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

export default SplashScreen;