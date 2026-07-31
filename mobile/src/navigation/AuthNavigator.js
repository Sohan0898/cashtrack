import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/auth/SplashScreen';
import LandingScreen from '../screens/auth/LandingScreen';
import LoginScreen from '../screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Landing"
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#111827' } }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          contentStyle: { backgroundColor: 'transparent' }
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
