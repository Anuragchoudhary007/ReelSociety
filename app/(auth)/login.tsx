import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { useRouter } from "expo-router";
import { auth, db } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleAuth = async () => {
    try {
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Email and password required");
        return;
      }

      setLoading(true);

      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password.trim()
        );

        router.replace("/(tabs)/home");
      } else {
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        const baseUsername = trimmedEmail
          .split("@")[0]
          .toLowerCase();

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            trimmedEmail,
            trimmedPassword
          );

        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
          email: trimmedEmail,
          username: baseUsername,
          usernameLowercase: baseUsername,
          bio: "",
          photoURL: "",
          createdAt: serverTimestamp(),
        });

        await addDoc(
          collection(db, "users", uid, "lists"),
          {
            title: "My Watchlist",
            description: "",
            isPublic: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        router.replace("/(tabs)/home");
      }
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("User not found");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already registered");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter your email first");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Password reset email sent");
    } catch {
      Alert.alert("Failed to send reset email");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.logo}>ReelSociety</Text>

        <View style={styles.card}>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#777"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#aaa"
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? "Login" : "Register"}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={handleResetPassword}>
              <Text style={styles.resetText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? "Create a new account"
                : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },

  container: {
    padding: 30,
  },

  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#e50914",
    textAlign: "center",
    marginBottom: 40,
  },

  card: {
    backgroundColor: "#111",
    padding: 25,
    borderRadius: 16,
  },

  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 15,
  },

  button: {
    backgroundColor: "#e50914",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  switchText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },

  resetText: {
    color: "#e50914",
    textAlign: "center",
    marginTop: 12,
  },

  error: {
    color: "#ff4d4d",
    textAlign: "center",
    marginBottom: 10,
  },
});