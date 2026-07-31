import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import useAuthStore from '../../store/authStore';
import { X } from 'lucide-react-native';
import { auth, GoogleAuthProvider, signInWithCredential } from '../../config/firebase';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '1059678110484-vho8db0q6q98bikhetloc26fn5ttuu88.apps.googleusercontent.com',
  androidClientId: '1059678110484-5urt3qktcumtprn1edu9v39hf273koip.apps.googleusercontent.com',
});

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      if (Platform.OS === 'web') {
        // Web preview bypass
        await login('DEV_BYPASS_TOKEN_123');
        return;
      }
      
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.idToken || userInfo.data?.idToken;
      
      if (!idToken) throw new Error("No ID token found");

      // Pass the Google token to Firebase to sign in locally
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      
      // Get the Firebase token to send to our backend
      const firebaseToken = await userCredential.user.getIdToken(true);
      
      // Login with backend
      await login(firebaseToken);
    } catch (error) {
      console.log('Google Sign-In Error:', error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled
      } else {
        Alert.alert("Login Failed", "Could not connect to Google or the server.");
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Backdrop blur to match website backdrop */}
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      
      <View style={styles.modalBox}>
        {/* Close Button */}
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
          disabled={isAuthenticating || isLoading}
          activeOpacity={0.7}
        >
          <X size={20} color="#94A3B8" />
        </TouchableOpacity>

        {/* Logo Icon Header */}
        <View style={styles.headerContainer}>
          <View style={styles.iconWrapper}>
            <Image 
              source={require('../../../assets/logo-icon.png')} 
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>CashTrack</Text>
          <Text style={styles.subtitle}>Premium Personal Finance Manager</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isAuthenticating || isLoading}
            activeOpacity={0.85}
          >
            {isAuthenticating ? (
              <ActivityIndicator color="#0F172A" />
            ) : (
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end', // Slide up modal from bottom like website
    backgroundColor: 'transparent',
  },
  modalBox: {
    backgroundColor: 'rgba(11, 19, 14, 0.92)', // Dark theme matching background
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0px -10px 20px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 36,
    marginTop: 8,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(191, 223, 79, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(191, 223, 79, 0.25)',
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#BFDF4F', // Website lime green brand color
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '400',
  },
  buttonContainer: {
    width: '100%',
    gap: 14,
  },
  googleButton: {
    backgroundColor: '#BFDF4F', // Match website btn-primary
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    boxShadow: '0px 4px 10px rgba(191, 223, 79, 0.25)',
    elevation: 5,
  },
  googleButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  devBypassButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  devBypassText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
