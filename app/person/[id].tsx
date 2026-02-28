import { useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useEffect, useState } from "react";
import {
  fetchPersonCredits,
  IMAGE_BASE_URL,
} from "../../services/tmdb";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function PersonScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [credits, setCredits] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchPersonCredits(id as string);

      const filtered = data.filter(
        (item: any) => item.poster_path
      );

      setCredits(filtered);
    };

    load();
  }, [id]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Filmography</Text>

      <FlatList
        data={credits}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push(`/movie/${item.id}`)
            }
            style={styles.card}
          >
            <Image
              source={{
                uri: `${IMAGE_BASE_URL}${item.poster_path}`,
              }}
              style={styles.poster}
            />
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
    paddingTop: 60,
  },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 15,
    marginBottom: 20,
  },

  card: {
    flex: 1,
    margin: 5,
  },

  poster: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
});
