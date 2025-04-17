import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const theme = useTheme();

  const handleLogin = async () => {
    if (!name) return;
    await AsyncStorage.setItem('@user', name);
    onLogin(name);
  };

  return (
    <View style={styles.outerContainer}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineMedium" style={styles.title}>
            Bem-vindo! 👋
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Digite seu nome para começar
          </Text>
          <TextInput
            label="Seu nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
          >
            Entrar
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f0f4f8',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
