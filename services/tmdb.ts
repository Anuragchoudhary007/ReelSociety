/* =======================================================
   TMDB SERVICE (Proxy Version)
======================================================= */

const API_BASE = "https://reelsociety-web.vercel.app/api/tmdb";

export const IMAGE_BASE_URL =
  "https://image.tmdb.org/t/p/w780";

/* =======================================================
   SAFE FETCH
======================================================= */

const fetchFromProxy = async (endpoint:string)=>{

try{

const url = `${API_BASE}${endpoint}`;

const controller = new AbortController();
const timeout = setTimeout(()=>controller.abort(),10000);

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

}catch(error){

console.log("TMDB Network Error:",error);
return null;

}

};

/* =======================================================
   TRENDING
======================================================= */

export const fetchTrendingMovies = async()=>{

const data = await fetchFromProxy(
"/trending/movie/week"
);

return data?.results || [];

};

export const fetchTrendingAll = async()=>{

const data = await fetchFromProxy(
"/trending/all/day"
);

return data?.results || [];

};

/* =======================================================
   MOVIE SECTIONS
======================================================= */

export const fetchLatestMovies = async()=>{

const data = await fetchFromProxy(
"/movie/now_playing"
);

return data?.results || [];

};

export const fetchTopRatedMovies = async()=>{

const data = await fetchFromProxy(
"/movie/top_rated"
);

return data?.results || [];

};

export const fetchUpcomingMovies = async()=>{

const data = await fetchFromProxy(
"/movie/upcoming"
);

return data?.results || [];

};

export const fetchPopularMovies = async()=>{

const data = await fetchFromProxy(
"/movie/popular"
);

return data?.results || [];

};

/* =======================================================
   INDIA TRENDING
======================================================= */

export const fetchTopIndia = async()=>{

const data = await fetchFromProxy(
"/discover/movie?region=IN&sort_by=popularity.desc"
);

return data?.results?.slice(0,10) || [];

};

/* =======================================================
   GENRES
======================================================= */

export const fetchByGenre = async(genreId:string)=>{

const data = await fetchFromProxy(
`/discover/movie?with_genres=${genreId}`
);

return data?.results || [];

};

/* =======================================================
   SEARCH
======================================================= */

export const searchMulti = async(query:string)=>{

if(!query) return [];

const data = await fetchFromProxy(
`/search/multi?query=${encodeURIComponent(query)}`
);

return data?.results || [];

};

/* =======================================================
   MOVIE / TV DETAILS
======================================================= */

export const fetchMovieDetails = async(id:string)=>{

if(!id) return null;

/* try movie */

let data = await fetchFromProxy(`/movie/${id}`);

if(data) return data;

/* fallback TV */

data = await fetchFromProxy(`/tv/${id}`);

return data;

};

/* =======================================================
   TRAILER
======================================================= */

export const fetchMovieTrailer = async(id:string)=>{

let data = await fetchFromProxy(
`/movie/${id}/videos`
);

if(!data){

data = await fetchFromProxy(
`/tv/${id}/videos`
);

}

const trailer = data?.results?.find(
(v:any)=>
v.type==="Trailer" &&
v.site==="YouTube"
);

return trailer ? trailer.key : null;

};

/* =======================================================
   WATCH PROVIDERS
======================================================= */

export const fetchWatchProviders = async(id:string)=>{

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

export const fetchMovieCredits = async(id:string)=>{

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

export const fetchSimilarMovies = async(id:string)=>{

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
   SEASON EPISODES
======================================================= */

export const fetchSeasonEpisodes = async(
tvId:string,
seasonNumber:number
)=>{

const data = await fetchFromProxy(
`/tv/${tvId}/season/${seasonNumber}`
);

return data?.episodes || [];

};

/* =======================================================
   PERSON
======================================================= */

export const fetchPersonDetails = async(personId:string)=>{

return await fetchFromProxy(
`/person/${personId}`
);

};

export const fetchPersonCredits = async(personId:string)=>{

const data = await fetchFromProxy(
`/person/${personId}/combined_credits`
);

return data?.cast || [];

};