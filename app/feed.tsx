import { useEffect, useState } from "react";
import { View, Text, FlatList, Image } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebase";

export default function Feed() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", uid, "activity"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => doc.data());
        setActivities(data.reverse());
      }
    );

    return unsubscribe;
  }, []);

  return (
    <FlatList
      style={{ backgroundColor: "#000", padding: 20 }}
      data={activities}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: "#fff" }}>
            You added {item.title}
          </Text>
          <Image
            source={{ uri: item.poster_path }}
            style={{ width: 80, height: 120 }}
          />
        </View>
      )}
    />
  );
}