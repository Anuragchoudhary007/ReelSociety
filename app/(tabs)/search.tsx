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
  fetchTrendingSearch,
  searchMulti,
  IMAGE_BASE_URL
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

  const scaleAnim = useRef(new Animated.Value(1)).current;

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

      if (data) {
        setTrending(data.slice(0, 10));
      }

    };

    load();

  }, []);

  /* ================= LOAD RECENT ================= */

  useEffect(() => {

    const loadRecent = async () => {

      const stored = await AsyncStorage.getItem(RECENT_KEY);

      if (stored) {
        setRecent(JSON.parse(stored));
      }

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

    }, 350);

    return () => clearTimeout(timeout);

  }, [query, category]);

  /* ================= NAVIGATION ================= */

  const handlePress = (item: any) => {

    saveRecent(item);

    if (item.media_type === "person") {
      router.push(`/person/${item.id}`);
    } else {
      router.push(`/movie/${item.id}`);
    }

  };

  /* ================= POSTER ANIMATION ================= */

  const pressIn = () => {

    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

  };

  const pressOut = () => {

    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

  };

  /* ================= UI ================= */

  return (

    <View style={styles.container}>

      {/* HEADER */}

      <BlurView intensity={40} tint="dark" style={styles.blurHeader}>

        <TextInput
          placeholder="Search movies, shows, people"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
        />

        {/* CATEGORY FILTER */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 10 }}
        >

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

        </ScrollView>

      </BlurView>

      {/* ================= DEFAULT MODE ================= */}

      {!query && (

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* RECENT SEARCHES */}

          {recent.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                🕘 Recent
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 15 }}
              >

                {recent.map((item) => (

                  <View
                    key={item.id}
                    style={{ marginRight: 14 }}
                  >

                    <TouchableOpacity
                      onPress={() => handlePress(item)}
                    >

                      <Image
                        source={{
                          uri:
                            item.poster_path || item.profile_path
                              ? `${IMAGE_BASE_URL}${item.poster_path || item.profile_path}`
                              : undefined,
                        }}
                        style={styles.smallPoster}
                      />

                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.clearButton}
                      onPress={() => removeRecent(item.id)}
                    >

                      <Text style={{ color: "#fff" }}>
                        ✕
                      </Text>

                    </TouchableOpacity>

                  </View>

                ))}

              </ScrollView>
            </>
          )}

          {/* TRENDING */}

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
                onPress={() => handlePress(item)}
                style={{ marginRight: 14 }}
              >

                <Image
                  source={{
                    uri:
                      item.poster_path || item.profile_path
                        ? `${IMAGE_BASE_URL}${item.poster_path || item.profile_path}`
                        : undefined,
                  }}
                  style={styles.smallPoster}
                />

              </TouchableOpacity>

            ))}

          </ScrollView>

        </ScrollView>

      )}

      {/* ================= SEARCH RESULTS ================= */}

      {query !== "" && (

        <FlatList
          data={results}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => {

            const imagePath =
              item.backdrop_path ||
              item.poster_path ||
              item.profile_path;

            return (

              <Animated.View
                style={{
                  transform: [{ scale: scaleAnim }],
                }}
              >

                <TouchableOpacity
                  onPress={() => handlePress(item)}
                  onPressIn={pressIn}
                  onPressOut={pressOut}
                  style={styles.premiumCard}
                >

                  <Image
                    source={{
                      uri: imagePath
                        ? `${IMAGE_BASE_URL}${imagePath}`
                        : undefined,
                    }}
                    style={styles.premiumImage}
                  />

                  <View style={styles.overlay} />

                  <View style={styles.cardContent}>

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

              </Animated.View>

            );

          }}
        />

      )}

    </View>

  );

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#000"
  },

  blurHeader:{
    paddingTop:60,
    paddingBottom:15,
    paddingHorizontal:15
  },

  searchInput:{
    backgroundColor:"#1a1a1a",
    borderRadius:25,
    paddingHorizontal:18,
    height:45,
    color:"#fff"
  },

  categoryBtn:{
    paddingHorizontal:14,
    paddingVertical:6,
    borderRadius:20,
    borderWidth:1,
    borderColor:"#555",
    marginRight:8
  },

  categoryActive:{
    backgroundColor:"#e50914",
    borderColor:"#e50914"
  },

  catText:{
    color:"#fff",
    textTransform:"capitalize"
  },

  sectionTitle:{
    color:"#fff",
    fontSize:18,
    marginLeft:15,
    marginBottom:15,
    marginTop:20,
    fontWeight:"600"
  },

  smallPoster:{
    width:130,
    height:180,
    borderRadius:16,
    backgroundColor:"#111"
  },

  clearButton:{
    position:"absolute",
    top:8,
    right:8,
    backgroundColor:"rgba(0,0,0,0.75)",
    width:24,
    height:24,
    borderRadius:12,
    justifyContent:"center",
    alignItems:"center"
  },

  premiumCard:{
    width:width-30,
    height:220,
    alignSelf:"center",
    borderRadius:20,
    overflow:"hidden",
    marginBottom:25,
    backgroundColor:"#111"
  },

  premiumImage:{
    width:"100%",
    height:"100%",
    position:"absolute"
  },

  overlay:{
    position:"absolute",
    bottom:0,
    width:"100%",
    height:"70%",
    backgroundColor:"rgba(0,0,0,0.8)"
  },

  cardContent:{
    position:"absolute",
    bottom:20,
    left:20
  },

  premiumTitle:{
    color:"#fff",
    fontSize:22,
    fontWeight:"bold"
  },

  mediaTypeText:{
    color:"#aaa",
    fontSize:13,
    marginTop:4,
    letterSpacing:1
  }

});