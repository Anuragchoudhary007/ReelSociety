import { BlurView } from "expo-blur";
import { View, StyleSheet } from "react-native";

export default function GlassCard({ children }: any) {
  return (
    <BlurView intensity={50} tint="dark" style={styles.blur}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blur: {
    borderRadius: 20,
    overflow: "hidden",
  },
  inner: {
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
});
