// import {
//   doc,
//   setDoc,
//   deleteDoc,
//   getDoc,
//   collection,
//   getDocs,
// } from "firebase/firestore";
// import { db, auth } from "./firebase";

// /* ================= ADD ================= */

// export const addToWatchlist = async (movie: any) => {
//   const user = auth.currentUser;

//   if (!user) return;
//   if (!movie?.id) return;

//   const movieRef = doc(
//     db,
//     "users",
//     user.uid,
//     "watchlists",
//     "default",
//     "movies",
//     String(movie.id)
//   );

//   await setDoc(movieRef, {
//     ...movie,
//     addedAt: Date.now(),
//   });
// };

// /* ================= REMOVE ================= */

// export const removeFromWatchlist = async (
//   movieId: string
// ) => {
//   const user = auth.currentUser;
//   if (!user) return;

//   const movieRef = doc(
//     db,
//     "users",
//     user.uid,
//     "watchlists",
//     "default",
//     "movies",
//     String(movieId)
//   );

//   await deleteDoc(movieRef);
// };

// /* ================= CHECK ================= */

// export const isMovieInWatchlist = async (
//   movieId: string
// ) => {
//   const user = auth.currentUser;
//   if (!user) return false;

//   const movieRef = doc(
//     db,
//     "users",
//     user.uid,
//     "watchlists",
//     "default",
//     "movies",
//     String(movieId)
//   );

//   const snap = await getDoc(movieRef);
//   return snap.exists();
// };

// /* ================= GET ================= */

// export const getUserWatchlist = async () => {
//   const user = auth.currentUser;
//   if (!user) return [];

//   const moviesRef = collection(
//     db,
//     "users",
//     user.uid,
//     "watchlists",
//     "default",
//     "movies"
//   );

//   const snapshot = await getDocs(moviesRef);

//   return snapshot.docs.map((doc) => ({
//     id: doc.id,
//     ...doc.data(),
//   }));
// };
