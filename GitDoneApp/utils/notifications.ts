import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Task } from '../context/ListsContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/** Requests user permission to send notifications */
export async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/** Saves task reminder time to local storage */
export async function saveTaskReminder(taskId: string, reminderTime: Date) {
  try {
    const reminders = await getStoredReminders();
    reminders[taskId] = reminderTime.toISOString();
    await AsyncStorage.setItem('task_reminders', JSON.stringify(reminders));
  } catch (error) {
    console.error('Error saving reminder:', error);
  }
}

/** Retrieves all stored task reminders from local storage */
export async function getStoredReminders() {
  try {
    const stored = await AsyncStorage.getItem('task_reminders');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error getting stored reminders:', error);
    return {};
  }
}

/** Configures Android notification channels with sound and vibration settings */
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

/** Schedules a notification for a task at the specified reminder time */
export async function scheduleTaskReminder(task: Task, reminderTime: Date) {
  try {
    try {
      await Notifications.cancelScheduledNotificationAsync(`task-${task.id}`);
    } catch (e) {
      return null;
    }

    if (reminderTime < new Date()) {
      return null;
    }

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

      await saveTaskReminder(task.id, reminderTime);
      return notificationId;
    }
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
  return null;
}

/** Cancels a scheduled notification for a specific task */
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

/** Retrieves all currently scheduled notifications */
export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/** Retrieves the reminder time for a specific task */
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

/** Formats a date for display, rounded to the nearest minute */
export function formatReminderTime(date: Date): string {
  const now = new Date();
  const isSameDay = date.toDateString() === now.toDateString();
  
  const roundedDate = new Date(Math.round(date.getTime() / 60000) * 60000);
  
  if (isSameDay) {
    return roundedDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  
  return roundedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

/** Calculates the next occurrence date for a recurring task */
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

  if (task.recurringTime) {
    nextDate.setHours(task.recurringTime.getHours());
    nextDate.setMinutes(task.recurringTime.getMinutes());
    nextDate.setSeconds(0);
  }

  return nextDate;
}

/** Reschedules reminder for the next occurrence of a recurring task */
export async function rescheduleRecurringReminder(task: Task) {
  try {
    if (!task.recurring || task.recurring === 'none' || !task.reminder) {
      return null;
    }

    const nextDate = getNextRecurringDate(task, task.reminder);
    if (!nextDate || nextDate < new Date()) {
      return null;
    }

    return await scheduleTaskReminder(task, nextDate);
  } catch (error) {
    console.error('Error rescheduling recurring reminder:', error);
  }
  return null;
}
