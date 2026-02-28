export const calculateGenreScores = (
  history: any[]
) => {
  const scores: any = {};

  history.forEach((movie) => {
    if (!movie.genres) return;

    movie.genres.forEach((genre: number) => {
      scores[genre] = (scores[genre] || 0) + 1;
    });
  });

  return scores;
};

