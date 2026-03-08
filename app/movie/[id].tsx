import { useEffect, useState, useRef } from "react";
import {
View,
Text,
Image,
ScrollView,
StyleSheet,
TouchableOpacity,
ActivityIndicator,
Animated,
Dimensions,
FlatList
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";
import YoutubePlayer from "react-native-youtube-iframe";
import Modal from "react-native-modal";
import { LinearGradient } from "expo-linear-gradient";

import {
fetchMovieDetails,
fetchMovieTrailer,
fetchWatchProviders,
fetchMovieCredits,
fetchSimilarMovies,
IMAGE_BASE_URL
} from "../../services/tmdb";

import {
getUserLists,
getListItems,
addItemToList,
removeItemFromList,
toggleWatchedStatus
} from "../../services/lists";

const { width } = Dimensions.get("window");

export default function MovieDetails(){

const router = useRouter();
const { id } = useLocalSearchParams();

/* STATES */

const [movie,setMovie] = useState<any>(null);
const [providers,setProviders] = useState<any[]>([]);
const [cast,setCast] = useState<any[]>([]);
const [similar,setSimilar] = useState<any[]>([]);
const [seasons,setSeasons] = useState<any[]>([]);
const [expandedSeason,setExpandedSeason] = useState<number | null>(null);

const [exists,setExists] = useState(false);
const [watched,setWatched] = useState(false);

const [listId,setListId] = useState<string | null>(null);

const [rating,setRating] = useState(0);

const [trailerKey,setTrailerKey] = useState<string | null>(null);
const [showTrailer,setShowTrailer] = useState(false);

const [loading,setLoading] = useState(true);

const pulse = useRef(new Animated.Value(1)).current;

/* LOAD MOVIE */

useEffect(()=>{

if(!id || Array.isArray(id)) return;

load(id.toString());

},[id]);

const load = async(movieId:string)=>{

try{

const data = await fetchMovieDetails(movieId);
setMovie(data);

/* SEASONS */

if(data.seasons){
setSeasons(data.seasons);
}

/* TRAILER */

const trailer = await fetchMovieTrailer(movieId);
setTrailerKey(trailer);

/* PROVIDERS */

const providerData = await fetchWatchProviders(movieId);
setProviders(providerData);

/* CAST */

const credits = await fetchMovieCredits(movieId);
setCast(credits.slice(0,10));

/* SIMILAR */

const similarMovies = await fetchSimilarMovies(movieId);
setSimilar(similarMovies.slice(0,10));

/* WATCHLIST */

const lists = await getUserLists();

if(lists.length > 0){

const firstList = lists[0];
setListId(firstList.id);

const items = await getListItems(firstList.id);

const item = items.find(
(i:any)=>String(i.id) === movieId
);

if(item){
setExists(true);
setWatched(item.watched || false);
}

}

}catch(e){

console.log("Movie Load Error:",e);

}

setLoading(false);

};

/* WATCHLIST */

const toggleWatchlist = async()=>{

if(!movie || !listId) return;

if(exists){

await removeItemFromList(listId,String(movie.id));
setExists(false);
setWatched(false);
return;

}

await addItemToList(listId,movie,Date.now());
setExists(true);

Animated.sequence([
Animated.timing(pulse,{toValue:1.1,duration:120,useNativeDriver:true}),
Animated.timing(pulse,{toValue:1,duration:120,useNativeDriver:true})
]).start();

};

/* WATCHED */

const toggleWatched = async()=>{

if(!listId || !movie) return;

await toggleWatchedStatus(
listId,
String(movie.id),
watched,
movie
);

setWatched(!watched);

};

/* RATING */

const renderStars = ()=>{

let stars=[];

for(let i=1;i<=5;i++){

stars.push(

<TouchableOpacity key={i} onPress={()=>setRating(i)}>

<Text style={{
fontSize:26,
color:i<=rating?"#FFD700":"#555"
}}>
★
</Text>

</TouchableOpacity>

);

}

return stars;

};

/* LOADING */

if(loading){

return(
<View style={styles.center}>
<ActivityIndicator size="large" color="#e50914"/>
</View>
);

}

if(!movie) return null;

/* TYPE */

let type="Movie";

if(movie.first_air_date) type="TV Series";
if(movie.origin_country?.includes("JP")) type="Anime";

/* BACKDROP */

const backdrop =
movie.backdrop_path
? `${IMAGE_BASE_URL}${movie.backdrop_path}`
: `${IMAGE_BASE_URL}${movie.poster_path}`;

/* UI */

return(

<View style={{flex:1}}>

<ScrollView style={styles.container}>

{/* HERO */}

<View style={styles.hero}>

<Image
source={{uri:backdrop}}
style={styles.backdrop}
/>

<LinearGradient
colors={["rgba(0,0,0,0)","rgba(0,0,0,0.5)","#000"]}
style={styles.gradient}
/>

<Image
source={{uri:`${IMAGE_BASE_URL}${movie.poster_path}`}}
style={styles.poster}
/>

</View>

<View style={styles.content}>

<Text style={styles.title}>
{movie.title || movie.name}
</Text>

<Text style={styles.meta}>
⭐ {movie.vote_average}
</Text>

{/* TYPE */}

<View style={styles.typeBadge}>
<Text style={styles.typeText}>{type}</Text>
</View>

{/* SEASON INFO */}

{movie.number_of_seasons && (

<Text style={styles.meta}>
Seasons: {movie.number_of_seasons} • Episodes: {movie.number_of_episodes}
</Text>

)}

{/* WATCHLIST */}

<Animated.View style={{transform:[{scale:pulse}]}}>

<TouchableOpacity
style={[
styles.watchlistBtn,
{backgroundColor:exists?"#333":"#e50914"}
]}
onPress={toggleWatchlist}
>

<Text style={styles.watchlistText}>
{exists?"✓ In Watchlist":"Add to Watchlist"}
</Text>

</TouchableOpacity>

</Animated.View>

{/* WATCHED */}

{exists && (

<TouchableOpacity
style={[
styles.watchedBtn,
{backgroundColor:watched?"#2ecc71":"#222"}
]}
onPress={toggleWatched}
>

<Text style={styles.watchlistText}>
{watched?"✓ Watched":"Mark as Watched"}
</Text>

</TouchableOpacity>

)}

{/* RATING */}

<View style={styles.ratingRow}>
{renderStars()}
</View>

{/* TRAILER */}

{trailerKey && (

<TouchableOpacity
style={styles.trailerBtn}
onPress={()=>setShowTrailer(true)}
>

<Text style={styles.trailerText}>
🎬 Watch Trailer
</Text>

</TouchableOpacity>

)}

{/* PROVIDERS */}

{providers.length>0 && (

<View style={{marginTop:20}}>

<Text style={styles.section}>Where to Watch</Text>

<FlatList
horizontal
data={providers}
keyExtractor={(item)=>item.provider_id.toString()}
showsHorizontalScrollIndicator={false}

renderItem={({item})=>(

<View style={styles.providerCard}>

<Image
source={{
uri:`https://image.tmdb.org/t/p/w200${item.logo_path}`
}}
style={styles.providerLogo}
/>

<Text style={styles.providerName}>
{item.provider_name}
</Text>

</View>

)}
/>

</View>

)}

{/* OVERVIEW */}

<Text style={styles.section}>Overview</Text>

<Text style={styles.overview}>
{movie.overview}
</Text>

{/* SEASONS */}

{seasons.length>0 && (

<View>

<Text style={styles.section}>Seasons</Text>

{seasons.map((s:any)=>{

return(

<View key={s.id} style={styles.seasonCard}>

<TouchableOpacity
onPress={()=>setExpandedSeason(
expandedSeason===s.id?null:s.id
)}
>

<Text style={styles.seasonTitle}>
Season {s.season_number} • {s.episode_count} Episodes
</Text>

</TouchableOpacity>

</View>

);

})}

</View>

)}

{/* CAST */}

<Text style={styles.section}>Cast</Text>

<FlatList
horizontal
data={cast}
keyExtractor={(item)=>item.id.toString()}
showsHorizontalScrollIndicator={false}

renderItem={({item})=>(

<TouchableOpacity
style={styles.castCard}
onPress={()=>router.push(`/person/${item.id}`)}
>

<Image
source={{uri:`${IMAGE_BASE_URL}${item.profile_path}`}}
style={styles.castImage}
/>

<Text style={styles.castName}>
{item.name}
</Text>

</TouchableOpacity>

)}
/>

{/* SIMILAR */}

<Text style={styles.section}>Similar Movies</Text>

<FlatList
horizontal
data={similar}
keyExtractor={(item)=>item.id.toString()}
showsHorizontalScrollIndicator={false}

renderItem={({item})=>(

<TouchableOpacity
style={{marginRight:12}}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<Image
source={{uri:`${IMAGE_BASE_URL}${item.poster_path}`}}
style={styles.posterSmall}
/>

</TouchableOpacity>

)}
/>

<View style={{height:120}}/>

</View>

</ScrollView>

{/* TRAILER MODAL */}

<Modal
isVisible={showTrailer}
onBackdropPress={()=>setShowTrailer(false)}
style={styles.modal}
backdropOpacity={0.85}
>

<View style={styles.modalBox}>

<YoutubePlayer
height={230}
play={true}
videoId={trailerKey || ""}
/>

<TouchableOpacity
style={styles.closeBtn}
onPress={()=>setShowTrailer(false)}
>
<Text style={{color:"#fff"}}>Close</Text>
</TouchableOpacity>

</View>

</Modal>

</View>

);

}

/* STYLES */

const styles = StyleSheet.create({

container:{flex:1,backgroundColor:"#000"},

hero:{height:420},

backdrop:{width:"100%",height:"100%"},

gradient:{position:"absolute",bottom:0,height:220,width:"100%"},

poster:{
position:"absolute",
bottom:-60,
left:20,
width:140,
height:210,
borderRadius:12
},

content:{marginTop:80,paddingHorizontal:20},

title:{color:"#fff",fontSize:26,fontWeight:"bold"},

meta:{color:"#aaa",marginTop:6},

typeBadge:{
backgroundColor:"#e50914",
alignSelf:"flex-start",
paddingHorizontal:10,
paddingVertical:4,
borderRadius:6,
marginTop:6
},

typeText:{color:"#fff",fontWeight:"bold"},

watchlistBtn:{
marginTop:20,
padding:14,
borderRadius:10,
alignItems:"center"
},

watchedBtn:{
marginTop:10,
padding:14,
borderRadius:10,
alignItems:"center"
},

watchlistText:{color:"#fff",fontWeight:"bold"},

ratingRow:{flexDirection:"row",gap:10,marginTop:15},

trailerBtn:{
backgroundColor:"#222",
padding:14,
borderRadius:10,
alignItems:"center",
marginTop:10
},

trailerText:{color:"#fff",fontWeight:"bold"},

section:{
color:"#fff",
fontSize:18,
fontWeight:"bold",
marginTop:25,
marginBottom:12
},

overview:{color:"#ccc",lineHeight:22},

providerCard:{alignItems:"center",marginRight:16},

providerLogo:{width:60,height:60,borderRadius:12,marginBottom:6},

providerName:{color:"#aaa",fontSize:12},

castCard:{marginRight:14,width:90},

castImage:{width:90,height:120,borderRadius:10},

castName:{color:"#aaa",fontSize:12,marginTop:6},

posterSmall:{width:120,height:180,borderRadius:10},

seasonCard:{
backgroundColor:"#111",
padding:12,
borderRadius:10,
marginBottom:10
},

seasonTitle:{color:"#fff",fontWeight:"bold"},

center:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

modal:{justifyContent:"flex-end",margin:0},

modalBox:{
backgroundColor:"#111",
padding:20,
borderTopLeftRadius:20,
borderTopRightRadius:20
},

closeBtn:{
backgroundColor:"#e50914",
padding:12,
borderRadius:8,
marginTop:15,
alignItems:"center"
}

});