import { useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";

import YoutubePlayer from "react-native-youtube-iframe";

import {
  IMAGE_BASE_URL,
  fetchMovieTrailer,
} from "../services/tmdb";

interface Props {
  item: any;
  width?: number;
  height?: number;
  onPress?: () => void;
}

export default function PreviewPoster({
  item,
  width = 140,
  height = 210,
  onPress,
}: Props) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const hoverTimeout = useRef<any>(null);

  /* ================= TRAILER PREVIEW ================= */

  const startPreview = async () => {
    hoverTimeout.current = setTimeout(async () => {
      if (!item?.id) return;

      const trailer = await fetchMovieTrailer(
        item.id.toString()
      );

      if (trailer) {
        setTrailerKey(trailer);
        setShowTrailer(true);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    }, 800);
  };

  const stopPreview = () => {
    clearTimeout(hoverTimeout.current);

    setShowTrailer(false);
    setTrailerKey(null);
    fadeAnim.setValue(0);
  };

  /* ================= PRESS ANIMATION ================= */

  const pressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  /* ================= IMAGE FADE ================= */

  const onImageLoad = () => {
    setImageLoaded(true);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  /* ================= POSTER URL ================= */

  const poster =
    item?.poster_path
      ? `${IMAGE_BASE_URL}${item.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Poster";

  /* ================= UI ================= */

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => {
          pressIn();
          startPreview();
        }}
        onPressOut={() => {
          pressOut();
          stopPreview();
        }}
        activeOpacity={0.9}
      >
        <View
          style={[
            styles.posterContainer,
            { width, height },
          ]}
        >
          {!showTrailer ? (
            <>
              {!imageLoaded && (
                <View
                  style={[
                    styles.skeleton,
                    { width, height },
                  ]}
                />
              )}

              <Animated.Image
                source={{ uri: poster }}
                style={[
                  styles.poster,
                  { width, height, opacity: fadeAnim },
                ]}
                onLoad={onImageLoad}
              />
            </>
          ) : (
            <Animated.View
              style={{ opacity: fadeAnim }}
            >
              <YoutubePlayer
                height={height}
                play={true}
                mute={true}
                videoId={trailerKey || ""}
                initialPlayerParams={{
                  controls: false,
                  autoplay: true,
                  modestbranding: true,
                  rel: false,
                }}
              />
            </Animated.View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  posterContainer: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#111",
    elevation: 6,
  },

  poster: {
    borderRadius: 14,
  },

  skeleton: {
    position: "absolute",
    backgroundColor: "#222",
    borderRadius: 14,
  },
});