import { useEffect, useState, useRef, useContext } from "react";
import {
View,
Text,
Image,
StyleSheet,
FlatList,
TouchableOpacity,
Animated,
StatusBar,
Dimensions,
ActivityIndicator,
RefreshControl
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { collection, getDocs } from "firebase/firestore";

import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthProvider";

import {
fetchTrendingMovies,
fetchHomeSections,
IMAGE_BASE_URL
} from "../../services/tmdb";

import { generateRecommendations } from "../../utils/recommendationEngine";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 420;

export default function Home(){

const router = useRouter();
const heroListRef = useRef<FlatList>(null);

const authContext = useContext(AuthContext);
const user = authContext?.user;

const [loading,setLoading] = useState(true);
const [refreshing,setRefreshing] = useState(false);

const [heroes,setHeroes] = useState<any[]>([]);
const [rows,setRows] = useState<any[]>([]);

const [recommended,setRecommended] = useState<any[]>([]);
const [friendsWatching,setFriendsWatching] = useState<any[]>([]);
const [becauseWatched,setBecauseWatched] = useState<any[]>([]);

const [activeIndex,setActiveIndex] = useState(0);

/* ================= LOAD HOME ================= */

const loadHome = async()=>{

try{

const trending = await fetchTrendingMovies();
setHeroes(trending.slice(0,5));

const sections = await fetchHomeSections();
setRows(sections);

}catch(err){

console.log("Home Load Error",err);

}

setLoading(false);

};

/* ================= REFRESH ================= */

const onRefresh = async()=>{

setRefreshing(true);
await loadHome();
setRefreshing(false);

};

/* ================= LOAD ON START ================= */

useEffect(()=>{
loadHome();
},[]);

/* ================= HERO AUTO SCROLL ================= */

useEffect(()=>{

if(heroes.length===0) return;

const interval = setInterval(()=>{

let next = activeIndex + 1;

if(next >= heroes.length) next = 0;

heroListRef.current?.scrollToOffset({
offset: next * width,
animated:true
});

setActiveIndex(next);

},5000);

return ()=>clearInterval(interval);

},[activeIndex,heroes]);

/* ================= AI RECOMMENDATIONS ================= */

useEffect(()=>{

if(!user) return;

const loadAI = async()=>{

try{

const snapshot = await getDocs(
collection(db,"users",user.uid,"lists")
);

const watchlist = snapshot.docs.map(doc=>doc.data());

const ai = await generateRecommendations(watchlist);

setRecommended(ai);

/* BECAUSE YOU WATCHED */

setBecauseWatched(ai.slice(0,12));

}catch(err){

console.log("AI Error",err);

}

};

loadAI();

},[user]);

/* ================= FRIENDS WATCHING ================= */

useEffect(()=>{

if(!user) return;

const loadFriendsWatching = async()=>{

try{

const activitySnap = await getDocs(collection(db,"activity"));

const data = activitySnap.docs
.map(doc=>doc.data())
.filter((a:any)=>a.poster)
.slice(0,15);

setFriendsWatching(data);

}catch(err){

console.log("Friends Watching Error",err);

}

};

loadFriendsWatching();

},[user]);

/* ================= HERO ================= */

const renderHero = ({item}:any)=>{

return(

<TouchableOpacity
activeOpacity={0.9}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<View style={{width,height:HERO_HEIGHT}}>

<Image
source={{uri:`${IMAGE_BASE_URL}${item.backdrop_path}`}}
style={{width,height:HERO_HEIGHT}}
/>

<LinearGradient
colors={["transparent","#000"]}
style={styles.gradient}
/>

<Text style={styles.heroTitle}>
{item.title}
</Text>

<View style={styles.heroButtons}>

<TouchableOpacity
style={styles.playButton}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<Text style={styles.playText}>
Play
</Text>

</TouchableOpacity>

</View>

</View>

</TouchableOpacity>

);

};

/* ================= LOADING ================= */

if(loading){

return(

<View style={styles.loading}>
<ActivityIndicator size="large" color="#e50914"/>
</View>

);

}

/* ================= UI ================= */

return(

<SafeAreaView style={styles.container}>

<StatusBar barStyle="light-content"/>

<View style={styles.header}>
<Text style={styles.logo}>ReelSociety</Text>
</View>

<Animated.ScrollView
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={onRefresh}
tintColor="#e50914"
/>
}
>

{/* HERO */}

<FlatList
ref={heroListRef}
data={heroes}
horizontal
pagingEnabled
renderItem={renderHero}
keyExtractor={(item:any)=>item.id.toString()}
showsHorizontalScrollIndicator={false}
/>

{/* AI RECOMMENDED */}

{recommended.length>0 &&
renderRow("Recommended For You",recommended,router)
}

{/* BECAUSE YOU WATCHED */}

{becauseWatched.length>0 &&
renderRow("Because You Watched",becauseWatched,router)
}

{/* FRIENDS WATCHING */}

{friendsWatching.length>0 &&
renderRow("Friends Are Watching",friendsWatching,router)
}

{/* GENRE ROWS */}

{rows.map((row,index)=>(
  <View key={row.title + index}>
    {renderRow(row.title,row.data,router)}
  </View>
))}

<View style={{height:120}}/>

</Animated.ScrollView>

</SafeAreaView>

);

}

