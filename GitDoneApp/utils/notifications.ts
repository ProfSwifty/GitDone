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

// Schedule a notification for a task reminder
export async function scheduleTaskReminder(task: Task, reminderTime: Date) {
  try {
    // Cancel any existing notification for this task
    await Notifications.cancelScheduledNotificationAsync(`task-${task.id}`);

    // If reminder is in the past, don't schedule
    if (reminderTime < new Date()) {
      return null;
    }

    // Calculate seconds until reminder
    const secondsUntilReminder = Math.floor((reminderTime.getTime() - Date.now()) / 1000);

    if (secondsUntilReminder > 0) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Reminder',
          body: task.title,
          sound: 'default',
          badge: 1,
        },
        trigger: { channelId: 'default', seconds: secondsUntilReminder } as any,
        identifier: `task-${task.id}`,
      });

      return notificationId;
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
