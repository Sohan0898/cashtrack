import User from '../models/User.js';

export const subscribeToNotifications = async (req, res) => {
  try {
    const { subscription, expoPushToken, timezone } = req.body;
    
    if ((!subscription && !expoPushToken) || !timezone) {
      return res.status(400).json({ message: 'Subscription/token and timezone are required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (subscription) {
      const existingSubIndex = user.pushSubscriptions.findIndex(
        (sub) => sub.endpoint === subscription.endpoint
      );
      if (existingSubIndex === -1) {
        user.pushSubscriptions.push(subscription);
      } else {
        user.pushSubscriptions[existingSubIndex] = subscription;
      }
    }

    if (expoPushToken && !user.expoPushTokens.includes(expoPushToken)) {
      user.expoPushTokens.push(expoPushToken);
    }

    user.timezone = timezone;
    await user.save();

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const unsubscribeFromNotifications = async (req, res) => {
  try {
    const { endpoint, expoPushToken } = req.body;
    
    if (!endpoint && !expoPushToken) {
      return res.status(400).json({ message: 'Endpoint or expoPushToken is required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (endpoint) {
      user.pushSubscriptions = user.pushSubscriptions.filter(
        (sub) => sub.endpoint !== endpoint
      );
    }

    if (expoPushToken) {
      user.expoPushTokens = user.expoPushTokens.filter((token) => token !== expoPushToken);
    }

    await user.save();

    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({ message: 'Preferences are required' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();

    res.status(200).json({ message: 'Preferences updated successfully', preferences: user.notificationPreferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getNotificationPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ preferences: user.notificationPreferences, timezone: user.timezone });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
