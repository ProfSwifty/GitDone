import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Redirect } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Button,
  FlatList,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase.config';

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type ListItem = {
  id: string;
  name: string;
  color: string;
};

const listColors = ['#22C55E', '#3B82F6', '#EAB308', '#EF4444', '#A855F7'];

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const [listModalVisible, setListModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setLists([]);
      setActiveListId(null);
      return;
    }

    const listsRef = collection(db, 'users', user.uid, 'lists');
    const qLists = query(listsRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(qLists, snapshot => {
      const data: ListItem[] = snapshot.docs.map(d => ({
        id: d.id,
        name: (d.data().name as string) || '',
        color: (d.data().color as string) || '#22C55E',
      }));
      setLists(data);
      if (!activeListId && data.length > 0) {
        setActiveListId(data[0].id);
      }
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
  if (!user || !activeListId) {
    setTasks([]);
    setLoading(false);
    return;
  }

  setLoading(true);
  const tasksRef = collection(db, 'users', user.uid, 'tasks');
  const qTasks = query(tasksRef, where('listId', '==', activeListId));

  const unsubscribe = onSnapshot(qTasks, snapshot => {
    const list: Task[] = snapshot.docs.map(d => ({
      id: d.id,
      text: (d.data().text as string) || '',
      completed: !!d.data().completed,
    }));
    setTasks(list);
    setLoading(false);
  });

  return unsubscribe;
}, [user, activeListId]);


  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  const handleAddList = async () => {
    if (!user) return;
    const name = newListName.trim();
    if (!name || !newListColor) return;

    const listsRef = collection(db, 'users', user.uid, 'lists');
    const docRef = await addDoc(listsRef, {
      name,
      color: newListColor,
      createdAt: serverTimestamp(),
    });

    setNewListName('');
    setNewListColor('');
    setListModalVisible(false);
    setActiveListId(docRef.id);
  };

  const handleAddTask = async () => {
    const trimmed = newTask.trim();
    if (!trimmed || !user || !activeListId) return;

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    await addDoc(tasksRef, {
      text: trimmed,
      completed: false,
      listId: activeListId,
      createdAt: serverTimestamp(),
    });
    setNewTask('');
  };

  const handleToggleTask = async (task: Task) => {
    if (!user || !activeListId) return;
    const ref = doc(db, 'users', user.uid, 'tasks', task.id);
    await updateDoc(ref, { completed: !task.completed });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !activeListId) return;
    const ref = doc(db, 'users', user.uid, 'tasks', taskId);
    await deleteDoc(ref);
  };

  const openMenu = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
  };

  const closeEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  const handleSaveEdit = async () => {
    if (!user || !editingTaskId || !activeListId) {
      closeEdit();
      return;
    }
    const trimmed = editText.trim();
    if (!trimmed) {
      closeEdit();
      return;
    }
    const ref = doc(db, 'users', user.uid, 'tasks', editingTaskId);
    await updateDoc(ref, { text: trimmed });
    closeEdit();
  };

  const handleDeleteCurrent = async () => {
    if (!editingTaskId) {
      closeEdit();
      return;
    }
    await handleDeleteTask(editingTaskId);
    closeEdit();
  };

  const renderTask = ({ item }: { item: Task }) => {
    return (
      <View style={styles.taskRow}>
        <TouchableOpacity
          style={styles.circleWrapper}
          onPress={() => handleToggleTask(item)}
        >
          <View
            style={[
              styles.circle,
              item.completed ? styles.circleCompleted : null,
            ]}
          >
            {item.completed && <View style={styles.circleInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskTextWrapper}
          onPress={() => handleToggleTask(item)}
        >
          <ThemedText
            style={[
              styles.taskText,
              item.completed ? styles.taskTextCompleted : null,
            ]}
            numberOfLines={2}
          >
            {item.text}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => openMenu(item)}>
          <ThemedText style={styles.menuDots}>⋯</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  const renderListChip = ({ item }: { item: ListItem }) => {
    const isActive = item.id === activeListId;
    return (
      <TouchableOpacity
        style={[
          styles.listChip,
          {
            borderColor: item.color,
            backgroundColor: isActive ? item.color : '#111827',
          },
        ]}
        onPress={() => setActiveListId(item.id)}
      >
        <ThemedText style={styles.listChipText}>{item.name}</ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <ThemedText type="title">GitDone</ThemedText>
          <ThemedText>{user.email}</ThemedText>
        </View>
        <Button title="Logout" onPress={logout} />
      </View>

      <View style={styles.listsRow}>
        <FlatList
          data={lists}
          keyExtractor={item => item.id}
          renderItem={renderListChip}
          horizontal
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.newListChip}
              onPress={() => setListModalVisible(true)}
            >
              <ThemedText style={styles.newListChipText}>+ New List</ThemedText>
            </TouchableOpacity>
          }
        />
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder={
            activeListId ? 'Add a task...' : 'Create a list first...'
          }
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={handleAddTask}
          editable={!!activeListId}
          returnKeyType="done"
        />
        <Button title="Add" onPress={handleAddTask} disabled={!activeListId} />
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loading} />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <ThemedText style={styles.emptyText}>
              {activeListId
                ? 'No tasks yet. Add your first task.'
                : 'Create a list to start adding tasks.'}
            </ThemedText>
          }
        />
      )}

      <Modal visible={editingTaskId !== null} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Task options</ThemedText>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={closeEdit} />
              <Button title="Delete" onPress={handleDeleteCurrent} />
              <Button title="Save" onPress={handleSaveEdit} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={listModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>New list</ThemedText>
            <TextInput
              style={styles.modalInput}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name"
            />
            <View style={styles.colorRow}>
              {listColors.map(color => {
                const selected = newListColor === color;
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorCircle,
                      { backgroundColor: color },
                      selected ? styles.colorCircleSelected : null,
                    ]}
                    onPress={() => setNewListColor(color)}
                  />
                );
              })}
            </View>
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setListModalVisible(false);
                  setNewListName('');
                  setNewListColor('');
                }}
              />
              <Button title="Create" onPress={handleAddList} />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listsRow: {
    height: 48,
    marginBottom: 16,
  },
  listChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  listChipText: {
    color: '#F9FAFB',
    fontSize: 14,
  },
  newListChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4B5563',
    justifyContent: 'center',
    marginRight: 4,
  },
  newListChipText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#111827',
    color: '#F9FAFB',
  },
  loading: {
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 40,
  },
  emptyText: {
    marginTop: 24,
    textAlign: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#1F2933',
    borderRadius: 10,
    marginBottom: 8,
  },
  circleWrapper: {
    paddingRight: 8,
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    borderColor: '#22C55E',
  },
  circleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
  },
  taskTextWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  taskText: {
    fontSize: 16,
    color: '#F9FAFB',
  },
  taskTextCompleted: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  menuButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  menuDots: {
    fontSize: 22,
    color: '#9CA3AF',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#020617',
    color: '#F9FAFB',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: '#F9FAFB',
  },
});
