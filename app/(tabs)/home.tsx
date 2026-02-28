import { useEffect, useState, useRef, useContext } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthProvider";
import { generateRecommendations } from "../../utils/recommendationEngine";
import PreviewPoster from "../../components/PreviewPoster";

import {
  fetchTrendingMovies,
  fetchLatestMovies,
  fetchTopIndia,
  fetchByGenre,
  fetchMovieTrailer,
  IMAGE_BASE_URL,
} from "../../services/tmdb";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 400;

export default function Home() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useContext(AuthContext);

  /* ================= STATES ================= */

  const [heroes, setHeroes] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [heroTrailer, setHeroTrailer] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [homeData, setHomeData] = useState<any>({});
  const [genreData, setGenreData] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("Home");

  /* ================= GENRES MAP ================= */

  const genres: any = {
    Home: null,
    Action: "28",
    Romance: "10749",
    Crime: "80",
    Comedy: "35",
    Thriller: "53",
    Family: "10751",
    Biography: "36",
  };

  /* ================= LOAD INITIAL DATA ================= */

  useEffect(() => {
    const loadData = async () => {
      const trending = await fetchTrendingMovies();
      setHeroes(trending.slice(0, 5));

      const data = {
        latest: await fetchLatestMovies(),
        topIndia: await fetchTopIndia(),
        action: await fetchByGenre("28"),
        romance: await fetchByGenre("10749"),
        crime: await fetchByGenre("80"),
        comedy: await fetchByGenre("35"),
        thriller: await fetchByGenre("53"),
        family: await fetchByGenre("10751"),
        biography: await fetchByGenre("36"),
      };

      setHomeData(data);
    };

    loadData();
  }, []);

  /* ================= LOAD AI RECOMMENDATIONS ================= */

  useEffect(() => {
    if (!user) return;

    const loadRecommendations = async () => {
      try {
        const snapshot = await getDocs(
collection(db, "users", user.uid, "lists")        );

        const watchlist = snapshot.docs.map((doc) => doc.data());
        const aiData = await generateRecommendations(watchlist);

        setRecommended(aiData);
      } catch (err) {
        console.log("AI Load Error:", err);
      }
    };

    loadRecommendations();
  }, [user]);

  /* ================= HERO TRAILER ================= */

  useEffect(() => {
    const hero = heroes[activeIndex];
    if (!hero) return;

    const loadTrailer = async () => {
      const trailer = await fetchMovieTrailer(hero.id.toString());
      setHeroTrailer(trailer);
    };

    loadTrailer();
  }, [activeIndex, heroes]);

  /* ================= GENRE SWITCH ================= */

  const handleGenre = async (genre: string) => {
    setSelectedGenre(genre);

    if (genre === "Home") {
      setGenreData([]);
      return;
    }

    const genreId = genres[genre];
    const data = await fetchByGenre(genreId);
    setGenreData(data);
  };

  /* ================= HERO FADE ================= */

  const heroFade = scrollY.interpolate({
    inputRange: [0, HERO_HEIGHT * 0.7],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  /* ================= HERO RENDER ================= */

  const renderHero = ({ item, index }: any) => (
    <View style={{ width, height: HERO_HEIGHT }}>
      {index === activeIndex && heroTrailer ? (
        <YoutubePlayer
          height={HERO_HEIGHT}
          play
          mute={isMuted}
          videoId={heroTrailer}
          initialPlayerParams={{
            controls: false,
            autoplay: true,
          }}
        />
      ) : (
        <Image
          source={{
            uri: `${IMAGE_BASE_URL}${item.backdrop_path}`,
          }}
          style={{ width, height: HERO_HEIGHT }}
        />
      )}

      <Animated.View
        style={[
          styles.fadeOverlay,
          { opacity: heroFade },
        ]}
      />

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.95)"]}
        style={styles.gradient}
      />

      <Text style={styles.heroTitle}>{item.title}</Text>

      <TouchableOpacity
        style={styles.playButton}
        onPress={() => router.push(`/movie/${item.id}`)}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          ▶ Play
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.muteButton}
        onPress={() => setIsMuted((prev) => !prev)}
      >
        <Text style={{ color: "#fff" }}>
          {isMuted ? "🔇" : "🔊"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.logo}>ReelSociety</Text>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
      >
        <FlatList
          data={heroes}
          horizontal
          pagingEnabled
          renderItem={renderHero}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setActiveIndex(
              Math.round(e.nativeEvent.contentOffset.x / width)
            )
          }
        />

        {recommended.length > 0 &&
          renderRow("🎯 For You", recommended, router)}

        {renderRow("🆕 Latest Releases", homeData.latest, router)}
        {renderRow("🇮🇳 Top 10 Today", homeData.topIndia, router)}
        {renderRow("💥 Action", homeData.action, router)}
        {renderRow("❤️ Romance", homeData.romance, router)}
        {renderRow("🔫 Crime", homeData.crime, router)}
        {renderRow("😂 Comedy", homeData.comedy, router)}
        {renderRow("🔥 Thriller", homeData.thriller, router)}
        {renderRow("👨‍👩‍👧 Family", homeData.family, router)}
        {renderRow("🎬 Biography", homeData.biography, router)}

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function renderRow(title: string, data: any[], router: any) {
  if (!data || data.length === 0) return null;

  return (
    <View style={{ marginTop: 25 }}>
      <Text style={styles.rowTitle}>{title}</Text>

      <FlatList
        horizontal
        data={data}
        keyExtractor={(item) => item?.id?.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) =>
          item?.poster_path ? (
            <View style={{ marginRight: 14 }}>
              <PreviewPoster
                item={item}
                width={135}
                height={205}
                onPress={() =>
                  router.push(`/movie/${item.id}`)
                }
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { paddingTop: 25, paddingHorizontal: 18 },
  logo: {
    color: "#e50914",
    fontSize: 24,
    fontWeight: "bold",
  },
  fadeOverlay: {
    position: "absolute",
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    height: 180,
    width: "100%",
  },
  heroTitle: {
    position: "absolute",
    bottom: 80,
    left: 20,
    color: "#fff",
    fontSize: 28,
    fontWeight: "bold",
    width: width * 0.8,
  },
  playButton: {
    position: "absolute",
    bottom: 35,
    left: 20,
    backgroundColor: "#e50914",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 30,
  },
  muteButton: {
    position: "absolute",
    right: 20,
    bottom: 40,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },
  rowTitle: {
    color: "#fff",
    fontSize: 18,
    marginLeft: 12,
    marginBottom: 10,
    fontWeight: "600",
  },
});
