import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { onSnapshot, doc, getDoc } from "firebase/firestore";
import { getFriendRequestsQuery } from "../../services/notifications";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../services/firebase";
import { getUserLists } from "../../services/lists";
import { useRouter } from "expo-router";
import { listenToFriendCount } from "../../services/friends";

export default function ProfileScreen() {
  const router = useRouter();

  const [watchlistCount, setWatchlistCount] = useState(0);
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [requestCount, setRequestCount] = useState(0);

  /* ================= FRIEND COUNT ================= */
  useEffect(() => {
    const unsubscribe = listenToFriendCount(setFriendCount);
    return unsubscribe;
  }, []);

  /* ================= REALTIME FRIEND REQUEST BADGE ================= */
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = getFriendRequestsQuery(uid);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequestCount(snapshot.size);
    });

    return unsubscribe;
  }, []);

  /* ================= LOAD PROFILE + LISTS ================= */
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        const lists = await getUserLists();
        setWatchlistCount(lists.length);

        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setUserData(snap.data());
        }
      } catch (err) {
        console.log("Profile Load Error:", err);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/login");
  };

  /* ================= DELETE ACCOUNT ================= */
  const handleDelete = () => {
    Alert.alert("Delete Account", "This action is permanent.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const user = auth.currentUser;
          if (user) {
            await user.delete();
            router.replace("/login");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#e50914" />
      </View>
    );
  }

  const user = auth.currentUser;

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#141414", "#000"]} style={styles.header}>
        <BlurView intensity={40} tint="dark">
          <View style={styles.profileSection}>
            <View style={styles.avatarWrapper}>
              <Image
                source={{
                  uri:
                    user?.photoURL ||
                    "https://ui-avatars.com/api/?name=" +
                      user?.email,
                }}
                style={styles.avatar}
              />
            </View>

            <Text style={styles.name}>
              {userData?.username || "ReelSociety User"}
            </Text>

            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </BlurView>
      </LinearGradient>

      {/* ================= STATS ================= */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {watchlistCount}
          </Text>
          <Text style={styles.statLabel}>Lists</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {friendCount}
          </Text>
          <Text style={styles.statLabel}>Friends</Text>
        </View>
      </View>

      {/* ================= ACTIONS ================= */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/users/friends")}
        >
          <Text style={styles.secondaryText}>Friends</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/users/search")}
        >
          <Text style={styles.secondaryText}>
            Find Friends
          </Text>
        </TouchableOpacity>

        {/* Friend Request Button With Badge */}
        <View style={{ position: "relative", marginBottom: 15 }}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/users/requests")}
          >
            <Text style={styles.secondaryText}>
              Friend Requests
            </Text>
          </TouchableOpacity>

          {requestCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {requestCount}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleLogout}
        >
          <Text style={styles.primaryText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={handleDelete}
        >
          <Text style={styles.dangerText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    paddingTop: 90,
    paddingBottom: 40,
    alignItems: "center",
  },

  profileSection: { alignItems: "center" },

  avatarWrapper: {
    borderWidth: 2,
    borderColor: "#e50914",
    borderRadius: 70,
    padding: 4,
    marginBottom: 15,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  email: {
    color: "#aaa",
    marginTop: 5,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    gap: 20,
  },

  statCard: {
    backgroundColor: "#111",
    paddingVertical: 22,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
  },

  statNumber: {
    color: "#e50914",
    fontSize: 24,
    fontWeight: "bold",
  },

  statLabel: {
    color: "#aaa",
    marginTop: 6,
  },

  actions: {
    marginTop: 50,
    paddingHorizontal: 30,
  },

  primaryBtn: {
    backgroundColor: "#e50914",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },

  primaryText: {
    color: "#fff",
    fontWeight: "bold",
  },

  dangerBtn: {
    borderColor: "#ff4444",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  dangerText: {
    color: "#ff4444",
  },

  secondaryBtn: {
    borderColor: "#333",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 15,
  },

  secondaryText: {
    color: "#fff",
    fontWeight: "600",
  },

  badge: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "red",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});