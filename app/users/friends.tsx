import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image
} from "react-native";

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";
import { useRouter } from "expo-router";

export default function FriendsHub() {

  const router = useRouter();

  const [tab, setTab] = useState("friends");

  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  /* ================= LOAD FRIENDS ================= */

  useEffect(() => {

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "friends"),
      where("userId", "==", uid)
    );

    return onSnapshot(q, async (snapshot) => {

      const data: any[] = [];
      const seen = new Set();

      for (const docSnap of snapshot.docs) {

        const friendId = docSnap.data().friendId;

        if (seen.has(friendId)) continue;
        seen.add(friendId);

        const userSnap = await getDoc(doc(db, "users", friendId));

        if (userSnap.exists()) {

          data.push({
            id: friendId,
            username: userSnap.data().username || "User"
          });

        }

      }

      setFriends(data);

    });

  }, []);

  /* ================= LOAD REQUESTS ================= */

  useEffect(() => {

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "friendRequests"),
      where("receiverId", "==", uid)
    );

    return onSnapshot(q, async (snapshot) => {

      const data: any[] = [];

      for (const docSnap of snapshot.docs) {

        const senderId = docSnap.data().senderId;

        const userSnap = await getDoc(doc(db, "users", senderId));

        if (userSnap.exists()) {

          data.push({
            id: senderId,
            username: userSnap.data().username || "User"
          });

        }

      }

      setRequests(data);

    });

  }, []);

  /* ================= SEARCH USERS ================= */

  const searchUsers = async (text: string) => {

    setSearch(text);

    if (text.length < 2) {
      setUsers([]);
      return;
    }

    const snapshot = await getDocs(collection(db, "users"));

    const results = snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((u: any) =>
        u.username?.toLowerCase().includes(text.toLowerCase()) &&
        u.id !== auth.currentUser?.uid
      );

    setUsers(results);

  };

  /* ================= FRIEND LIST ================= */

  const renderFriends = () => {

    return (

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {

          const avatar =
            `https://api.dicebear.com/7.x/bottts/png?seed=${item.username}`;

          return (

            <TouchableOpacity
              style={styles.friendRow}
              onPress={() => router.push(`/users/${item.id}`)}
            >

              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />

              <Text style={styles.username}>
                {item.username}
              </Text>

            </TouchableOpacity>

          );

        }}
      />

    );

  };

  /* ================= REQUEST LIST ================= */

  const renderRequests = () => {

    return (

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {

          const avatar =
            `https://api.dicebear.com/7.x/bottts/png?seed=${item.username}`;

          return (

            <View style={styles.friendRow}>

              <Image
                source={{ uri: avatar }}
                style={styles.avatar}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.username}>
                  {item.username}
                </Text>
              </View>

              <TouchableOpacity style={styles.acceptBtn}>
                <Text style={styles.acceptText}>
                  Accept
                </Text>
              </TouchableOpacity>

            </View>

          );

        }}
      />

    );

  };

  /* ================= SEARCH ================= */

  const renderSearch = () => {

    return (

      <View style={{ flex: 1 }}>

        <TextInput
          placeholder="Search users..."
          placeholderTextColor="#777"
          style={styles.input}
          value={search}
          onChangeText={searchUsers}
        />

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {

            const avatar =
              `https://api.dicebear.com/7.x/bottts/png?seed=${item.username}`;

            return (

              <TouchableOpacity
                style={styles.friendRow}
                onPress={() => router.push(`/users/${item.id}`)}
              >

                <Image
                  source={{ uri: avatar }}
                  style={styles.avatar}
                />

                <Text style={styles.username}>
                  {item.username}
                </Text>

              </TouchableOpacity>

            );

          }}
        />

      </View>

    );

  };

  /* ================= UI ================= */

  return (

    <View style={styles.container}>

      <Text style={styles.header}>
        Friends
      </Text>

      <View style={styles.tabs}>

        <TabBtn
          title="Friends"
          active={tab === "friends"}
          onPress={() => setTab("friends")}
        />

        <TabBtn
          title="Find"
          active={tab === "search"}
          onPress={() => setTab("search")}
        />

        <TabBtn
          title="Requests"
          active={tab === "requests"}
          onPress={() => setTab("requests")}
        />

      </View>

      {tab === "friends" && renderFriends()}
      {tab === "search" && renderSearch()}
      {tab === "requests" && renderRequests()}

    </View>

  );

}

/* ================= TAB BUTTON ================= */

function TabBtn({ title, active, onPress }: any) {

  return (

    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        active && { borderBottomColor: "#e50914" }
      ]}
    >

      <Text
        style={[
          styles.tabText,
          active && { color: "#fff" }
        ]}
      >
        {title}
      </Text>

    </TouchableOpacity>

  );

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 20
  },

  header: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20
  },

  tabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20
  },

  tab: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },

  tabText: {
    color: "#777",
    fontSize: 16
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#111"
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 15,
    backgroundColor: "#111"
  },

  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500"
  },

  input: {
    backgroundColor: "#111",
    color: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 16
  },

  acceptBtn: {
    backgroundColor: "#e50914",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },

  acceptText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13
  }

});