// app/(tabs)/index.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Share, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import Swiper from 'react-native-swiper';
import { useAuth } from '../../context/AuthContext';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface List {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}

export default function ListsScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const [lists, setLists] = useState<List[]>([
    { id: '1', title: 'Work', color: '#4A90E2', tasks: [
      { id: '1-1', title: 'Finish project report', completed: false },
      { id: '1-2', title: 'Team meeting', completed: true },
      { id: '1-3', title: 'Update documentation', completed: false },
    ] },
    { id: '2', title: 'Shopping', color: '#50C878', tasks: [
      { id: '2-1', title: 'Milk', completed: false },
      { id: '2-2', title: 'Eggs', completed: true },
      { id: '2-3', title: 'Bread', completed: false },
    ] },
    { id: '3', title: 'School', color: '#FF6B6B', tasks: [
      { id: '3-1', title: 'Study for exam', completed: false },
      { id: '3-2', title: 'Complete assignment', completed: false },
    ] },
  ]);
  const [activeListIndex, setActiveListIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4A90E2');
  const [editingList, setEditingList] = useState<List | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFD166', '#9D4EDD', '#FF9A76'];

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const createList = () => {
    if (!newListTitle.trim()) {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    const newList: List = {
      id: Date.now().toString(),
      title: newListTitle,
      color: selectedColor,
      tasks: [],
    };

    setLists([...lists, newList]);
    setNewListTitle('');
    setModalVisible(false);
  };

  const updateList = () => {
    if (!editingList || !newListTitle.trim()) return;

    setLists(lists.map(list => 
      list.id === editingList.id 
        ? { ...list, title: newListTitle, color: selectedColor }
        : list
    ));
    
    setEditingList(null);
    setNewListTitle('');
    setModalVisible(false);
  };

  const deleteList = (listId: string) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const currentIndex = lists.findIndex(list => list.id === listId);
            const newLists = lists.filter(list => list.id !== listId);
            
            // Calculate new index before setting state
            let newIndex = activeListIndex;
            if (currentIndex === activeListIndex) {
              // If we deleted the active list, move to previous or first
              newIndex = Math.max(0, activeListIndex - 1);
            } else if (currentIndex < activeListIndex) {
              // If we deleted a list before active, shift index down
              newIndex = activeListIndex - 1;
            }
            
            setLists(newLists);
            setActiveListIndex(newIndex);
          }
        },
      ]
    );
  };

  const addTask = (listId: string) => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: `${listId}-${Date.now()}`,
      title: newTaskText,
      completed: false,
    };

    setLists(lists.map(list => 
      list.id === listId 
        ? { ...list, tasks: [...list.tasks, newTask] }
        : list
    ));
    
    setNewTaskText('');
  };

  const toggleTask = (listId: string, taskId: string) => {
    setLists(lists.map(list => 
      list.id === listId 
        ? { 
            ...list, 
            tasks: list.tasks.map(task => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : list
    ));
  };

  const deleteTask = (listId: string, taskId: string) => {
    setLists(lists.map(list => 
      list.id === listId 
        ? { ...list, tasks: list.tasks.filter(task => task.id !== taskId) }
        : list
    ));
  };

  const shareList = async (list: List) => {
    try {
      const listContent = `List: ${list.title}\n\nTasks:\n${list.tasks.map(task => `- ${task.title} ${task.completed ? '✓' : ''}`).join('\n')}`;
      
      await Share.share({
        message: listContent,
        title: `Share: ${list.title}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share list');
    }
  };

  const renderListHeader = (list: List | undefined) => {
    if (!list) return null;
    return (
      <View style={[styles.listHeader, { backgroundColor: list.color }]}>
        <ThemedText style={styles.listTitle}>{list.title}</ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => {
            setEditingList(list);
            setNewListTitle(list.title);
            setSelectedColor(list.color);
            setModalVisible(true);
          }}>
            <IconSymbol name="pencil" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteList(list.id)}>
            <IconSymbol name="trash" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTaskItem = (list: List, task: Task) => (
    <TouchableOpacity onPress={() => toggleTask(list.id, task.id)}>
      <ThemedView style={styles.taskItem}>
        <IconSymbol 
          name={task.completed ? 'checkmark.circle.fill' : 'circle'} 
          size={20} 
          color={task.completed ? '#4CAF50' : '#666'}
        />
        <ThemedText style={[styles.taskText, task.completed && styles.completedTask]}>
          {task.title}
        </ThemedText>
        <TouchableOpacity onPress={() => deleteTask(list.id, task.id)}>
          <IconSymbol name="xmark.circle" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  const renderList = (list: List) => (
    <View style={styles.listContainer} key={list.id}>
      <FlatList
        data={list.tasks}
        renderItem={({ item }) => renderTaskItem(list, item)}
        keyExtractor={item => item.id}
        style={styles.taskList}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No tasks in this list yet</ThemedText>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            <View style={styles.addTaskContainer}>
              <TextInput
                style={styles.taskInput}
                placeholder="Add a new task..."
                value={newTaskText}
                onChangeText={setNewTaskText}
                onSubmitEditing={() => addTask(list.id)}
              />
              <TouchableOpacity 
                style={styles.addTaskButton}
                onPress={() => addTask(list.id)}
              >
                <IconSymbol name="plus.circle.fill" size={24} color={list.color} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => shareList(list)} style={[styles.shareButtonFooter, { backgroundColor: list.color }]}>
              <IconSymbol name="square.and.arrow.up" size={20} color="#FFF" />
              <ThemedText style={styles.shareButtonText}>Share List</ThemedText>
            </TouchableOpacity>
            <View style={styles.listActionsContainer}>
              <TouchableOpacity 
                style={[styles.listActionButton, { backgroundColor: '#50C878' }]}
                onPress={() => {
                  setEditingList(null);
                  setNewListTitle('');
                  setSelectedColor('#4A90E2');
                  setModalVisible(true);
                }}
              >
                <IconSymbol name="plus.circle.fill" size={18} color="#FFF" />
                <ThemedText style={styles.listActionText}>Add List</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.listActionButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => deleteList(list.id)}
              >
                <IconSymbol name="trash" size={18} color="#FFF" />
                <ThemedText style={styles.listActionText}>Delete List</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        }
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerWrapper}>
        {lists.length > 0 && activeListIndex < lists.length ? renderListHeader(lists[activeListIndex]) : (
          <View style={[styles.listHeader, { backgroundColor: '#4A90E2' }]}>
            <ThemedText style={styles.listTitle}>My Lists</ThemedText>
          </View>
        )}
      </View>
      <View style={styles.swiperWrapper}>
        <Swiper
          showsButtons={false}
          showsPagination={true}
          loop={false}
          index={activeListIndex}
          onIndexChanged={setActiveListIndex}
        >
          {lists.map(list => renderList(list))}
        </Swiper>
      </View>

      <TouchableOpacity 
        style={[styles.addListButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 60 }]}
        onPress={() => {
          setEditingList(null);
          setNewListTitle('');
          setSelectedColor('#4A90E2');
          setModalVisible(true);
        }}
      >
        <IconSymbol name="plus.circle.fill" size={60} color={Colors[colorScheme ?? 'light'].tint} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title">
              {editingList ? 'Edit List' : 'Create New List'}
            </ThemedText>
            
            <TextInput
              style={[styles.input, { 
                color: isDarkMode ? '#ECEDEE' : '#11181C',
                backgroundColor: isDarkMode ? '#1F1F1F' : '#fff',
                borderColor: isDarkMode ? '#333' : '#ddd'
              }]}
              placeholder="List name"
              placeholderTextColor={isDarkMode ? '#999' : '#999'}
              value={newListTitle}
              onChangeText={setNewListTitle}
              autoFocus
            />

            <ThemedText style={styles.colorLabel}>Choose a color:</ThemedText>
            <View style={styles.colorGrid}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: selectedColor }]}
                onPress={editingList ? updateList : createList}
              >
                <ThemedText style={styles.saveButtonText}>
                  {editingList ? 'Update' : 'Create'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  headerWrapper: {
    backgroundColor: '#f0f0f0',
  },
  swiperWrapper: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 10,
  },
  shareButton: {
    padding: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 20,
  },
  taskList: {
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
  addTaskContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    alignItems: 'center',
  },
  taskInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: '#11181C',
  },
  addTaskButton: {
    padding: 5,
  },
  footerContainer: {
    gap: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  shareButtonFooter: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  listActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  listActionButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addListButtonFooter: {
    // color set dynamically
  },
  deleteListButtonFooter: {
    // color set dynamically
  },
  listActionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  addListButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 15,
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
    fontSize: 16,
  },
});