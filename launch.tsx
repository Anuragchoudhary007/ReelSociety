import { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

export default function LaunchScreen() {
  const router = useRouter();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    // Logo fade in
    opacity.value = withTiming(1, {
      duration: 1800,
      easing: Easing.out(Easing.exp),
    });

    // Slight zoom in
    scale.value = withTiming(1.05, {
      duration: 2500,
      easing: Easing.out(Easing.exp),
    });

    // Ambient glow fade in
    glowOpacity.value = withDelay(
      400,
      withTiming(0.4, { duration: 2000 })
    );

    // Fade out and navigate
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600 });
      glowOpacity.value = withTiming(0, { duration: 600 });

      setTimeout(() => {
        router.replace("/login");
      }, 600);
    }, 3200);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowWrapper, glowStyle]}>
        <LinearGradient
          colors={["rgba(255,40,40,0.3)", "transparent"]}
          style={styles.glow}
        />
      </Animated.View>

      <Animated.Image
        source={require("../assets/images/playstore-icon.png")}
        style={[styles.logo, logoStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  glowWrapper: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    width: 260,
    height: 260,
    borderRadius: 130,
  },
});
