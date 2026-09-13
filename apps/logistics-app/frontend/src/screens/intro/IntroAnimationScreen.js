import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../../navigation/routes';

const { width } = Dimensions.get('window');

// 3 Dynamic Agri-Logistics Deliveries in action
const DISPATCH_SLIDES = [
  {
    stepNumber: '01',
    category: 'MANDI HARVEST PICKUP',
    title: '50 Crates Tomatoes',
    farmer: 'Ramesh Farm, Pipili',
    earningsPreview: '₹420 Payout',
    badgeColor: '#ff6b6b',
    icon: 'fruit-watermelon',
    stats: '14.2 km • Zero Cold Spoilage',
  },
  {
    stepNumber: '02',
    category: 'AI HIGHWAY DISPATCH',
    title: 'Smart Multi-Drop Corridor',
    farmer: 'NH-16 Express Bypass',
    earningsPreview: '₹140 Fuel Saved',
    badgeColor: '#f8bd45',
    icon: 'navigation-variant',
    stats: 'Jam-Free Rural AI Routing',
  },
  {
    stepNumber: '03',
    category: 'INSTANT SETTLEMENT',
    title: 'Mandi Gate Delivery Completed',
    farmer: 'Central Wholesale Yard',
    earningsPreview: 'Credited to Bank',
    badgeColor: '#76d691',
    icon: 'bank-check',
    stats: 'Instant IMPS Cash Transfer',
  },
];

export const IntroAnimationScreen = ({ navigation, onComplete }) => {
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);

  // Animations
  const cardSlideAnim = useRef(new Animated.Value(30)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Pulse rings
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.4)).current;

  // Master Progress Bar (4.5s)
  const masterProgress = useRef(new Animated.Value(0)).current;

  const handleFinish = () => {
    if (onComplete) onComplete();
    navigation.replace(ROUTES.LOGIN);
  };

  useEffect(() => {
    // 1. Ambient Brand Logo Breathing Pulse
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.4,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 2. Animate First Slide in
    animateSlideIn();

    // 3. Cycle through 3 Dispatch Slides at 1.5s intervals
    const t1 = setTimeout(() => transitionToSlide(1), 1500);
    const t2 = setTimeout(() => transitionToSlide(2), 3000);

    // 4. Master 4.5s progress bar
    Animated.timing(masterProgress, {
      toValue: 1,
      duration: 4500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // Auto navigate after 4.5s
    const navTimer = setTimeout(() => {
      handleFinish();
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(navTimer);
    };
  }, []);

  const animateSlideIn = () => {
    Animated.parallel([
      Animated.timing(cardOpacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(cardSlideAnim, {
        toValue: 0,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const transitionToSlide = (nextIndex) => {
    Animated.parallel([
      Animated.timing(cardOpacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cardSlideAnim, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveSlide(nextIndex);
      cardSlideAnim.setValue(25);
      Animated.parallel([
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const progressWidth = masterProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const slide = DISPATCH_SLIDES[activeSlide];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Background Neon Grid Accents */}
      <View style={styles.radialGlowTop} />
      <View style={styles.radialGlowBottom} />

      {/* Top Telemetry Bar with Skip */}
      <View style={styles.headerRow}>
        <View style={styles.fleetStatus}>
          <View style={styles.statusBlinker} />
          <Text style={styles.fleetText}>ODISHA MANDI CORRIDOR</Text>
        </View>

        <TouchableOpacity style={styles.skipPill} onPress={handleFinish} activeOpacity={0.7}>
          <Text style={styles.skipPillText}>Skip Intro</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Brand Hero Header */}
      <View style={styles.brandHero}>
        <View style={styles.logoAnchor}>
          {/* Pulsing Breathing Aura */}
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="sprout" size={42} color="#005129" />
          </View>
        </View>

        <Text style={styles.brandTitle}>
          Mandi<Text style={styles.brandAccent}>Kart</Text>
        </Text>
        <Text style={styles.brandSub}>DELIVERY PARTNER FLEET</Text>
      </View>

      {/* Dynamic Glassmorphic "Live Dispatch Ticket" Card */}
      <Animated.View
        style={[
          styles.dispatchTicket,
          {
            opacity: cardOpacityAnim,
            transform: [{ translateY: cardSlideAnim }],
          },
        ]}
      >
        {/* Ticket Header */}
        <View style={styles.ticketTopRow}>
          <View style={[styles.categoryTag, { backgroundColor: slide.badgeColor + '20', borderColor: slide.badgeColor }]}>
            <MaterialCommunityIcons name={slide.icon} size={14} color={slide.badgeColor} style={{ marginRight: 5 }} />
            <Text style={[styles.categoryText, { color: slide.badgeColor }]}>{slide.category}</Text>
          </View>

          <Text style={styles.stepCounter}>{slide.stepNumber} / 03</Text>
        </View>

        {/* Cargo Detail */}
        <Text style={styles.cargoTitle}>{slide.title}</Text>

        <View style={styles.farmerRow}>
          <MaterialCommunityIcons name="map-marker" size={15} color="#aeeebf" />
          <Text style={styles.farmerName}>{slide.farmer}</Text>
        </View>

        {/* Divider */}
        <View style={styles.ticketDivider} />

        {/* Ticket Footer (Earnings & Telemetry) */}
        <View style={styles.ticketFooter}>
          <View>
            <Text style={styles.metaLabel}>BENEFIT</Text>
            <Text style={styles.earningsValue}>{slide.earningsPreview}</Text>
          </View>

          <View style={styles.statsCol}>
            <Text style={styles.metaLabel}>LOGISTICS STATUS</Text>
            <Text style={styles.statsValue}>{slide.stats}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Step Indicators */}
      <View style={styles.stepsIndicatorRow}>
        {DISPATCH_SLIDES.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.stepBar,
              activeSlide === idx ? styles.stepBarActive : styles.stepBarInactive,
            ]}
          />
        ))}
      </View>

      {/* Clean Bottom Area without loader */}
      <View style={styles.bottomBarArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#01200f', // Deep dark luxury agri-corridor green
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  radialGlowTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(248, 189, 69, 0.12)', // warm amber
  },
  radialGlowBottom: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(118, 214, 145, 0.15)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    zIndex: 10,
  },
  fleetStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusBlinker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#76d691',
    marginRight: 6,
  },
  fleetText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  skipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  skipPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginRight: 2,
  },
  brandHero: {
    alignItems: 'center',
    marginTop: 4,
  },
  logoAnchor: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pulseCircle: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(248, 189, 69, 0.35)',
  },
  logoBadge: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  brandTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: '#f8bd45', // Harvest Gold
  },
  brandSub: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 2,
    marginTop: 4,
  },
  dispatchTicket: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    marginVertical: 10,
    elevation: 4,
  },
  ticketTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepCounter: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    fontWeight: '800',
  },
  cargoTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  farmerName: {
    color: '#aeeebf',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1,
  },
  earningsValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#f8bd45',
    marginTop: 2,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  statsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 2,
  },
  stepsIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  stepBar: {
    height: 4,
    borderRadius: 2,
  },
  stepBarActive: {
    width: 28,
    backgroundColor: '#f8bd45',
  },
  stepBarInactive: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  bottomBarArea: {
    width: '100%',
    marginBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '500',
  },
  readyText: {
    color: '#f8bd45',
    fontSize: 11,
    fontWeight: '800',
  },
  progressTrack: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#f8bd45',
    borderRadius: 1.5,
  },
});

export default IntroAnimationScreen;
