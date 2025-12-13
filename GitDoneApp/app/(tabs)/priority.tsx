import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { List, Task, useLists } from '../../context/ListsContext';

/** Screen displaying high-priority tasks from all lists */
export default function PriorityScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const headerColor = isDarkMode ? '#7B3FF2' : '#9D4EDD';
  const { lists, setLists } = useLists();
  const [selectedTask, setSelectedTask] = useState<(Task & { listId: string; listTitle: string }) | null>(null);
  
  /** Filters and collects all high-priority tasks from all lists */
  const priorityTasks = useMemo(() => {
    const tasks: (Task & { listId: string; listTitle: string })[] = [];
    lists.forEach(list => {
      list.tasks.forEach(task => {
        if (task.priority === 'high') {
          tasks.push({
            ...task,
            listId: list.id,
            listTitle: list.title,
          });
        }
      });
    });
    return tasks;
  }, [lists]);

  /** Toggles task completion status */
  const toggleTask = (listId: string, taskId: string) => {
    setLists(lists.map((list: List) => 
      list.id === listId
        ? {
            ...list,
            tasks: list.tasks.map((task: Task) => 
              task.id === taskId ? { ...task, completed: !task.completed } : task
            )
          }
        : list
    ));
  };

  /** Deletes a task with confirmation */
  const deleteTask = (listId: string, taskId: string) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            setLists(lists.map((list: List) => 
              list.id === listId
                ? { ...list, tasks: list.tasks.filter((task: Task) => task.id !== taskId) }
                : list
            ));
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Task & { listId: string; listTitle: string } }) => (
    <TouchableOpacity onPress={() => setSelectedTask(item)}>
      <ThemedView style={styles.taskItem}>
        <View style={[styles.priorityIndicator, { backgroundColor: '#FF6B6B' }]} />
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <IconSymbol 
              name={item.completed ? 'checkmark.circle.fill' : 'circle'} 
              size={20} 
              color={item.completed ? '#4CAF50' : '#666'} 
            />
            <ThemedText style={[styles.taskText, item.completed && styles.completedTask]}>
              {item.title}
            </ThemedText>
          </View>
          <ThemedText style={styles.listNameSmall}>From: {item.listTitle}</ThemedText>
          {item.dueDate && (
            <ThemedText style={styles.dueDate}>
              Due: {item.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </ThemedText>
          )}
          {item.recurring !== 'none' && (
            <ThemedText style={styles.recurringLabel}>
              Repeats: {item.recurring}{item.recurringTime ? ` at ${item.recurringTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <ThemedText style={styles.headerTitle}>Priority Tasks</ThemedText>
      </View>
      <FlatList
        data={priorityTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No priority tasks yet</ThemedText>
        }
      />
      <Modal
        visible={selectedTask !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.taskActionModal}>
            <ThemedText style={styles.taskActionTitle}>{selectedTask?.title}</ThemedText>
            
            <TouchableOpacity 
              style={[styles.taskActionButton, { backgroundColor: '#4A90E2' }]}
              onPress={() => {
                if (selectedTask) {
                  toggleTask(selectedTask.listId, selectedTask.id);
                  setSelectedTask(null);
                }
              }}
            >
              <IconSymbol 
                name={selectedTask?.completed ? 'checkmark.circle.fill' : 'circle'} 
                size={24} 
                color="#FFF" 
              />
              <ThemedText style={styles.taskActionButtonText}>
                {selectedTask?.completed ? 'Mark Incomplete' : 'Mark Complete'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.taskActionButton, { backgroundColor: '#FF6B6B' }]}
              onPress={() => {
                if (selectedTask) {
                  Alert.alert(
                    'Delete Task',
                    'Are you sure you want to delete this task?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => {
                          deleteTask(selectedTask.listId, selectedTask.id);
                          setSelectedTask(null);
                        }
                      },
                    ]
                  );
                }
              }}
            >
              <IconSymbol name="trash.fill" size={24} color="#FFF" />
              <ThemedText style={styles.taskActionButtonText}>Delete Task</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.taskActionButton, { backgroundColor: '#999' }]}
              onPress={() => setSelectedTask(null)}
            >
              <ThemedText style={styles.taskActionButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
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
  priorityIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskText: {
    fontSize: 16,
    flex: 1,
  },
  listName: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  listNameSmall: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  recurringLabel: {
    fontSize: 11,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  taskActionModal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  taskActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  taskActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  taskActionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});