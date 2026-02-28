import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getUserLists, getListItems } from "../../services/lists";
import { IMAGE_BASE_URL } from "../../services/tmdb";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = width / 3 - 16;

export default function WatchlistScreen() {
  const router = useRouter();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoading(true);

        const lists = await getUserLists();

        if (lists.length === 0) {
          setMovies([]);
          setLoading(false);
          return;
        }

        // Get first list (My Watchlist)
        const firstList = lists[0];
        const items = await getListItems(firstList.id);

        setMovies(items);
        setLoading(false);
      };

      load();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#e50914" />
      </View>
    );
  }

  if (movies.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          🎬 Your Watchlist is Empty
        </Text>
        <Text style={styles.subText}>
          Save movies to watch later
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Watchlist</Text>

      <FlatList
        data={movies}
        numColumns={3}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <TouchableOpacity
              onPress={() => router.push(`/movie/${item.id}`)}
            >
              <Image
                source={{
                  uri: item.poster_path
                    ? `${IMAGE_BASE_URL}${item.poster_path}`
                    : undefined,
                }}
                style={styles.poster}
              />
            </TouchableOpacity>
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
    paddingHorizontal: 8,
    paddingTop: 60,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    marginLeft: 10,
  },
  cardWrapper: {
    width: ITEM_WIDTH,
    margin: 4,
  },
  poster: {
    width: "100%",
    height: 170,
    borderRadius: 14,
    backgroundColor: "#111",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "#888",
    marginTop: 6,
  },
});