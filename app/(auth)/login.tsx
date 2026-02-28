import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async () => {
    try {
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Email and password required");
        return;
      }

      if (isLogin) {
        /* ================= LOGIN ================= */
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password.trim()
        );

        router.replace("/(tabs)/home");
      } else {
        /* ================= REGISTER ================= */

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        const baseUsername = trimmedEmail
          .split("@")[0]
          .toLowerCase();

        /* 🔐 CREATE AUTH USER FIRST */
        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            trimmedEmail,
            trimmedPassword
          );

        const uid = userCredential.user.uid;

        /* 🔥 CREATE USER PROFILE */
        await setDoc(doc(db, "users", uid), {
          email: trimmedEmail,
          username: baseUsername,
          usernameLowercase: baseUsername,
          bio: "",
          photoURL: "",
          createdAt: serverTimestamp(),
        });

        /* 🔥 CREATE DEFAULT WATCHLIST */
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
        setError(err.message);
      }
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
    <View style={styles.container}>
      <Text style={styles.title}>ReelSociety</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#888"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          style={styles.passwordInput}
        />

        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
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
      >
        <Text style={styles.buttonText}>
          {isLogin ? "Login" : "Register"}
        </Text>
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
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    padding: 30,
  },
  title: {
    fontSize: 32,
    color: "#e50914",
    marginBottom: 30,
    textAlign: "center",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#1c1c1c",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: "#fff",
    padding: 15,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  button: {
    backgroundColor: "#e50914",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  switchText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 15,
  },
  resetText: {
    color: "#e50914",
    textAlign: "center",
    marginTop: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});