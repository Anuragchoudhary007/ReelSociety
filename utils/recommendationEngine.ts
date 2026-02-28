import {
  fetchByGenre,
  fetchTrendingMovies,
} from "../services/tmdb";

/* ===============================
   1️⃣ Calculate Genre Scores
================================ */

const calculateGenreScores = (history: any[]) => {
  const scores: any = {};

  history.forEach((movie) => {
    if (!movie.genre_ids) return;

    movie.genre_ids.forEach((genreId: number) => {
      scores[genreId] = (scores[genreId] || 0) + 1;
    });
  });

  return scores;
};

/* ===============================
   2️⃣ Hybrid Recommendation Engine
================================ */

export const generateRecommendations = async (
  history: any[]
) => {
  // If no history → fallback to trending
  if (!history || history.length === 0) {
    return await fetchTrendingMovies();
  }

  const genreScores = calculateGenreScores(history);

  const sortedGenres = Object.entries(genreScores)
    .sort((a: any, b: any) => b[1] - a[1])
    .map((item: any) => item[0]);

  if (!sortedGenres.length) {
    return await fetchTrendingMovies();
  }

  // 🔥 Use top 2 genres for more diversity
  const topGenres = sortedGenres.slice(0, 2);

  let recommendations: any[] = [];

  for (const genreId of topGenres) {
    const data = await fetchByGenre(genreId);
    recommendations = [...recommendations, ...data];
  }

  /* Remove movies already watched */
  const watchedIds = history.map(
    (movie) => movie.id
  );

  recommendations = recommendations.filter(
    (movie) => !watchedIds.includes(movie.id)
  );

  /* Remove duplicates */
  const uniqueMovies = Array.from(
    new Map(
      recommendations.map((movie) => [
        movie.id,
        movie,
      ])
    ).values()
  );

  return uniqueMovies.slice(0, 15);
};

/* ===============================
   3️⃣ Because You Watched
================================ */

export const getBecauseYouWatched = async (
  movie: any
) => {
  if (!movie?.genre_ids?.length) return [];

  const primaryGenre = movie.genre_ids[0];

  const similar = await fetchByGenre(primaryGenre);

  const filtered = similar.filter(
    (m: any) => m.id !== movie.id
  );

  return filtered.slice(0, 12);
};
