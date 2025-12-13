import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Task } from '../context/ListsContext';

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

// Store reminder in async storage
export async function saveTaskReminder(taskId: string, reminderTime: Date) {
  try {
    const reminders = await getStoredReminders();
    reminders[taskId] = reminderTime.toISOString();
    await AsyncStorage.setItem('task_reminders', JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminder:', error);
  }
}

// Get stored reminders
export async function getStoredReminders() {
  try {
    const stored = await AsyncStorage.getItem('task_reminders');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting stored reminders:', error);
    return {};
  }
}

// Set up notification channels (Android)
export async function setupNotificationChannels() {
  try {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
    });
  } catch (error) {
    console.error('Error setting up notification channels:', error);
  }
}

// Schedule a notification for a task reminder
export async function scheduleTaskReminder(task: Task, reminderTime: Date) {
  try {
    // Cancel any existing notification for this task
    try {
      await Notifications.cancelScheduledNotificationAsync(`task-${task.id}`);
    } catch (e) {
      // Notification might not exist, that's okay
    }

    // If reminder is in the past, don't schedule
    if (reminderTime < new Date()) {
      return null;
    }

    // Calculate seconds until reminder
    const now = new Date();
    const secondsUntilReminder = Math.round((reminderTime.getTime() - now.getTime()) / 1000);

    if (secondsUntilReminder > 0) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: task.title,
          sound: 'default',
          badge: 1,
          data: { taskId: task.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsUntilReminder,
        },
        identifier: `task-${task.id}`,
      });

      // Save reminder to storage
      await saveTaskReminder(task.id, reminderTime);

      return notificationId;
    } else {
      console.warn(`Calculated seconds until reminder is not positive: ${secondsUntilReminder}`);
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
  return null;
}


// Cancel notification for a task
export async function cancelTaskReminder(taskId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(`task-${taskId}`);
    const reminders = await getStoredReminders();
    delete reminders[taskId];
    await AsyncStorage.setItem('task_reminders', JSON.stringify(reminders));
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

// Get all scheduled notifications
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Get reminder for a specific task
export async function getTaskReminder(taskId: string) {
  try {
    const reminders = await getStoredReminders();
    if (reminders[taskId]) {
      return new Date(reminders[taskId]);
    }
  } catch (error) {
    console.error('Error getting task reminder:', error);
  }
  return null;
}

// Format reminder time for display
export function formatReminderTime(date: Date): string {
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  
  // Round to nearest minute for display consistency with notification timing
  const roundedDate = new Date(Math.round(date.getTime() / 60000) * 60000);
  
  if (isSameDay) {
    return roundedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  
  return roundedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

// Calculate next occurrence date for recurring tasks
export function getNextRecurringDate(task: Task, currentDate: Date): Date | null {
  if (!task.recurring || task.recurring === 'none') {
    return null;
  }

  const nextDate = new Date(currentDate);

  switch (task.recurring) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  // Preserve the time from recurringTime if set
  if (task.recurringTime) {
    nextDate.setHours(task.recurringTime.getHours());
    nextDate.setMinutes(task.recurringTime.getMinutes());
    nextDate.setSeconds(0);
  }

  return nextDate;
}

// Reschedule reminder for next recurring task occurrence
export async function rescheduleRecurringReminder(task: Task) {
  try {
    if (!task.recurring || task.recurring === 'none' || !task.reminder) {
      return null;
    }

    const nextDate = getNextRecurringDate(task, task.reminder);
    if (!nextDate || nextDate < new Date()) {
      return null;
    }

    // Schedule reminder for next occurrence
    return await scheduleTaskReminder(task, nextDate);
  } catch (error) {
    console.error('Error rescheduling recurring reminder:', error);
  }
  return null;
}
