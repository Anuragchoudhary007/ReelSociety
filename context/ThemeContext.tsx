import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Animated } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeContextType = {
  darkMode: boolean;
  toggleTheme: () => void;
  animatedValue: Animated.Value;
};

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [darkMode, setDarkMode] = useState(true);
  const animatedValue = new Animated.Value(1);

  // Load saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem("APP_THEME");
      if (stored !== null) {
        setDarkMode(stored === "dark");
        animatedValue.setValue(stored === "dark" ? 1 : 0);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !darkMode;
    setDarkMode(newTheme);

    await AsyncStorage.setItem(
      "APP_THEME",
      newTheme ? "dark" : "light"
    );

    Animated.timing(animatedValue, {
      toValue: newTheme ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <ThemeContext.Provider
      value={{ darkMode, toggleTheme, animatedValue }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  return context;
}
