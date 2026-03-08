import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ensure @expo/vector-icons is installed

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";

import { db } from "../../services/firebase";

export default function ActivityScreen() {

  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {

    const q = query(
      collection(db, "activity"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setActivity(data);

    });

  }, []);

  /* UPGRADED RENDER ITEM WITH ICONS AND DYNAMIC COLORS */
  const renderItem = ({ item }: any) => {

    let action = "";
    let actionColor = "#aaa";
    let iconName: any = "ellipsis-horizontal";

    if (item.type === "added_movie") {
      action = "added";
      actionColor = "#3b82f6"; // Blue
      iconName = "add-circle";
    }
    if (item.type === "watched_movie") {
      action = "watched";
      actionColor = "#22c55e"; // Green
      iconName = "checkmark-circle";
    }
    if (item.type === "rated_movie") {
      action = "rated";
      actionColor = "#eab308"; // Yellow
      iconName = "star";
    }

    const avatar = item.avatar || `https://api.dicebear.com/7.x/bottts/png?seed=${item.username}`;

    return (

      <View style={styles.card}>

        <Image
          source={{ uri: avatar }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>

          <Text style={styles.username}>
            {item.username}
          </Text>

          <View style={styles.actionRow}>
            <Ionicons name={iconName} size={14} color={actionColor} style={{ marginRight: 4 }} />
            <Text style={styles.actionBase}>
              <Text style={{ color: actionColor, fontWeight: "bold" }}>{action}</Text>
              {" "}{item.movieTitle}
            </Text>
          </View>

        </View>

        {item.poster && (

          <Image
            source={{
              uri: `https://image.tmdb.org/t/p/w500${item.poster}`
            }}
            style={styles.poster}
          />

        )}

      </View>

    );
  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Activity
      </Text>

      <FlatList
        data={activity}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 60,
    paddingHorizontal: 20
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 14,
    marginBottom: 14
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },

  username: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },

  actionBase: {
    color: "#eee",
    fontSize: 13,
  },

  poster: {
    width: 50,
    height: 75,
    borderRadius: 8
  }

});