import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthProvider";

import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions
} from "react-native";

const { width } = Dimensions.get("window");

export default function Index() {

  const router = useRouter();
  const { user, loading } = useAuth();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const reelRotate = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;

  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {

    Animated.loop(
      Animated.timing(reelRotate, {
        toValue: 1,
        duration: 9000,
        useNativeDriver: true
      })
    ).start();

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true
      })
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    ).start();

    const floatParticle = (p: any, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p, {
            toValue: -50,
            duration: 3000,
            delay,
            useNativeDriver: true
          }),
          Animated.timing(p, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ).start();
    };

    floatParticle(particle1, 0);
    floatParticle(particle2, 500);
    floatParticle(particle3, 900);

  }, []);

  useEffect(() => {

    if (loading) return;

    const timeout = setTimeout(() => {
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/(auth)/login");
      }
    }, 3200);

    return () => clearTimeout(timeout);

  }, [user, loading]);

  const rotate = reelRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  const glowScale = glowPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25]
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.reel,
          { transform: [{ rotate }] }
        ]}
      />

      <Animated.View
        style={[
          styles.glow,
          { transform: [{ scale: glowScale }] }
        ]}
      />

      <Animated.View style={[styles.particle, { transform: [{ translateY: particle1 }] }]} />
      <Animated.View style={[styles.particle2, { transform: [{ translateY: particle2 }] }]} />
      <Animated.View style={[styles.particle3, { transform: [{ translateY: particle3 }] }]} />

      <Animated.View
        style={{
          alignItems: 'center',
          opacity: logoOpacity,
          transform: [{ scale: logoScale }]
        }}
      >
        <Text style={styles.logo}>
          ReelSociety
        </Text>
        <Text style={styles.subtitle}>
          Track • Rate • Discover
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0B0B0B",
    justifyContent: "center",
    alignItems: "center"
  },

  reel: {
    position: "absolute",
    width: width * 1.6,
    height: width * 1.6,
    borderRadius: (width * 1.6) / 2,
    borderWidth: 40,
    borderColor: "#111",
    opacity: 0.25
  },

  glow: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#E50914",
    opacity: 0.18
  },

  logo: {
    fontSize: 46,
    color: "#FFFFFF",
    fontWeight: "bold",
    letterSpacing: 2
  },

  subtitle: {
    color: "#A0A0A0",
    marginTop: 10,
    fontSize: 14,
    letterSpacing: 1
  },

  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E50914",
    top: 340
  },

  particle2: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FF3B3B",
    top: 380,
    left: 160
  },

  particle3: {
    position: "absolute",
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FF6B6B",
    top: 360,
    right: 160
  }

});