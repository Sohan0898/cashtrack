import cron from 'node-cron';
import { DateTime } from 'luxon';
import webpush from 'web-push';
import { Expo } from 'expo-server-sdk';
import User from '../models/User.js';
import Income from '../models/Income.js';
import Expense from '../models/Expense.js';

const expo = new Expo();

export const initCronJobs = () => {
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      'mailto:support@cashtrack.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
  } else {
    console.warn('[Cron] VAPID keys not found in environment. Push notifications are disabled.');
  }

  // Run at the top of every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running hourly notification checks...');
    
    try {
      const users = await User.find({
        $or: [
          { pushSubscriptions: { $exists: true, $not: { $size: 0 } } },
          { expoPushTokens: { $exists: true, $not: { $size: 0 } } }
        ]
      });

      for (const user of users) {
        const userTime = DateTime.now().setZone(user.timezone || 'UTC');
        const hour = userTime.hour;
        const dayOfWeek = userTime.weekday; // 1 = Monday, 7 = Sunday
        const dayOfMonth = userTime.day;

        // Daily Reminders at 12 PM (12) and 10 PM (22)
        if (user.notificationPreferences?.daily && (hour === 12 || hour === 22)) {
          const payload = JSON.stringify({
            title: 'Time to update CashTrack!',
            body: hour === 12 ? 'Log your morning expenses and income to stay on track.' : 'Don\'t forget to log your evening expenses before bed!',
            icon: '/icon-192x192.png',
            url: '/'
          });
          await sendPush(user, payload);
        }

        // Weekly Summary on Sunday at 9 AM
        if (user.notificationPreferences?.weekly && dayOfWeek === 7 && hour === 9) {
          const summary = await getWeeklySummary(user._id);
          const payload = JSON.stringify({
            title: 'Your Weekly CashTrack Summary',
            body: `You spent ${user.currency} ${summary.expense} and earned ${user.currency} ${summary.income} this week. Tap to see more!`,
            icon: '/icon-192x192.png',
            url: '/'
          });
          await sendPush(user, payload);
        }

        // Monthly Summary on the 1st at 9 AM
        if (user.notificationPreferences?.monthly && dayOfMonth === 1 && hour === 9) {
          const summary = await getMonthlySummary(user._id);
          const payload = JSON.stringify({
            title: 'Your Monthly CashTrack Summary',
            body: `Last month you spent ${user.currency} ${summary.expense} and earned ${user.currency} ${summary.income}.`,
            icon: '/icon-192x192.png',
            url: '/'
          });
          await sendPush(user, payload);
        }
      }
    } catch (error) {
      console.error('[Cron] Error running notifications:', error);
    }
  });
};

const sendPush = async (user, payload) => {
  const activeSubs = [];
  let subscriptionRemoved = false;
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(payload);
  } catch (e) {
    parsedPayload = { title: 'Notification', body: payload };
  }

  // Web Push
  if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
    for (const sub of user.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, payload);
        activeSubs.push(sub);
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log(`[Cron] Subscription expired for user ${user._id}`);
          subscriptionRemoved = true;
        } else {
          console.error(`[Cron] Push error for user ${user._id}:`, error);
          activeSubs.push(sub); // Keep it if it's not a 404/410
        }
      }
    }

    if (subscriptionRemoved) {
      user.pushSubscriptions = activeSubs;
      await user.save();
    }
  }

  // Expo Push for Mobile
  if (user.expoPushTokens && user.expoPushTokens.length > 0) {
    const messages = [];
    for (const pushToken of user.expoPushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) continue;
      messages.push({
        to: pushToken,
        sound: 'default',
        title: parsedPayload.title,
        body: parsedPayload.body,
        data: { url: parsedPayload.url },
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error(`[Cron] Expo Push error for user ${user._id}:`, error);
      }
    }
  }
};

const getWeeklySummary = async (userId) => {
  const startOfWeek = DateTime.now().startOf('week').toJSDate();
  
  const [income, expense] = await Promise.all([
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfWeek } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  return {
    income: income[0]?.total || 0,
    expense: expense[0]?.total || 0
  };
};

const getMonthlySummary = async (userId) => {
  const startOfMonth = DateTime.now().minus({ months: 1 }).startOf('month').toJSDate();
  const endOfMonth = DateTime.now().minus({ months: 1 }).endOf('month').toJSDate();
  
  const [income, expense] = await Promise.all([
    Income.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  return {
    income: income[0]?.total || 0,
    expense: expense[0]?.total || 0
  };
};