/* ================= ROW ================= */

function renderRow(title:string,data:any[],router:any){

if(!data || data.length===0) return null;

return(

<View style={{marginTop:28}}>

<Text style={styles.rowTitle}>
{title}
</Text>

<View style={styles.titleUnderline}/>

<FlatList
horizontal
data={data.slice(0,12)}
keyExtractor={(item,index)=> (item?.id || index).toString()}
showsHorizontalScrollIndicator={false}
contentContainerStyle={{paddingHorizontal:16}}
renderItem={({item})=>(

<MoviePoster item={item} router={router}/>

)}
/>

</View>

);

}

/* ================= POSTER ================= */

function MoviePoster({item,router}:any){

const scale = useRef(new Animated.Value(1)).current;

const pressIn = ()=>{
Animated.spring(scale,{toValue:0.9,useNativeDriver:true}).start();
};

const pressOut = ()=>{
Animated.spring(scale,{toValue:1,useNativeDriver:true}).start();
};

return(

<Animated.View style={{transform:[{scale}],marginRight:14}}>

<TouchableOpacity
activeOpacity={0.8}
onPressIn={pressIn}
onPressOut={pressOut}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<Image
source={{uri:`${IMAGE_BASE_URL}${item.poster_path || item.poster}`}}
style={styles.poster}
/>

</TouchableOpacity>

</Animated.View>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{flex:1,backgroundColor:"#000"},

loading:{flex:1,justifyContent:"center",alignItems:"center",backgroundColor:"#000"},

header:{paddingHorizontal:18,paddingTop:10,paddingBottom:8},

logo:{color:"#e50914",fontSize:26,fontWeight:"bold"},

gradient:{position:"absolute",bottom:0,height:180,width:"100%"},

heroTitle:{
position:"absolute",
bottom:90,
left:20,
color:"#fff",
fontSize:30,
fontWeight:"bold"
},

heroButtons:{position:"absolute",bottom:40,left:20},

playButton:{
backgroundColor:"#e50914",
paddingHorizontal:28,
paddingVertical:11,
borderRadius:30
},

playText:{color:"#fff",fontWeight:"bold"},

rowTitle:{
color:"#fff",
fontSize:20,
marginLeft:16,
marginBottom:4,
fontWeight:"700"
},

titleUnderline:{
height:2,
width:40,
backgroundColor:"#e50914",
marginLeft:16,
marginBottom:12
},

poster:{
width:140,
height:210,
borderRadius:14,
backgroundColor:"#111"
}

});