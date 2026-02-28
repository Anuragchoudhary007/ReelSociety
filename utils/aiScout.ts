import { fetchByGenre } from '../services/tmdb';

export const findUnderratedGems = async (userGenreWeights: Record<string, number>) => {
  const topGenre = Object.keys(userGenreWeights).reduce((a, b) => 
    userGenreWeights[a] > userGenreWeights[b] ? a : b
  );

  const movies = await fetchByGenre(topGenre);

  const underrated = movies.filter((m: any) => 
    m.vote_average > 7.5 && m.vote_count < 500
  );

  return underrated.slice(0, 3);
};