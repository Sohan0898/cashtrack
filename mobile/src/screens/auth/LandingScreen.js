import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions, Easing, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 40;

// Helper to simulate a seamless blurred radial glow using micro concentric rings
const RadialGlow = ({ size, color, maxOpacity }) => {
  const rings = 30;
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
      {[...Array(rings)].map((_, i) => {
        const ringSize = size * ((rings - i) / rings);
        const progress = i / rings;
        // Smooth exponential opacity falloff for seamless gradient blending
        const opacity = (maxOpacity / 4) * Math.pow(1 - progress, 2);
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              backgroundColor: color,
              opacity: Math.max(0.003, opacity),
            }}
          />
        );
      })}
    </View>
  );
};

const LandingScreen = ({ navigation }) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Super smooth, slower signal pulse animation for the pill dot
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 3200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    ).start();
  }, [pulseAnim]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.8],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.7, 1],
    outputRange: [0.7, 0.2, 0],
  });

  // Generate grid boxes manually
  const renderGrid = () => {
    const cols = Math.ceil(width / GRID_SIZE);
    const rows = Math.ceil(height / GRID_SIZE);
    const boxes = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        boxes.push(
          <View
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              left: c * GRID_SIZE,
              top: r * GRID_SIZE,
              width: GRID_SIZE,
              height: GRID_SIZE,
              borderWidth: 0.5,
              borderColor: 'rgba(255, 255, 255, 0.05)',
            }}
          />
        );
      }
    }

    return (
      <View style={[StyleSheet.absoluteFillObject, { pointerEvents: 'none' }]}>
        {boxes}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Layer: Exact Web Match */}
      <View style={StyleSheet.absoluteFill}>
        {/* Radial Glows */}
        <View style={styles.glowTopRight}>
          <RadialGlow size={600} color="#BFDF4F" maxOpacity={0.05} />
        </View>
        <View style={styles.glowBottomLeft}>
          <RadialGlow size={500} color="#BFDF4F" maxOpacity={0.05} />
        </View>
        
        {/* Grid Pattern */}
        {renderGrid()}
      </View>

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require('../../../assets/logo-dark.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.textContainer}>
            {/* Glassmorphic Pill Badge with Signal Animation */}
            <BlurView intensity={60} tint="dark" style={styles.pillBadge}>
              <View style={styles.signalContainer}>
                <Animated.View
                  style={[
                    styles.signalPulse,
                    {
                      transform: [{ scale: pulseScale }],
                      opacity: pulseOpacity,
                    },
                  ]}
                />
                <View style={styles.pillDot} />
              </View>
              <Text style={styles.pillText}>Take absolute control of your personal finances</Text>
            </BlurView>

            <Text style={styles.title}>
              Master Your{'\n'}
              <Text style={styles.titleHighlight}>Financial{'\n'}Future</Text> with{'\n'}
              Smart Tracking
            </Text>

            <Text style={styles.subtitle} numberOfLines={3}>
              Track your income, monitor daily expenses, and achieve your savings goals effortlessly with a beautifully simple, all-in-one financial dashboard.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                if (Platform.OS === 'web') {
                  document.activeElement?.blur();
                }
                navigation.navigate('Login');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B130E',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Slightly increased visibility for crisp grid boxes
  },
  glowTopRight: {
    position: 'absolute',
    top: -200,
    right: -250,
    width: 600,
    height: 600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowBottomLeft: {
    position: 'absolute',
    bottom: -150,
    left: -200,
    width: 500,
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  logo: {
    width: '100%',
    height: 150,
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    marginBottom: 24,
    overflow: 'hidden',
  },
  signalContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  signalPulse: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BFDF4F',
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#BFDF4F',
  },
  pillText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 20,
  },
  titleHighlight: {
    color: '#BFDF4F', // Lime green from web
    fontFamily: 'serif',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  footer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#BFDF4F',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    boxShadow: '0px 4px 8px rgba(191, 223, 79, 0.3)',
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LandingScreen;
