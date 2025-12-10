// app/(tabs)/priority.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

interface PriorityTask {
  id: string;
  title: string;
  completed: boolean;
}

export default function PriorityScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const headerColor = isDarkMode ? '#7B3FF2' : '#9D4EDD';
  
  const [tasks, setTasks] = useState<PriorityTask[]>([
    { id: '1', title: 'Finish project', completed: false },
    { id: '2', title: 'Buy groceries', completed: false },
    { id: '3', title: 'Call mom', completed: false },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setTasks(tasks.filter(task => task.id !== id));
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: PriorityTask }) => (
    <TouchableOpacity onPress={() => toggleTask(item.id)}>
      <ThemedView style={styles.taskItem}>
        <IconSymbol 
          name={item.completed ? 'checkmark.circle.fill' : 'circle'} 
          size={24} 
          color={item.completed ? '#4CAF50' : '#666'} 
        />
        <ThemedText style={[styles.taskText, item.completed && styles.completedTask]}>
          {item.title}
        </ThemedText>
        <TouchableOpacity onPress={() => deleteTask(item.id)}>
          <IconSymbol name="trash" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <ThemedText style={styles.headerTitle}>Priority Tasks</ThemedText>
      </View>
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No priority tasks yet</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
  },
  list: {
    flex: 1,
    padding: 20,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    gap: 12,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});