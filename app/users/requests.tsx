import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import {
  listenToIncomingRequests,
  acceptRequest,
} from "../../services/friends";

export default function RequestsScreen() {
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe =
      listenToIncomingRequests(setRequests);

    return unsubscribe;
  }, []);

  if (requests.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>
          No friend requests
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: "#000", paddingTop: 40 }}
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.text}>
            From: {item.senderUsername}
          </Text>

          <TouchableOpacity
            onPress={() => acceptRequest(item)}
          >
            <Text style={styles.accept}>
              Accept
            </Text>
          </TouchableOpacity>
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
  accept: {
    color: "#00ff88",
    marginTop: 10,
  },
  card: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
});