const API_BASE = "http://192.168.0.104:3000/api/tmdb";

export const IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w780";

/* ================= SAFE FETCH ================= */

const fetchFromProxy = async (endpoint: string) => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);

    const data = await res.json();

    if (!res.ok) {
      console.log("Proxy API Error:", data);
      return null;
    }

    return data;
  } catch (error) {
    console.log("Network Error:", error);
    return null;
  }
};

/* ================= BASIC SECTIONS ================= */

export const fetchTrendingMovies = async () => {
  const data = await fetchFromProxy(
    "/trending/movie/week"
  );
  return data?.results || [];
};

export const fetchLatestMovies = async () => {
  const data = await fetchFromProxy(
    "/movie/now_playing"
  );
  return data?.results || [];
};

export const fetchTopRatedMovies = async () => {
  const data = await fetchFromProxy(
    "/movie/top_rated"
  );
  return data?.results || [];
};

export const fetchUpcomingMovies = async () => {
  const data = await fetchFromProxy(
    "/movie/upcoming"
  );
  return data?.results || [];
};

export const fetchPopularMovies = async () => {
  const data = await fetchFromProxy(
    "/movie/popular"
  );
  return data?.results || [];
};

/* ================= INDIA SECTION ================= */

export const fetchTopIndia = async () => {
  const data = await fetchFromProxy(
    "/discover/movie?region=IN&sort_by=popularity.desc"
  );
  return data?.results?.slice(0, 10) || [];
};

/* ================= GENRE ================= */

export const fetchByGenre = async (genreId: string) => {
  const data = await fetchFromProxy(
    `/discover/movie?with_genres=${genreId}`
  );
  return data?.results || [];
};

/* ================= SEARCH ================= */

export const searchMulti = async (query: string) => {
  const data = await fetchFromProxy(
    `/search/multi?query=${encodeURIComponent(query)}`
  );
  return data?.results || [];
};

export const fetchTrendingSearch = async () => {
  const data = await fetchFromProxy(
    "/trending/all/day"
  );
  return data?.results || [];
};

/* ================= DETAILS ================= */

export const fetchMovieDetails = async (
  movieId: string
) => {
  return await fetchFromProxy(
    `/movie/${movieId}`
  );
};

/* ================= TRAILER ================= */

export const fetchMovieTrailer = async (
  movieId: string
) => {
  const data = await fetchFromProxy(
    `/movie/${movieId}/videos`
  );

  const trailer = data?.results?.find(
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
  return await fetchFromProxy(
    `/person/${personId}`
  );
};

export const fetchPersonCredits = async (
  personId: string
) => {
  const data = await fetchFromProxy(
    `/person/${personId}/combined_credits`
  );
  return data?.cast || [];
};