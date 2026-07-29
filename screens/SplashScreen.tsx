import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import theme from '../components/common/theme';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
  const logoScale   = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const ringScale1  = useRef(new Animated.Value(0.4)).current;
  const ringOpacity1= useRef(new Animated.Value(0.6)).current;
  const ringScale2  = useRef(new Animated.Value(0.4)).current;
  const ringOpacity2= useRef(new Animated.Value(0.4)).current;
  const shimmerX    = useRef(new Animated.Value(-width)).current;
  const dotScale    = [
    useRef(new Animated.Value(0.4)).current,
    useRef(new Animated.Value(0.4)).current,
    useRef(new Animated.Value(0.4)).current,
  ];

  useEffect(() => {
    const pulseRing = (scale: Animated.Value, opacity: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 1.8, duration: 1600, useNativeDriver: true, easing: Easing.out(Easing.ease) }),
            Animated.timing(opacity, { toValue: 0,   duration: 1600, useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(scale,   { toValue: 0.4, duration: 0, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: delay === 0 ? 0.6 : 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      );

    pulseRing(ringScale1, ringOpacity1, 0).start();
    pulseRing(ringScale2, ringOpacity2, 600).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(900),
      Animated.timing(tagOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(shimmerX, { toValue: width, duration: 900, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
        Animated.timing(shimmerX, { toValue: -width, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    const bounceDot = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay + 1000),
          Animated.spring(dot, { toValue: 1, friction: 3, tension: 200, useNativeDriver: true }),
          Animated.spring(dot, { toValue: 0.4, friction: 3, tension: 200, useNativeDriver: true }),
        ])
      );

    bounceDot(dotScale[0], 0).start();
    bounceDot(dotScale[1], 160).start();
    bounceDot(dotScale[2], 320).start();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.glow} />
      <View style={styles.logoArea}>
        <Animated.View style={[styles.ring, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]} />
        <Animated.View style={[styles.ring, styles.ring2, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]} />

        <Animated.View style={[styles.logoCircle, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
          <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
          <Text style={styles.logoEmoji}>🛡️</Text>
        </Animated.View>
      </View>
      <Animated.View style={{ opacity: textOpacity }}>
        <Text style={styles.brand}>ImpulseGuard</Text>
      </Animated.View>
      <Animated.View style={{ opacity: tagOpacity }}>
        <Text style={styles.tagline}>Think before you spend</Text>
      </Animated.View>
      <View style={styles.dotsRow}>
        {dotScale.map((dot, i) => (
          <Animated.View key={i} style={[styles.dot, { transform: [{ scale: dot }] }]} />
        ))}
      </View>
    </View>
  );
};

export default SplashScreen;

const RING_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.bgBase,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.brand.primary,
    opacity: 0.06,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -220 }],
  },
  logoArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: theme.brand.primary,
  },
  ring2: {
    borderColor: theme.brand.primary,
    opacity: 0.4,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.background.bgSurface,
    borderWidth: 2.5,
    borderColor: theme.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    width: 40,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ rotate: '20deg' }],
  },
  logoEmoji: {
    fontSize: 40,
  },
  brand: {
    fontSize: 30,
    fontWeight: '700',
    color: theme.text.textPrimary,
    fontFamily: theme.fonts.heading,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: theme.fontSize.small,
    color: theme.text.textSecondary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.brand.primary,
  },
});
