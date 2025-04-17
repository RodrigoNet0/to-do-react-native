import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import LoginScreen from './LoginScreen';
import TodoListScreen from './TodoListScreen';

export default function App() {
  const [username, setUsername] = useState(null);

  // Detecta o tema do sistema
  const isDarkMode = Appearance.getColorScheme() === 'dark';
  const theme = isDarkMode ? MD3DarkTheme : MD3LightTheme;

  // Carrega usuário salvo
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = await AsyncStorage.getItem('@user');
      if (storedUser) {
        setUsername(storedUser);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    setUsername(null); // Remove o usuário
  };

  return (
    <PaperProvider theme={theme}>
      {username ? (
        <TodoListScreen username={username} onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={setUsername} />
      )}
    </PaperProvider>
  );
}
