/* =======================================================
   TMDB SERVICE
   Proxy version using Vercel
======================================================= */

const API_BASE = "https://reelsociety-web.vercel.app/api/tmdb";

export const IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w780";

/* =======================================================
   SAFE FETCH
======================================================= */

const fetchFromProxy = async (endpoint: string) => {

  try {

    const url = `${API_BASE}${endpoint}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url,{
      signal:controller.signal
    });

    clearTimeout(timeout);

    const data = await res.json();

    if(!res.ok){
      console.log("TMDB Proxy Error:",data);
      return null;
    }

    return data;

  } catch(err){

    console.log("TMDB Network Error:",err);
    return null;

  }

};

/* =======================================================
   BASIC MOVIE LISTS
======================================================= */

export const fetchTrendingMovies = async () => {
  const data = await fetchFromProxy("/trending/movie/week");
  return data?.results || [];
};

export const fetchTrendingAll = async () => {
  const data = await fetchFromProxy("/trending/all/day");
  return data?.results || [];
};

export const fetchLatestMovies = async () => {
  const data = await fetchFromProxy("/movie/now_playing");
  return data?.results || [];
};

export const fetchPopularMovies = async () => {
  const data = await fetchFromProxy("/movie/popular");
  return data?.results || [];
};

export const fetchTopRatedMovies = async () => {
  const data = await fetchFromProxy("/movie/top_rated");
  return data?.results || [];
};

export const fetchUpcomingMovies = async () => {
  const data = await fetchFromProxy("/movie/upcoming");
  return data?.results || [];
};

/* =======================================================
   SERIES
======================================================= */

export const fetchPopularSeries = async () => {
  const data = await fetchFromProxy("/tv/popular");
  return data?.results || [];
};

export const fetchTopSeries = async () => {
  const data = await fetchFromProxy("/tv/top_rated");
  return data?.results || [];
};

/* =======================================================
   INDIA
======================================================= */

export const fetchTopIndia = async () => {

  const data = await fetchFromProxy(
    "/discover/movie?region=IN&sort_by=popularity.desc"
  );

  return data?.results?.slice(0,10) || [];

};

/* =======================================================
   GENRE FETCHER
======================================================= */

export const fetchGenre = async (id:string) => {

  const data = await fetchFromProxy(
    `/discover/movie?with_genres=${id}`
  );

  return data?.results || [];

};

/* =======================================================
   STREAMING PROVIDERS
======================================================= */

export const fetchNetflixOriginals = async () => {

  const data = await fetchFromProxy(
    "/discover/tv?with_networks=213"
  );

  return data?.results || [];

};

export const fetchHBOShows = async () => {

  const data = await fetchFromProxy(
    "/discover/tv?with_networks=49"
  );

  return data?.results || [];

};

export const fetchPrimeShows = async () => {

  const data = await fetchFromProxy(
    "/discover/tv?with_networks=1024"
  );

  return data?.results || [];

};

export const fetchHotstarShows = async () => {

  const data = await fetchFromProxy(
    "/discover/tv?with_networks=2739"
  );

  return data?.results || [];

};

/* =======================================================
   HOME CONTENT ENGINE
======================================================= */

export const fetchHomeSections = async () => {

  const [
    trending,
    latest,
    popular,
    topRated,
    upcoming,
    india,
    series,
    topSeries,
    action,
    romance,
    crime,
    comedy,
    thriller,
    family,
    fantasy,
    scifi,
    animation,
    documentary,
    netflix,
    hbo,
    prime,
    hotstar
  ] = await Promise.all([

    fetchTrendingMovies(),
    fetchLatestMovies(),
    fetchPopularMovies(),
    fetchTopRatedMovies(),
    fetchUpcomingMovies(),
    fetchTopIndia(),

    fetchPopularSeries(),
    fetchTopSeries(),

    fetchGenre("28"), 
    fetchGenre("10749"), 
    fetchGenre("80"), 
    fetchGenre("35"), 
    fetchGenre("53"), 
    fetchGenre("10751"), 

    fetchGenre("14"), 
    fetchGenre("878"), 
    fetchGenre("16"), 
    fetchGenre("99"), 

    fetchNetflixOriginals(),
    fetchHBOShows(),
    fetchPrimeShows(),
    fetchHotstarShows()

  ]);

  const sections = [

    { title:"Latest Releases", data: latest },
    { title:"Trending Now", data: trending },
    { title:"Popular Movies", data: popular },
    { title:"Top Rated Movies", data: topRated },
    { title:"Upcoming Movies", data: upcoming },

    { title:"Trending In India", data: india },

    { title:"Popular Series", data: series },
    { title:"Top TV Shows", data: topSeries },

    { title:"Netflix Originals", data: netflix },
    { title:"HBO Shows", data: hbo },
    { title:"Prime Video Shows", data: prime },
    { title:"Hotstar Shows", data: hotstar },

    { title:"Action Movies", data: action },
    { title:"Romantic Movies", data: romance },
    { title:"Crime Stories", data: crime },
    { title:"Comedy Movies", data: comedy },
    { title:"Thriller Movies", data: thriller },
    { title:"Family Picks", data: family },

    { title:"Fantasy Worlds", data: fantasy },
    { title:"Science Fiction", data: scifi },
    { title:"Animated Movies", data: animation },
    { title:"Documentaries", data: documentary }

  ];

  const used = new Set();

  return sections.map(section=>{

    const filtered = section.data.filter((m:any)=>{

      if(!m?.id) return false;

      if(used.has(m.id)) return false;

      used.add(m.id);

      return true;

    });

    return { ...section, data: filtered };

  });

};

/* =======================================================
   DETAILS
======================================================= */

export const fetchMovieDetails = async (id:string) => {

  if(!id) return null;

  let data = await fetchFromProxy(`/movie/${id}`);

  if(data) return data;

  return await fetchFromProxy(`/tv/${id}`);

};

/* =======================================================
   TRAILER
======================================================= */

export const fetchMovieTrailer = async (id:string) => {

  let data = await fetchFromProxy(`/movie/${id}/videos`);

  if(!data){
    data = await fetchFromProxy(`/tv/${id}/videos`);
  }

  const trailer = data?.results?.find(
    (v:any)=>
      v.type === "Trailer" &&
      v.site === "YouTube"
  );

  return trailer ? trailer.key : null;

};

/* =======================================================
   WATCH PROVIDERS
======================================================= */

export const fetchWatchProviders = async (id:string) => {

  let data = await fetchFromProxy(
    `/movie/${id}/watch/providers`
  );

  if(!data){
    data = await fetchFromProxy(
      `/tv/${id}/watch/providers`
    );
  }

  return (
    data?.results?.IN?.flatrate ||
    data?.results?.US?.flatrate ||
    []
  );

};

/* =======================================================
   CAST
======================================================= */

export const fetchMovieCredits = async (id:string) => {

  let data = await fetchFromProxy(
    `/movie/${id}/credits`
  );

  if(!data){
    data = await fetchFromProxy(
      `/tv/${id}/credits`
    );
  }

  return data?.cast || [];

};

/* =======================================================
   SIMILAR
======================================================= */

export const fetchSimilarMovies = async (id:string) => {

  let data = await fetchFromProxy(
    `/movie/${id}/similar`
  );

  if(!data){
    data = await fetchFromProxy(
      `/tv/${id}/similar`
    );
  }

  return data?.results || [];

};

/* =======================================================
   SEASONS
======================================================= */

export const fetchSeasonEpisodes = async (
  tvId:string,
  seasonNumber:number
) => {

  const data = await fetchFromProxy(
    `/tv/${tvId}/season/${seasonNumber}`
  );

  return data?.episodes || [];

};

/* =======================================================
   PERSON
======================================================= */

export const fetchPersonDetails = async (personId:string) => {
  return await fetchFromProxy(`/person/${personId}`);
};

export const fetchPersonCredits = async (personId:string) => {

  const data = await fetchFromProxy(
    `/person/${personId}/combined_credits`
  );

  return data?.cast || [];

};

export const fetchTrendingSearch = async () => {
  const data = await fetchFromProxy("/trending/all/day");
  return data?.results || [];
};