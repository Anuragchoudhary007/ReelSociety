import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Animated } from "react-native";
import { useRef } from "react";

export default function TabsLayout() {

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.2,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const renderIcon = (name: any, color: string, size: number) => (
    <Animated.View
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "#111",
          height: 70,
          paddingBottom: 8,
        },

        tabBarActiveTintColor: "#e50914",
        tabBarInactiveTintColor: "#777",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) =>
            renderIcon("home", color, size),
        }}
        listeners={{
          tabPress: () => {
            animateIn();
            setTimeout(animateOut, 150);
          },
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) =>
            renderIcon("search", color, size),
        }}
        listeners={{
          tabPress: () => {
            animateIn();
            setTimeout(animateOut, 150);
          },
        }}
      />

      <Tabs.Screen
        name="watchlist"
        options={{
          title: "Watchlist",
          tabBarIcon: ({ color, size }) =>
            renderIcon("bookmark", color, size),
        }}
        listeners={{
          tabPress: () => {
            animateIn();
            setTimeout(animateOut, 150);
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) =>
            renderIcon("person", color, size),
        }}
        listeners={{
          tabPress: () => {
            animateIn();
            setTimeout(animateOut, 150);
          },
        }}
      />
    </Tabs>
  );
}