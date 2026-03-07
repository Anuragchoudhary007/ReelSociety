import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";

import { useLocalSearchParams } from "expo-router";
import YoutubePlayer from "react-native-youtube-iframe";
import Modal from "react-native-modal";

import {
  fetchMovieDetails,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "../../services/tmdb";

import {
  getUserLists,
  getListItems,
  addItemToList,
  removeItemFromList,
} from "../../services/lists";

export default function MovieDetails() {
  const { id } = useLocalSearchParams();

  const [movie, setMovie] = useState<any>(null);
  const [exists, setExists] = useState(false);
  const [listId, setListId] = useState<string | null>(null);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  const [heartAnim] = useState(new Animated.Value(0));
  const [burstAnim] = useState(new Animated.Value(0));
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    load(id.toString());
  }, [id]);

  const load = async (movieId: string) => {
    try {
      const data = await fetchMovieDetails(movieId);

      if (!data || !data.id) {
        console.log("Invalid movie data");
        setLoading(false);
        return;
      }

      setMovie(data);

      const trailer = await fetchMovieTrailer(movieId);
      setTrailerKey(trailer);

      // Get user lists
      const lists = await getUserLists();
      if (lists.length === 0) {
        setLoading(false);
        return;
      }

      const firstList = lists[0];
      setListId(firstList.id);

      // Check if movie already exists
      const items = await getListItems(firstList.id);
      const found = items.some(
        (item: any) => item.id === movieId
      );

      setExists(found);

    } catch (e) {
      console.log("Load error:", e);
    }

    setLoading(false);
  };

  const toggleWatchlist = async () => {
    if (!movie || !movie.id || !listId) return;

    if (exists) {
      await removeItemFromList(
        listId,
String(movie?.id)
      );
      setExists(false);
      return;
    }

    await addItemToList(
      listId,
      movie,
      Date.now()
    );

    setExists(true);

    // ❤️ Heart Animation
    setShowHeart(true);

    Animated.parallel([
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(burstAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      heartAnim.setValue(0);
      burstAnim.setValue(0);
      setShowHeart(false);
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#e50914"
        />
      </View>
    );
  }

  if (!movie) return null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Image
          source={{
            uri: `${IMAGE_BASE_URL}${movie.poster_path}`,
          }}
          style={styles.poster}
        />

        <Text style={styles.title}>
          {movie.title}
        </Text>

        <Text style={styles.rating}>
          ⭐ {movie.vote_average}
        </Text>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: exists
                ? "#555"
                : "#e50914",
            },
          ]}
          onPress={toggleWatchlist}
        >
          <Text style={styles.buttonText}>
            {exists
              ? "✓ Added (Remove)"
              : "Add to Watchlist"}
          </Text>
        </TouchableOpacity>

        {trailerKey && (
          <TouchableOpacity
            style={styles.trailerButton}
            onPress={() =>
              setShowTrailer(true)
            }
          >
            <Text style={styles.buttonText}>
              🎬 Watch Trailer
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.overview}>
          {movie.overview}
        </Text>
      </ScrollView>

      {/* ❤️ Heart Animation */}
      {showHeart && (
        <View style={StyleSheet.absoluteFill}>
          <Animated.Text
            style={{
              position: "absolute",
              alignSelf: "center",
              top: "40%",
              fontSize: 90,
              opacity: heartAnim,
              transform: [
                {
                  scale:
                    heartAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1.6],
                    }),
                },
              ],
            }}
          >
            ❤️
          </Animated.Text>
        </View>
      )}

      {/* 🎬 Trailer Modal */}
      <Modal
        isVisible={showTrailer}
        onBackdropPress={() =>
          setShowTrailer(false)
        }
        style={styles.modal}
        backdropOpacity={0.85}
      >
        <View style={styles.modalContent}>
          <YoutubePlayer
            height={230}
            play={true}
            videoId={trailerKey || ""}
          />

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() =>
              setShowTrailer(false)
            }
          >
            <Text style={{ color: "#fff" }}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 10,
  },
  poster: {
    width: "100%",
    height: 450,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 10,
  },
  rating: {
    color: "gold",
    marginVertical: 5,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  trailerButton: {
    backgroundColor: "#222",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  overview: {
    color: "#fff",
    marginTop: 15,
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "#111",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    backgroundColor: "#e50914",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
});