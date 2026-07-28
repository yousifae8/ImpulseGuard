import notifee, { TriggerType, AndroidImportance } from '@notifee/react-native';

const CHANNEL_ID = 'impulse-reminders';


export const initNotificationChannel = async (): Promise<string> => {
  return await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Impulse Delay Reminders',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1; 
};

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

export const cancelImpulseNotification = async (id: string): Promise<void> => {
  try {
    await notifee.cancelNotification(id);
  } catch (error) {
    console.error('Failed to cancel impulse notification:', error);
  }
};
