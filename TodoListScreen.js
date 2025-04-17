import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Text,
  TextInput,
  Button,
  List,
  Checkbox,
  IconButton,
  useTheme,
  Divider,
  Menu,
  Provider,
  Appbar,
} from 'react-native-paper';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function TodoListScreen({ username, onLogout }) {
  const [task, setTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [visible, setVisible] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    loadTasks();
    registerForPushNotificationsAsync();
  }, []);

  const loadTasks = async () => {
    const data = await AsyncStorage.getItem('@taskList');
    if (data) setTaskList(JSON.parse(data));
  };

  const saveTasks = async (tasks) => {
    await AsyncStorage.setItem('@taskList', JSON.stringify(tasks));
  };

  const addTask = async () => {
    if (!task) return;

    const newTask = {
      id: Date.now().toString(),
      title: task,
      completed: false,
      date: date.toLocaleString(),
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = [...taskList, newTask];
    setTaskList(updated);
    await saveTasks(updated);
    setTask('');
    scheduleNotification(newTask.title, newTask.date);
  };

  const toggleTask = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = taskList.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTaskList(updated);
    saveTasks(updated);
  };

  const removeTask = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const updated = taskList.filter((t) => t.id !== id);
    setTaskList(updated);
    saveTasks(updated);
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowPicker(false);
    setDate(currentDate);
  };

  const scheduleNotification = async (title, dateString) => {
    const dateObj = new Date(dateString);
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📌 Lembrete de Tarefa',
        body: title,
      },
      trigger: dateObj,
    });
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@user'); // Limpa o usuário armazenado
    onLogout(); // Chama a função passada por props para atualizar o estado no App.js
  };

  return (
    <Provider>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.Content title={`Olá, ${username} 👋`} />
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={<IconButton icon="menu" onPress={() => setVisible(true)} />}
          >
            <Menu.Item onPress={logout} title="Logout" />
          </Menu>
        </Appbar.Header>

        <TextInput
          label="Digite a tarefa"
          value={task}
          onChangeText={setTask}
          mode="outlined"
          style={styles.input}
        />

        <Button
          icon="calendar-clock"
          mode="outlined"
          onPress={() => setShowPicker(true)}
          style={styles.dateButton}
        >
          Escolher Data e Hora
        </Button>

        <Text style={styles.dateText}>🕒 {date.toLocaleString()}</Text>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            is24Hour={true}
            onChange={onChangeDate}
          />
        )}

        <Button
          icon="plus"
          mode="contained"
          onPress={addTask}
          style={styles.addButton}
        >
          Adicionar tarefa
        </Button>

        <Divider style={{ marginVertical: 12 }} />

        <FlatList
          data={taskList}
          keyExtractor={(item) => item.id}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <List.Item
              title={item.title}
              titleStyle={item.completed ? { textDecorationLine: 'line-through', opacity: 0.5 } : {}}
              description={`Para: ${item.date}`}
              left={() => (
                <Checkbox
                  status={item.completed ? 'checked' : 'unchecked'}
                  onPress={() => toggleTask(item.id)}
                />
              )}
              right={() => (
                <IconButton icon="delete" onPress={() => removeTask(item.id)} />
              )}
            />
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 20, opacity: 0.6 }}>
              Nenhuma tarefa ainda 📝
            </Text>
          }
        />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    marginBottom: 12,
  },
  dateButton: {
    marginBottom: 6,
  },
  dateText: {
    marginBottom: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  addButton: {
    marginBottom: 20,
  },
});

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    Alert.alert('Use um dispositivo físico para notificações');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert('Permissão para notificações não foi concedida');
    return;
  }
}
