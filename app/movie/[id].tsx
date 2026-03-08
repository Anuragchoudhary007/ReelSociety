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
fetchSeasonEpisodes,
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

const [movie,setMovie] = useState<any>(null);
const [providers,setProviders] = useState<any[]>([]);
const [cast,setCast] = useState<any[]>([]);
const [similar,setSimilar] = useState<any[]>([]);
const [seasons,setSeasons] = useState<any[]>([]);
const [episodes,setEpisodes] = useState<any>({});

const [expandedSeason,setExpandedSeason] = useState<number | null>(null);

const [exists,setExists] = useState(false);
const [watched,setWatched] = useState(false);

const [listId,setListId] = useState<string | null>(null);
const [lists,setLists] = useState<any[]>([]);
const [showListPicker,setShowListPicker] = useState(false);
const [inCustomList,setInCustomList] = useState(false);

const [rating,setRating] = useState(0);

const [trailerKey,setTrailerKey] = useState<string | null>(null);
const [showTrailer,setShowTrailer] = useState(false);

const [loading,setLoading] = useState(true);

const pulse = useRef(new Animated.Value(1)).current;

useEffect(()=>{

if(!id || Array.isArray(id)) return;

load(id.toString());

},[id]);

const load = async(movieId:string)=>{

try{

const data = await fetchMovieDetails(movieId);
setMovie(data);

if(data.seasons){
setSeasons(data.seasons);
}

const trailer = await fetchMovieTrailer(movieId);
setTrailerKey(trailer);

const providerData = await fetchWatchProviders(movieId);
setProviders(providerData);

const credits = await fetchMovieCredits(movieId);
setCast(credits.slice(0,10));

const similarMovies = await fetchSimilarMovies(movieId);
setSimilar(similarMovies.slice(0,10));

const userLists = await getUserLists();
setLists(userLists);

if(userLists.length > 0){

setListId(userLists[0].id);

for(const list of userLists){

const items = await getListItems(list.id);

const item = items.find(
(i:any)=>String(i.id) === movieId
);

if(item){

setExists(true);
setWatched(item.watched || false);
setInCustomList(true);

break;

}

}

}

}catch(e){

console.log("Movie Load Error:",e);

}

setLoading(false);

};

const toggleSeason = async(season:any)=>{

if(expandedSeason === season.id){
setExpandedSeason(null);
return;
}

setExpandedSeason(season.id);

if(!episodes[season.id]){

const eps = await fetchSeasonEpisodes(
String(movie.id),
season.season_number
);

setEpisodes(prev=>({
...prev,
[season.id]:eps
}));

}

};

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

const addToSelectedList = async(list:any)=>{

await addItemToList(
list.id,
movie,
Date.now()
);

setInCustomList(true);
setShowListPicker(false);

};

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

if(loading){

return(
<View style={styles.center}>
<ActivityIndicator size="large" color="#e50914"/>
</View>
);

}

if(!movie) return null;

const backdrop =
movie.backdrop_path
? `${IMAGE_BASE_URL}${movie.backdrop_path}`
: `${IMAGE_BASE_URL}${movie.poster_path}`;

return(

<View style={{flex:1}}>

<ScrollView style={styles.container}>

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

{/* ADD TO LIST */}

<TouchableOpacity
style={[
styles.addListBtn,
{ backgroundColor: inCustomList ? "#333" : "#e50914" }
]}
onPress={()=>setShowListPicker(true)}
disabled={inCustomList}
>

<Text style={styles.watchlistText}>
{inCustomList ? "✓ Added to List" : "Add To List"}
</Text>

</TouchableOpacity>

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
Watch Trailer
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
onPress={()=>toggleSeason(s)}
>

<Text style={styles.seasonTitle}>
Season {s.season_number} • {s.episode_count} Episodes
</Text>

</TouchableOpacity>

{expandedSeason === s.id && episodes[s.id] && (

<View style={styles.episodeContainer}>

{episodes[s.id].map((ep:any)=>{

return(

<View key={ep.id} style={styles.episodeRow}>

<Text style={styles.episodeNumber}>
E{ep.episode_number}
</Text>

<Text style={styles.episodeTitle}>
{ep.name}
</Text>

</View>

);

})}

</View>

)}

</View>

);

})}

</View>

)}

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

{/* TRAILER */}

<Modal
isVisible={showTrailer}
onBackdropPress={()=>setShowTrailer(false)}
style={styles.modal}
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

{/* LIST PICKER */}

<Modal
isVisible={showListPicker}
onBackdropPress={()=>setShowListPicker(false)}
style={styles.modal}
>

<View style={styles.modalBox}>

<Text style={styles.section}>
Select List
</Text>

{lists.length === 0 ? (

<Text style={{color:"#aaa",marginTop:10}}>
No lists created yet
</Text>

) : (

lists.map((l:any)=>(

<TouchableOpacity
key={l.id}
style={styles.listRow}
onPress={()=>addToSelectedList(l)}
>

<Text style={styles.listName}>
{l.title || "Untitled List"}
</Text>

</TouchableOpacity>

))

)}

</View>

</Modal>

</View>

);

}

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

addListBtn:{
marginTop:10,
backgroundColor:"#e50914",
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

episodeContainer:{marginTop:10},

episodeRow:{
flexDirection:"row",
paddingVertical:6
},

episodeNumber:{
color:"#e50914",
marginRight:8
},

episodeTitle:{
color:"#ccc",
flex:1
},

listRow:{
paddingVertical:14,
borderBottomWidth:1,
borderBottomColor:"#222"
},

listName:{
color:"#fff",
fontSize:16
},

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