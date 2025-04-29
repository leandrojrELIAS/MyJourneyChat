import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { auth } from '../services/firebaseConfig';

// Definição dos tipos para a navegação
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Cadastro: undefined;
  Choice: undefined;
  Mensagens: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [isResetModalVisible, setResetModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animação de fade-in para a tela
  const slideAnim = useRef(new Animated.Value(50)).current; // Animação de deslize para a tela
  const modalAnim = useRef(new Animated.Value(0)).current; // Animação de fade-in para o modal

  useEffect(() => {
    // Animações de fade-in e deslize para a tela principal
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      await AsyncStorage.setItem('isLoggedIn', 'true');
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Login bem-sucedido!',
      });
      navigation.replace('Choice');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao fazer login',
        text2: error.message,
      });
    }
  };

  const openResetModal = () => {
    setResetModalVisible(true);
    setResetEmail(email); // Preenche o campo com o e-mail já digitado
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeResetModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setResetModalVisible(false);
      setResetEmail('');
    });
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, digite um e-mail válido.',
      });
      return;
    }

    try {
      await auth.sendPasswordResetEmail(resetEmail);
      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'E-mail de redefinição enviado! Verifique sua caixa de entrada.',
      });
      closeResetModal();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: `Erro ao enviar e-mail: ${error.message}`,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View
        style={[styles.innerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
      >
        {/* Título "Login" */}
        <Text style={styles.title}>Login</Text>

        {/* Campo E-mail */}
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Campo Senha */}
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Link "Esqueci minha senha" */}
        <TouchableOpacity onPress={openResetModal}>
          <Text style={styles.forgotPassword}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Botão Entrar */}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Mensagem */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* Imagem de fundo */}
        <Image
          source={require('../../assets/menina_entrar.png')} // Certifique-se de que o caminho está correto
          style={styles.image}
        />
      </Animated.View>

      {/* Modal de Redefinição de Senha */}
      <Modal
        transparent={true}
        visible={isResetModalVisible}
        animationType="none"
        onRequestClose={closeResetModal}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: modalAnim }]}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Recuperar Senha</Text>
            <Text style={styles.modalSubtitle}>
              Digite o e-mail associado à sua conta para receber um link de redefinição.
            </Text>

            {/* Campo de E-mail no Modal */}
            <TextInput
              style={styles.modalInput}
              placeholder="E-mail"
              placeholderTextColor="#888"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Botões do Modal */}
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButtonCancel} onPress={closeResetModal}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButtonSend} onPress={handleForgotPassword}>
                <Text style={styles.modalButtonText}>Enviar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dcdcdc',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 80,
  },
  input: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    color: '#0000FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  loginButton: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#32CD32',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 30,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  image: {
    width: 190,
    height: 190,
    resizeMode: 'contain',
    marginTop: 50,
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    width: '100%',
    minHeight: 48,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    fontSize: 18,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButtonCancel: {
    flex: 1,
    backgroundColor: '#FF4040',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonSend: {
    flex: 1,
    backgroundColor: '#32CD32',
    borderRadius: 10,
    padding: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;