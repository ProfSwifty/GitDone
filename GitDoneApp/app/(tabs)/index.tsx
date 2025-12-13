import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Platform, Share, StyleSheet, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';
import Swiper from 'react-native-swiper';
import { useAuth } from '../../context/AuthContext';
import { useLists } from '../../context/ListsContext';
import { cancelTaskReminder, formatReminderTime, rescheduleRecurringReminder, scheduleTaskReminder } from '../../utils/notifications';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdDate: Date;
  reminder?: Date;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurringTime?: Date;
}

interface List {
  id: string;
  title: string;
  color: string;
  tasks: Task[];
  isHome?: boolean;
}

/** Main lists screen with task and list management functionality */
export default function ListsScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { lists, setLists, activeListIndex, setActiveListIndex } = useLists();
  const [modalVisible, setModalVisible] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('#4A90E2');
  const [editingList, setEditingList] = useState<List | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskRecurring, setTaskRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [recurringTime, setRecurringTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminderDatePicker, setShowReminderDatePicker] = useState(false);
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [selectedTaskForAction, setSelectedTaskForAction] = useState<{ list: List; task: Task } | null>(null);
  const [homeListModalVisible, setHomeListModalVisible] = useState(false);

  const colors = ['#4A90E2', '#50C878', '#FF6B6B', '#FFD166', '#9D4EDD', '#FF9A76'];

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  /** Creates a new list with the entered title and color */
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
      isHome: lists.length === 0,
    };

    setLists([...lists, newList]);
    setNewListTitle('');
    setModalVisible(false);
  };

  /** Updates the currently edited list title and color */
  const updateList = () => {
    if (!editingList || !newListTitle.trim()) return;

    setLists(lists.map((list: List) => 
      list.id === editingList.id 
        ? { ...list, title: newListTitle, color: selectedColor }
        : list
    ));
    
    setEditingList(null);
    setNewListTitle('');
    setModalVisible(false);
  };

  /** Sets the specified list as the home list and moves it to the front */
  const setHomeList = (listId: string) => {
    const updatedLists = lists.map((list: List) => ({
      ...list,
      isHome: list.id === listId
    }));
    
    const homeListIndex = updatedLists.findIndex((list: List) => list.isHome);
    if (homeListIndex > 0) {
      const homeList = updatedLists.splice(homeListIndex, 1)[0];
      updatedLists.unshift(homeList);
    }
    
    setLists(updatedLists);
  };

  /** Deletes a list with confirmation alert after adjustment of active list index */
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
            const currentIndex = lists.findIndex((list: List) => list.id === listId);
            const newLists = lists.filter((list: List) => list.id !== listId);
            
            let newIndex = activeListIndex;
            if (currentIndex === activeListIndex) {
              newIndex = Math.max(0, activeListIndex - 1);
            } else if (currentIndex < activeListIndex) {
              newIndex = activeListIndex - 1;
            }
            
            setLists(newLists);
            setActiveListIndex(newIndex);
          }
        },
      ]
    );
  };

  /** Adds a new task to the active list and schedules reminder notification if set */
  const addTask = () => {
    const listId = lists[activeListIndex]?.id;
    if (!listId || !newTaskText.trim()) return;
    
    const newTask: Task = {
      id: `${listId}-${Date.now()}`,
      title: newTaskText,
      completed: false,
      priority: taskPriority,
      createdDate: new Date(),
      dueDate: selectedDate && selectedDate.getTime() !== new Date().getTime() ? selectedDate : undefined,
      reminder: reminderDate || undefined,
      recurring: taskRecurring,
      recurringTime: taskRecurring !== 'none' ? recurringTime : undefined,
    };

    if (reminderDate) {
      const notificationTime = new Date(reminderDate.getTime() - 30 * 60 * 1000);
      if (notificationTime > new Date(Date.now() + 60000)) {
        scheduleTaskReminder(newTask, notificationTime);
      }
    }

    setLists(lists.map((list: List) => 
      list.id === listId 
        ? { ...list, tasks: [...list.tasks, newTask].sort((a: Task, b: Task) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          })}
        : list
    ));
    
    setNewTaskText('');
    setTaskPriority('medium');
    setTaskRecurring('none');
    setSelectedDate(new Date());
    setRecurringTime(new Date());
    setReminderDate(null);
    setTaskModalVisible(false);
  };

  /** Updates the currently edited task and reschedules reminder notification if applicable */
  const updateTask = () => {
    const listId = lists[activeListIndex]?.id;
    if (!listId || !editingTask || !newTaskText.trim()) return;

    const updatedTask: Task = {
      ...editingTask,
      title: newTaskText,
      priority: taskPriority,
      dueDate: selectedDate && selectedDate.getTime() !== new Date().getTime() ? selectedDate : undefined,
      reminder: reminderDate || undefined,
      recurring: taskRecurring,
      recurringTime: taskRecurring !== 'none' ? recurringTime : undefined,
    };

    if (reminderDate) {
      const notificationTime = new Date(reminderDate.getTime() - 30 * 60 * 1000);
      if (notificationTime > new Date(Date.now() + 60000)) {
        scheduleTaskReminder(updatedTask, notificationTime);
      } else {
        cancelTaskReminder(editingTask.id);
      }
    } else {
      cancelTaskReminder(editingTask.id);
    }

    setLists(lists.map((list: List) => 
      list.id === listId 
        ? { 
            ...list, 
            tasks: list.tasks.map((task: Task) => 
              task.id === editingTask.id ? updatedTask : task
            ).sort((a: Task, b: Task) => {
              const priorityOrder = { high: 0, medium: 1, low: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            })
          }
        : list
    ));

    setEditingTask(null);
    setNewTaskText('');
    setTaskPriority('medium');
    setTaskRecurring('none');
    setSelectedDate(new Date());
    setRecurringTime(new Date());
    setReminderDate(null);
    setTaskModalVisible(false);
  };

  /** Toggles task completion status and reschedules recurring reminders if applicable */
  const toggleTask = (listId: string, taskId: string) => {
    const updatedLists = lists.map((list: List) => 
      list.id === listId 
        ? { 
            ...list, 
            tasks: list.tasks.map((task: Task) => {
              if (task.id === taskId) {
                const updatedTask = { ...task, completed: !task.completed };
                
                if (updatedTask.completed && task.recurring && task.recurring !== 'none' && task.reminder) {
                  rescheduleRecurringReminder(task);
                }
                
                return updatedTask;
              }
              return task;
            })
          }
        : list
    );
    setLists(updatedLists);
  };

  /** Deletes a task and cancels its notification */
  const deleteTask = (listId: string, taskId: string) => {
    cancelTaskReminder(taskId);
    
    setLists(lists.map((list: List) => 
      list.id === listId 
        ? { ...list, tasks: list.tasks.filter((task: Task) => task.id !== taskId) }
        : list
    ));
  };

  /** Returns color code for priority level */
  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD166';
      case 'low': return '#50C878';
      default: return '#999';
    }
  };

  /** Formats a date to locale string showing month, day, and year */
  const formatDate = (date: Date | undefined) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /** Shares list content via system share menu */
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

  /** Renders the header section with list title, home indicator, and home button */
  const renderListHeader = (list: List | undefined) => {
    if (!list) return null;
    return (
      <View style={[styles.listHeader, { backgroundColor: list.color }]}>
        <View style={styles.titleSection}>
          <ThemedText style={styles.listTitle}>{list.title}</ThemedText>
          {list.isHome && <ThemedText style={styles.homeLabel}>Home List</ThemedText>}
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setHomeListModalVisible(true)} style={styles.setHomeBtn}>
            <ThemedText style={styles.starEmoji}>{list.isHome ? '⭐' : '☆'}</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /** Renders individual task item with completion status, priority, due date, reminder, and action buttons */
  const renderTaskItem = (list: List, task: Task) => (
    <TouchableOpacity onPress={() => setSelectedTaskForAction({ list, task })}>
      <ThemedView style={styles.taskItem}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(task.priority) }]} />
        <View style={styles.taskContent}>
          <View style={styles.taskHeader}>
            <IconSymbol 
              name={task.completed ? 'checkmark.circle.fill' : 'circle'} 
              size={20} 
              color={task.completed ? '#4CAF50' : '#666'}
            />
            <ThemedText style={[styles.taskText, task.completed && styles.completedTask]}>
              {task.title}
            </ThemedText>
          </View>
          {task.dueDate && (
            <ThemedText style={styles.dueDate}>
              Due: {formatDate(task.dueDate)}
            </ThemedText>
          )}
          {task.reminder && (
            <ThemedText style={styles.reminderLabel}>
              🔔 Notification: {formatReminderTime(new Date(task.reminder.getTime() - 30 * 60 * 1000))}
            </ThemedText>
          )}
          {task.recurring !== 'none' && (
            <ThemedText style={styles.recurringLabel}>
              Repeats: {task.recurring}{task.recurringTime ? ` at ${task.recurringTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
            </ThemedText>
          )}
        </View>
        <TouchableOpacity onPress={() => {
          setEditingTask(task);
          setNewTaskText(task.title);
          setTaskPriority(task.priority);
          setTaskRecurring(task.recurring || 'none');
          setSelectedDate(task.dueDate || new Date());
          setRecurringTime(task.recurringTime || new Date());
          setReminderDate(task.reminder || null);
          setTaskModalVisible(true);
        }}>
          <IconSymbol name="pencil" size={18} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          Alert.alert(
            'Delete Task',
            'Are you sure you want to delete this task?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Delete', 
                style: 'destructive',
                onPress: () => deleteTask(list.id, task.id)
              },
            ]
          );
        }}>
          <IconSymbol name="xmark.circle" size={20} color="#FF6B6B" />
        </TouchableOpacity>
      </ThemedView>
    </TouchableOpacity>
  );

  /** Renders a complete list with task items, footer with action buttons */
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
            <TouchableOpacity 
              style={[styles.addTaskBtn, { backgroundColor: list.color }]}
              onPress={() => {
                setEditingTask(null);
                setNewTaskText('');
                setTaskPriority('medium');
                setTaskRecurring('none');
                setSelectedDate(new Date());
                setReminderDate(null);
                setShowReminderDatePicker(false);
                setShowReminderTimePicker(false);
                setTaskModalVisible(true);
              }}
            >
              <IconSymbol name="plus.circle.fill" size={24} color="#FFF" />
              <ThemedText style={styles.addTaskBtnText}>Add Task</ThemedText>
            </TouchableOpacity>
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
        {lists.length > 0 ? (
          <Swiper
            showsButtons={false}
            showsPagination={true}
            loop={false}
            index={activeListIndex}
            onIndexChanged={setActiveListIndex}
          >
            {lists.map((list: List) => renderList(list))}
          </Swiper>
        ) : (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No lists yet. Create one to get started!</ThemedText>
            <TouchableOpacity 
              style={[styles.addListBtnCenter, { backgroundColor: '#4A90E2' }]}
              onPress={() => {
                setEditingList(null);
                setNewListTitle('');
                setSelectedColor('#4A90E2');
                setModalVisible(true);
              }}
            >
              <IconSymbol name="plus" size={24} color="#FFF" />
              <ThemedText style={styles.addListBtnText}>Add List</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={() => setTaskModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedText type="title">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </ThemedText>
            
            <TextInput
              style={[styles.input, { 
                color: isDarkMode ? '#ECEDEE' : '#11181C',
                backgroundColor: isDarkMode ? '#1F1F1F' : '#fff',
                borderColor: isDarkMode ? '#333' : '#ddd'
              }]}
              placeholder="Task title"
              placeholderTextColor={isDarkMode ? '#999' : '#999'}
              value={newTaskText}
              onChangeText={setNewTaskText}
              autoFocus
            />

            <ThemedText style={styles.colorLabel}>Recurring:</ThemedText>
            <View style={styles.recurringRow}>
              {(['none', 'daily', 'weekly', 'monthly'] as const).map(r => (
                <TouchableOpacity
                  key={r}
                  style={[
                    styles.recurringBtn,
                    taskRecurring === r && styles.recurringBtnActive
                  ]}
                  onPress={() => setTaskRecurring(r)}
                >
                  <ThemedText style={[styles.recurringBtnText, taskRecurring === r && { fontWeight: 'bold' }]}>
                    {r === 'none' ? 'Once' : r}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {taskRecurring !== 'none' && (
              <>
                <ThemedText style={styles.colorLabel}>Recurring Time:</ThemedText>
                <TouchableOpacity 
                  style={[styles.dateBtn, { backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0' }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <IconSymbol name="clock" size={20} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
                  <ThemedText>{recurringTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</ThemedText>
                </TouchableOpacity>

                {showTimePicker && (
                  <DateTimePicker
                    value={recurringTime}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, time) => {
                      if (time) setRecurringTime(time);
                      setShowTimePicker(false);
                    }}
                  />
                )}
              </>
            )}

            <ThemedText style={styles.colorLabel}>Due Date:</ThemedText>
            <TouchableOpacity 
              style={[styles.dateBtn, { backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol name="calendar" size={20} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
              <ThemedText>{selectedDate.toLocaleDateString()}</ThemedText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (date) setSelectedDate(date);
                  setShowDatePicker(false);
                }}
              />
            )}

            <ThemedText style={styles.colorLabel}>Reminder (Optional):</ThemedText>
            <TouchableOpacity 
              style={[styles.dateBtn, { backgroundColor: isDarkMode ? '#1F1F1F' : '#f0f0f0' }]}
              onPress={() => setShowReminderDatePicker(true)}
            >
              <IconSymbol name="bell" size={20} color={isDarkMode ? '#ECEDEE' : '#11181C'} />
              <ThemedText>{reminderDate ? formatReminderTime(reminderDate) : 'Set Reminder'}</ThemedText>
            </TouchableOpacity>

            {showReminderDatePicker && (
              <DateTimePicker
                value={reminderDate || (() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  tomorrow.setHours(9, 0, 0, 0);
                  return tomorrow;
                })()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (date) {
                    const updatedDate = new Date(date);
                    updatedDate.setHours(9, 0, 0, 0);
                    setReminderDate(updatedDate);
                    setShowReminderTimePicker(true);
                  }
                  setShowReminderDatePicker(false);
                }}
              />
            )}

            {reminderDate && showReminderTimePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  if (date) {
                    // Create a new date combining the existing date with the new time
                    const newDate = new Date(reminderDate);
                    newDate.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
                    setReminderDate(newDate);
                  }
                  setShowReminderTimePicker(false);
                }}
              />
            )}

            {reminderDate && (
              <TouchableOpacity 
                style={[styles.clearReminderBtn, { borderColor: '#FF6B6B' }]}
                onPress={() => setReminderDate(null)}
              >
                <IconSymbol name="xmark.circle" size={16} color="#FF6B6B" />
                <ThemedText style={styles.clearReminderText}>Clear Reminder</ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setTaskModalVisible(false);
                  setEditingTask(null);
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: '#4A90E2' }]}
                onPress={editingTask ? updateTask : addTask}
              >
                <ThemedText style={styles.saveButtonText}>
                  {editingTask ? 'Update' : 'Add'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Task Action Modal */}
      {selectedTaskForAction && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedTaskForAction}
          onRequestClose={() => setSelectedTaskForAction(null)}
        >
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.taskActionModal}>
              <ThemedText type="title" style={styles.taskActionTitle}>
                {selectedTaskForAction.task.title}
              </ThemedText>
              
              <TouchableOpacity 
                style={[styles.taskActionButton, { backgroundColor: '#4A90E2' }]}
                onPress={() => {
                  toggleTask(selectedTaskForAction.list.id, selectedTaskForAction.task.id);
                  setSelectedTaskForAction(null);
                }}
              >
                <IconSymbol name={selectedTaskForAction.task.completed ? 'checkmark.circle.fill' : 'circle'} size={24} color="#FFF" />
                <ThemedText style={styles.taskActionButtonText}>
                  {selectedTaskForAction.task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.taskActionButton, { backgroundColor: '#9D4EDD' }]}
                onPress={() => {
                  const isAlreadyPriority = selectedTaskForAction.task.priority === 'high';
                  
                  setLists(lists.map((list: List): List => {
                    if (list.id === selectedTaskForAction.list.id) {
                      return { 
                        ...list, 
                        tasks: list.tasks.map((task: Task): Task => 
                          task.id === selectedTaskForAction.task.id 
                            ? { ...task, priority: isAlreadyPriority ? 'medium' : 'high' }
                            : task
                        ).sort((a: Task, b: Task) => {
                          const priorityOrder = { high: 0, medium: 1, low: 2 };
                          return priorityOrder[a.priority] - priorityOrder[b.priority];
                        })
                      };
                    }
                    return list;
                  }));
                  setSelectedTaskForAction(null);
                }}
              >
                <IconSymbol name="exclamationmark.circle.fill" size={24} color="#FFF" />
                <ThemedText style={styles.taskActionButtonText}>
                  {selectedTaskForAction.task.priority === 'high' ? 'Remove Priority' : 'Make Priority'}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.taskActionButton, { backgroundColor: '#FF6B6B' }]}
                onPress={() => {
                  Alert.alert(
                    'Delete Task',
                    'Are you sure you want to delete this task?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => {
                          deleteTask(selectedTaskForAction.list.id, selectedTaskForAction.task.id);
                          setSelectedTaskForAction(null);
                        }
                      },
                    ]
                  );
                }}
              >
                <IconSymbol name="trash.fill" size={24} color="#FFF" />
                <ThemedText style={styles.taskActionButtonText}>Delete Task</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.taskActionButton, { backgroundColor: '#999' }]}
                onPress={() => setSelectedTaskForAction(null)}
              >
                <ThemedText style={styles.taskActionButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </View>
        </Modal>
      )}

      {/* Home List Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={homeListModalVisible}
        onRequestClose={() => setHomeListModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.homeListModal}>
            <ThemedText type="title" style={styles.homeListTitle}>
              Select Home List
            </ThemedText>
            
            <View style={styles.homeListOptions}>
              {lists.map((list: List) => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.homeListOption,
                    { 
                      backgroundColor: list.color,
                      borderWidth: list.isHome ? 3 : 0,
                      borderColor: '#000'
                    }
                  ]}
                  onPress={() => {
                    setHomeList(list.id);
                    setHomeListModalVisible(false);
                  }}
                >
                  <IconSymbol name={list.isHome ? "star.fill" : "star"} size={24} color="#FFF" />
                  <ThemedText style={styles.homeListOptionText}>{list.title}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.taskActionButton, { backgroundColor: '#999' }]}
              onPress={() => setHomeListModalVisible(false)}
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
    flexDirection: 'column',
  },
  headerWrapper: {
    backgroundColor: '#f0f0f0',
  },
  swiperWrapper: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  addListBtnCenter: {
    flexDirection: 'row',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  addListBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 18,
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
  },
  titleSection: {
    flex: 1,
  },
  setHomeBtn: {
    padding: 8,
  },
  starEmoji: {
    fontSize: 28,
  },
  homeLabel: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    opacity: 0.8,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
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
  completedTask: {
    textDecorationLine: 'line-through',
    color: '#999',
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
  addTaskBtn: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addTaskBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  footerContainer: {
    gap: 10,
    paddingHorizontal: 15,
    paddingBottom: 30,
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
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
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
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.6,
  },
  priorityBtnActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#000',
  },
  priorityBtnText: {
    fontSize: 12,
    color: '#FFF',
  },
  recurringRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  recurringBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
  },
  recurringBtnActive: {
    backgroundColor: '#4A90E2',
  },
  recurringBtnText: {
    fontSize: 12,
    color: '#333',
  },
  dateBtn: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
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
    fontSize: 16,
  },
  taskActionModal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  taskActionTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  taskActionButton: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  taskActionButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  homeListModal: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  homeListTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  homeListOptions: {
    marginBottom: 20,
    gap: 10,
  },
  homeListOption: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  homeListOptionText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  reminderLabel: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
    fontWeight: '500',
  },
  clearReminderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
  },
  clearReminderText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
});