import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Task, useLists } from '@/context/ListsContext';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function UpcomingScreen() {
  const { lists } = useLists();

  const upcomingTasks = useMemo(() => {
    const allTasks: any[] = [];
    lists.forEach(list => {
      if (list.id !== 'priority') { // Exclude priority list from upcoming
        list.tasks.forEach(task => {
          if (task.dueDate && !task.completed) {
            allTasks.push({
              ...task,
              listTitle: list.title,
              listColor: list.color,
            });
          }
        });
      }
    });
    return allTasks.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return a.dueDate.getTime() - b.dueDate.getTime();
    });
  }, [lists]);

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD166';
      case 'low': return '#50C878';
      default: return '#999';
    }
  };

  const daysUntil = (date: Date | undefined) => {
    if (!date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff < 0) return 'Overdue';
    return `In ${diff} days`;
  };


  const renderItem = ({ item }: { item: Task & { listTitle: string; listColor: string } }) => (
    <ThemedView style={styles.taskCard}>
      <View style={styles.taskLeft}>
        <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(item.priority) }]} />
        <View style={styles.taskInfo}>
          <ThemedText style={styles.taskTitle}>{item.title}</ThemedText>
          <ThemedText style={styles.listName}>{item.listTitle}</ThemedText>
          {item.dueDate && (
            <ThemedText style={[styles.daysText, item.dueDate < new Date() && { color: '#FF6B6B' }]}>
              {daysUntil(item.dueDate)}
            </ThemedText>
          )}
        </View>
      </View>
      <TouchableOpacity>
        <IconSymbol name="circle" size={24} color="#999" />
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Upcoming Tasks</ThemedText>
      </View>
      <FlatList
        data={upcomingTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No upcoming tasks</ThemedText>
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
    backgroundColor: '#FF9A76',
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
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  priorityIndicator: {
    width: 4,
    height: 50,
    borderRadius: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listName: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  daysText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 50,
  },
});
