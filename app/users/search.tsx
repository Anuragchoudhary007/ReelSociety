import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";
import {
  sendFriendRequest,
  cancelFriendRequest,
} from "../../services/friends";

export default function SearchUsersScreen() {
  const [username, setUsername] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  /* Listen to my sent requests */
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "friendRequests"),
where("senderId", "==", user.uid)    );

    return onSnapshot(q, (snapshot) => {
      setSentRequests(
  snapshot.docs.map((doc) => doc.data().receiverId)
);
    });
  }, []);

  const searchUsers = async () => {
    if (!username.trim()) return;

    const value = username.toLowerCase();

    const q = query(
      collection(db, "users"),
      where("usernameLowercase", ">=", value),
      where("usernameLowercase", "<=", value + "\uf8ff")
    );

    const snapshot = await getDocs(q);

    const data: any[] = [];
    snapshot.forEach((doc) => {
      if (doc.id !== auth.currentUser?.uid) {
        data.push({ id: doc.id, ...doc.data() });
      }
    });

    setResults(data);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search username..."
        placeholderTextColor="#888"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        onSubmitEditing={searchUsers}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.username}>
              {item.username}
            </Text>

            {sentRequests.includes(item.id) ? (
              <TouchableOpacity
                onPress={() =>
                  cancelFriendRequest(item.id)
                }
              >
                <Text style={styles.cancel}>
                  Cancel
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  sendFriendRequest(item.id)
                }
              >
                <Text style={styles.add}>
                  Add Friend
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  input: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    marginBottom: 20,
  },
  card: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  username: { color: "#fff" },
  add: { color: "#e50914" },
  cancel: { color: "orange" },
});