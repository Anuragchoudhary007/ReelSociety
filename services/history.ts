import {
  doc,
  setDoc,
  collection,
} from "firebase/firestore";
import { db, auth } from "./firebase";

export const trackWatch = async (
  movie: any,
  percentWatched: number
) => {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(
    db,
    "watchHistory",
    user.uid,
    "movies",
    movie.id.toString()
  );

  await setDoc(ref, {
    title: movie.title,
    poster_path: movie.poster_path,
    genres: movie.genre_ids,
    completionPercent: percentWatched,
    watchedAt: Date.now(),
  });
};
