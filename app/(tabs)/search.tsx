import { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  Animated,
  ScrollView,
  Dimensions,
} from "react-native";

import { useRouter, useFocusEffect } from "expo-router";
import { BlurView } from "expo-blur";
import {
  searchMulti,
  fetchTrendingSearch,
  IMAGE_BASE_URL,
} from "../../services/tmdb";

import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const RECENT_KEY = "RECENT_SEARCHES";

export default function SearchScreen() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [recent, setRecent] = useState<any[]>([]);

  /* ================= RESET WHEN TAB FOCUSED ================= */

  useFocusEffect(
    useCallback(() => {
      setQuery("");
      setResults([]);
    }, [])
  );

  /* ================= LOAD TRENDING ================= */

  useEffect(() => {
    const load = async () => {
      const data = await fetchTrendingSearch();
      setTrending(data.slice(0, 10));
    };
    load();
  }, []);

  /* ================= LOAD RECENT ================= */

  useEffect(() => {
    const loadRecent = async () => {
      const stored = await AsyncStorage.getItem(RECENT_KEY);
      if (stored) setRecent(JSON.parse(stored));
    };
    loadRecent();
  }, []);

  /* ================= SAVE RECENT ================= */

  const saveRecent = async (item: any) => {
    if (!item?.id) return;

    const updated = [
      item,
      ...recent.filter((r) => r.id !== item.id),
    ].slice(0, 10);

    setRecent(updated);

    await AsyncStorage.setItem(
      RECENT_KEY,
      JSON.stringify(updated)
    );
  };

  const removeRecent = async (id: number) => {
    const updated = recent.filter((r) => r.id !== id);
    setRecent(updated);
    await AsyncStorage.setItem(
      RECENT_KEY,
      JSON.stringify(updated)
    );
  };

  /* ================= SEARCH ================= */

  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      let data = await searchMulti(query);

      if (category !== "all") {
        data = data.filter(
          (item: any) => item.media_type === category
        );
      }

      setResults(data);
    }, 400);

    return () => clearTimeout(timeout);
  }, [query, category]);

  /* ================= NAVIGATION HELPER ================= */

  const handlePress = (item: any) => {
    saveRecent(item);

    if (item.media_type === "person") {
      router.push(`/person/${item.id}`);
    } else {
      router.push(`/movie/${item.id}`);
    }
  };

  /* ================= RENDER ================= */

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER */}
      <BlurView intensity={40} tint="dark" style={styles.blurHeader}>
        <TextInput
          placeholder="Search movies, shows, people"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />

        <View style={styles.categoryRow}>
          {["all", "movie", "tv", "person"].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[
                styles.categoryBtn,
                category === cat && styles.categoryActive,
              ]}
            >
              <Text style={styles.catText}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>

      {/* ================= DEFAULT MODE ================= */}
      {!query && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* 🕘 RECENT SEARCHES */}
          {recent.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>
                🕘 Recent Searches
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15 }}
              >
                {recent.map((item, index) => (
                  <View
                    key={`${item.id}-${index}`}
                    style={{ marginRight: 15 }}
                  >
                    <TouchableOpacity
                      onPress={() => handlePress(item)}
                    >
                      <Image
                        source={{
                          uri:
                            item.poster_path ||
                            item.profile_path
                              ? `${IMAGE_BASE_URL}${item.poster_path || item.profile_path}`
                              : "https://via.placeholder.com/300x450/111111/ffffff?text=No+Image",
                        }}
                        style={styles.smallPoster}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        removeRecent(item.id)
                      }
                      style={styles.clearButton}
                    >
                      <Text style={{ color: "#fff" }}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 🔥 TRENDING */}
          <View style={{ marginTop: 25 }}>
            <Text style={styles.sectionTitle}>
              🔥 Trending
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 15 }}
            >
              {trending.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{ marginRight: 15 }}
                  onPress={() => handlePress(item)}
                >
                  <Image
                    source={{
                      uri:
                        item.poster_path ||
                        item.profile_path
                          ? `${IMAGE_BASE_URL}${item.poster_path || item.profile_path}`
                          : undefined,
                    }}
                    style={styles.smallPoster}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      )}

      {/* ================= SEARCH RESULTS MODE ================= */}
      {query !== "" && (
        <FlatList
          data={results}
          keyExtractor={(item) =>
            item.id?.toString()
          }
          contentContainerStyle={{
            paddingBottom: 120,
          }}
          renderItem={({ item }) => {
            const imagePath =
              item.backdrop_path ||
              item.poster_path ||
              item.profile_path;

            return (
              <TouchableOpacity
                style={styles.premiumCard}
                onPress={() => handlePress(item)}
              >
                <Image
                  source={{
                    uri: imagePath
                      ? `${IMAGE_BASE_URL}${imagePath}`
                      : undefined,
                  }}
                  style={styles.premiumImage}
                />

                <View style={styles.gradientOverlay} />

                <View style={styles.premiumContent}>
                  <Text
                    style={styles.premiumTitle}
                    numberOfLines={1}
                  >
                    {item.title || item.name}
                  </Text>

                  <Text style={styles.mediaTypeText}>
                    {item.media_type?.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  blurHeader: {
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },

  searchInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 45,
    color: "#fff",
  },

  categoryRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#555",
    marginRight: 8,
  },

  categoryActive: {
    backgroundColor: "#e50914",
    borderColor: "#e50914",
  },

  catText: {
    color: "#fff",
    textTransform: "capitalize",
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 15,
    marginBottom: 15,
    fontWeight: "600",
  },

  smallPoster: {
    width: 130,
    height: 180,
    borderRadius: 16,
    backgroundColor: "#111",
  },

  clearButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.75)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  premiumCard: {
    width: width - 30,
    height: 220,
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 25,
    backgroundColor: "#111",
  },

  premiumImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },

  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "70%",
    backgroundColor: "rgba(0,0,0,0.8)",
  },

  premiumContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },

  premiumTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  mediaTypeText: {
    color: "#aaa",
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 1,
  },
});
