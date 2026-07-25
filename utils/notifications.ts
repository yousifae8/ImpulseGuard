import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'impulse-reminders';

/**
 * Initializes the Notifee notification channel for Android.
 */
export const initNotificationChannel = async (): Promise<string> => {
  return await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Impulse Delay Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
};

/**
 * Requests runtime notification permissions on Android (13+) / iOS.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1; // 1 = Authorized, 2 = Provisional
};

/**
 * Schedules a local trigger notification for when an impulse's countdown timer expires.
 */
export const scheduleImpulseNotification = async (
  id: string,
  itemName: string,
  releaseAt: string
): Promise<void> => {
  try {
    await requestNotificationPermission();
    const channelId = await initNotificationChannel();

    const releaseTimestamp = new Date(releaseAt).getTime();
    const now = Date.now();

    if (releaseTimestamp <= now) {
      // Already ready, show immediate notification
      await notifee.displayNotification({
        id,
        title: 'Impulse Ready for Review! 🔔',
        body: `Your delay timer for "${itemName}" has ended. Open ImpulseGuard to review it!`,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      });
      return;
    }

    // Schedule timestamp trigger notification
    await notifee.createTriggerNotification(
      {
        id,
        title: 'Impulse Ready for Review! 🔔',
        body: `Your delay timer for "${itemName}" has ended. Open ImpulseGuard to review it!`,
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: releaseTimestamp,
      }
    );
  } catch (error) {
    console.error('Failed to schedule impulse notification:', error);
  }
};

/**
 * Cancels a scheduled local notification for a given impulse ID.
 */
export const cancelImpulseNotification = async (id: string): Promise<void> => {
  try {
    await notifee.cancelNotification(id);
  } catch (error) {
    console.error('Failed to cancel impulse notification:', error);
  }
};
