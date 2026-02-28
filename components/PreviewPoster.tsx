import { useState, useRef } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { IMAGE_BASE_URL, fetchMovieTrailer } from "../services/tmdb";

interface Props {
  item: any;
  width?: number;
  height?: number;
  onPress?: () => void;
}

export default function PreviewPoster({
  item,
  width = 135,
  height = 205,
  onPress,
}: Props) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const hoverTimeout = useRef<any>(null);

  const startPreview = async () => {
    hoverTimeout.current = setTimeout(async () => {
      const trailer = await fetchMovieTrailer(item.id.toString());

      if (trailer) {
        setTrailerKey(trailer);
        setShowTrailer(true);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, 800); // 800ms hover delay
  };

  const stopPreview = () => {
    clearTimeout(hoverTimeout.current);

    setShowTrailer(false);
    setTrailerKey(null);
    fadeAnim.setValue(0);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={startPreview}
      onPressOut={stopPreview}
      activeOpacity={0.9}
    >
      <View style={{ width, height }}>
        {!showTrailer ? (
          <Image
            source={{
              uri: `${IMAGE_BASE_URL}${item.poster_path}`,
            }}
            style={{ width, height, borderRadius: 12 }}
          />
        ) : (
          <Animated.View style={{ opacity: fadeAnim }}>
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
  );
}
