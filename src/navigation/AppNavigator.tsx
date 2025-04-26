import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';
import ChoiceScreen from '../screens/ChoiceScreen';
import MoodDiaryScreen from '../screens/MoodDiaryScreen';
import RelaxScreen from '../screens/RelaxScreen';
import AchievementsScreen from '../screens/AchievementsScreen';

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

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Cadastro"
          component={CadastroScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Choice"
          component={ChoiceScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MoodDiary"
          component={MoodDiaryScreen}
          options={{ title: 'Diário de Humor' }}
        />
        <Stack.Screen
          name="Relax"
          component={RelaxScreen}
          options={{ title: 'Relaxamento' }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{ title: 'Conquistas' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;