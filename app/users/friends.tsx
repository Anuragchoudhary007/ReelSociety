import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import {
  onSnapshot,
  collection,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";
import { removeFriend } from "../../services/friends";
import { useRouter } from "expo-router";

export default function FriendsScreen() {
  const [friends, setFriends] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "friends"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const enriched = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();

          const userSnap = await getDoc(
            doc(db, "users", data.friendId)
          );

          return {
            id: docSnap.id,
            friendId: data.friendId,
            username: userSnap.exists()
              ? userSnap.data().username
              : "Unknown",
          };
        })
      );

      setFriends(enriched);
    });

    return unsubscribe;
  }, []);

  if (friends.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>No friends yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: "#000", paddingTop: 40 }}
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.text}>{item.username}</Text>

          <View style={{ flexDirection: "row", gap: 20 }}>
            <TouchableOpacity
              onPress={() =>
                router.push(`/users/${item.friendId}`)
              }
            >
              <Text style={styles.view}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => removeFriend(item.friendId)}
            >
              <Text style={styles.remove}>Remove</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "#fff" },
  card: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  remove: { color: "red" },
  view: { color: "#00ff88" },
});