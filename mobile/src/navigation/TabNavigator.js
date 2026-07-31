import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Home, Receipt, PiggyBank, Landmark, BarChart3, User 
} from 'lucide-react-native';

import DashboardScreen from '../screens/main/DashboardScreen';
import TransactionsScreen from '../screens/main/TransactionsScreen';
import SavingsScreen from '../screens/main/SavingsScreen';
import BankInterestScreen from '../screens/main/BankInterestScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import useAuthStore from '../store/authStore';
import { useTranslation } from '../lib/i18n';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Get user's first name or fallback
  const userName = user?.name ? user.name.split(' ')[0] : t('Profile');
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const avatarUrl = user?.avatar || user?.picture || user?.avatarUrl || null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#09110B',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          elevation: 10,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#BFDF4F',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarIcon: ({ color, focused }) => {
          const iconSize = focused ? 22 : 20;

          if (route.name === 'Dashboard') {
            return <Home color={color} size={iconSize} />;
          } else if (route.name === 'Transactions') {
            return <Receipt color={color} size={iconSize} />;
          } else if (route.name === 'Savings') {
            return <PiggyBank color={color} size={iconSize} />;
          } else if (route.name === 'Interest') {
            return <Landmark color={color} size={iconSize} />;
          } else if (route.name === 'Reports') {
            return <BarChart3 color={color} size={iconSize} />;
          } else if (route.name === 'Profile') {
            // Render User Image if available, otherwise render sleek avatar badge with User Initial
            if (avatarUrl) {
              return (
                <View style={[styles.avatarContainer, focused && styles.avatarContainerActive]}>
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                </View>
              );
            }
            return (
              <View style={[styles.initialAvatar, focused && styles.initialAvatarActive]}>
                <Text style={[styles.initialText, { color: focused ? '#0F172A' : '#BFDF4F' }]}>
                  {userInitial}
                </Text>
              </View>
            );
          }
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ tabBarLabel: t('Dashboard') }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsScreen} 
        options={{ tabBarLabel: t('Transactions') }}
      />
      <Tab.Screen 
        name="Savings" 
        component={SavingsScreen} 
        options={{ tabBarLabel: t('Savings') }}
      />
      <Tab.Screen 
        name="Interest" 
        component={BankInterestScreen} 
        options={{ tabBarLabel: t('Interest') }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen} 
        options={{ tabBarLabel: t('Reports') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarLabel: userName }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#64748B',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainerActive: {
    borderColor: '#BFDF4F',
    borderWidth: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  initialAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(191, 223, 79, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(191, 223, 79, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialAvatarActive: {
    backgroundColor: '#BFDF4F',
    borderColor: '#BFDF4F',
  },
  initialText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default TabNavigator;
