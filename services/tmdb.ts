const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

export const IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w780";

/* ================= FETCH HELPER ================= */

const fetchData = async (
  endpoint: string,
  params: string = ""
) => {
  try {
    const response = await fetch(
      `${BASE_URL}${endpoint}?api_key=${API_KEY}${params}`
    );

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.log("TMDB Error:", error);
    return [];
  }
};

/* ================= MOVIE SECTIONS ================= */

export const fetchTrendingMovies = () =>
  fetchData("/trending/movie/week");

export const fetchLatestMovies = () =>
  fetchData("/movie/now_playing", "&language=en-IN");

export const fetchTopRatedMovies = () =>
  fetchData("/movie/top_rated");

export const fetchUpcomingMovies = () =>
  fetchData("/movie/upcoming");

export const fetchPopularMovies = () =>
  fetchData("/movie/popular");

/* ================= INDIA ================= */

export const fetchTopIndia = async () => {
  const results = await fetchData(
    "/trending/movie/day",
    "&region=IN"
  );

  return results.slice(0, 10);
};

/* ================= GENRE ================= */

export const fetchByGenre = (genreId: string) =>
  fetchData(
    "/discover/movie",
    `&with_genres=${genreId}`
  );

/* ================= SEARCH ================= */

export const searchMulti = async (query: string) =>
  fetchData(
    "/search/multi",
    `&query=${encodeURIComponent(query)}`
  );

export const fetchTrendingSearch = async () =>
  fetchData("/trending/all/day");

/* ================= DETAILS ================= */

export const fetchMovieDetails = async (
  movieId: string
) => {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );

  return await res.json();
};

export const fetchMovieTrailer = async (
  movieId: string
) => {
  const res = await fetch(
    `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
  );

  const data = await res.json();

  const trailer = data.results?.find(
    (vid: any) =>
      vid.type === "Trailer" &&
      vid.site === "YouTube"
  );

  return trailer ? trailer.key : null;
};

/* ================= PERSON ================= */

export const fetchPersonDetails = async (
  personId: string
) => {
  const res = await fetch(
    `${BASE_URL}/person/${personId}?api_key=${API_KEY}`
  );
  return await res.json();
};

export const fetchPersonCredits = async (
  personId: string
) => {
  const res = await fetch(
    `${BASE_URL}/person/${personId}/combined_credits?api_key=${API_KEY}`
  );
  const data = await res.json();

  return data.cast || [];
};
