import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../../services/firebase";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function FriendProfile() {
  const { uid } = useLocalSearchParams();
  const router = useRouter();

  const [userData, setUserData] = useState<any>(null);
  const [lists, setLists] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const userSnap = await getDoc(
        doc(db, "users", uid as string)
      );

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      const listsSnap = await getDocs(
        collection(db, "users", uid as string, "lists")
      );

      const publicLists: any[] = [];

      listsSnap.forEach((docSnap) => {
        const data = docSnap.data();

        if (data.isPublic) {
          publicLists.push({
            id: docSnap.id,
            ...data,
          });
        }
      });

      setLists(publicLists);
    };

    load();
  }, []);

  if (!userData) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.username}>
        {userData.username}
      </Text>

      <Text style={styles.section}>
        Public Lists
      </Text>

      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push(
                `/users/${uid}/list/${item.id}`
              )
            }
          >
            <Text style={styles.title}>
              {item.title}
            </Text>

            {item.isPublic && (
              <Text style={styles.public}>
                🌍 Public
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 20,
  },
  username: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    color: "#e50914",
    fontSize: 18,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#111",
    padding: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  public: {
    color: "#e50914",
    marginTop: 10,
  },
});