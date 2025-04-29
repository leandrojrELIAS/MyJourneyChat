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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';
import { auth, db } from '../services/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

// Definição dos tipos para a navegação
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Cadastro: undefined;
  Choice: undefined;
  Mensagens: undefined;
};

type CadastroScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Cadastro'>;

const CadastroScreen = () => {
  const navigation = useNavigation<CadastroScreenNavigationProp>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current; // Animação de fade-in
  const slideAnim = useRef(new Animated.Value(50)).current; // Animação de deslize

  useEffect(() => {
    // Animações de fade-in e deslize
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleCadastro = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Por favor, preencha todos os campos.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'As senhas não coincidem.',
      });
      return;
    }

    try {
      // Passo 1: Criar usuário no Firebase Auth
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (!user) {
        throw new Error('Erro ao criar usuário: usuário não retornado pelo Firebase Auth.');
      }
      console.log('Usuário criado no Firebase Auth:', user.uid);

      // Passo 2: Atualizar o nome do usuário
      await user.updateProfile({ displayName: name });
      console.log('Nome do usuário atualizado:', name);

      // Passo 3: Salvar informações adicionais no Firestore
      await setDoc(doc(collection(db, 'users'), user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
      });
      console.log('Dados salvos no Firestore para o usuário:', user.uid);

      // Passo 4: Enviar mensagem ao Telegram usando fetch
      const telegramBotToken = '8178497791:AAE6Ka21h0jIldE0ROsN-tGx7Ias8QqcCh0';
      const telegramChatId = '798079047';
      const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
      const telegramMessage = `Novo usuário cadastrado: ${name} (${email}) em ${new Date().toLocaleString()}`;

      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: telegramMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem ao Telegram. Status: ' + response.status);
      }

      const responseData = await response.json();
      if (!responseData.ok) {
        throw new Error('Erro na resposta do Telegram: ' + responseData.description);
      }

      console.log('Mensagem enviada ao Telegram');

      // Passo 5: Salvar estado de login
      await AsyncStorage.setItem('isLoggedIn', 'true');
      console.log('Estado de login salvo no AsyncStorage');

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Cadastro realizado com sucesso!',
      });

      navigation.replace('Choice');
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      let errorMessage = 'Erro desconhecido ao cadastrar.';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este e-mail já está em uso. Tente outro e-mail.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'O e-mail fornecido é inválido.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('firestore')) {
        errorMessage = 'Erro ao salvar os dados no Firestore. Verifique as permissões.';
      } else if (error.message.includes('Telegram')) {
        errorMessage = 'Erro ao enviar mensagem ao Telegram. Verifique o token e o chat ID.';
      } else {
        errorMessage = error.message || 'Erro ao cadastrar. Tente novamente.';
      }

      Toast.show({
        type: 'error',
        text1: 'Erro ao cadastrar',
        text2: errorMessage,
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
        {/* Frase de boas-vindas */}
        <Text style={styles.welcomeText}>
          Seja muito bem-vindo! Estamos felizes em ter você aqui e prontos para te apoiar no cuidado com sua saúde mental.
        </Text>

        {/* Título "Criar" */}
        <Text style={styles.title}>Criar</Text>

        {/* Campo Nome */}
        <TextInput
          style={styles.input}
          placeholder="Nome"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

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

        {/* Campo Confirmar Senha */}
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          placeholderTextColor="#888"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Botão Criar */}
        <TouchableOpacity style={styles.createButton} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Criar</Text>
        </TouchableOpacity>

        {/* Mensagem */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* Imagem de fundo */}
        <Image
          source={require('../../assets/menina_criar.png')}
          style={styles.image}
        />
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEFA',
  },
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  welcomeText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FA8072',
    marginBottom: 40,
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
  createButton: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#FF4040',
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
    fontSize: 22,
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
});

export default CadastroScreen;