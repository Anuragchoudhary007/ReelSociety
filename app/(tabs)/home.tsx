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
ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getDocs, collection } from "firebase/firestore";

import { db } from "../../services/firebase";
import { AuthContext } from "../../context/AuthProvider";

import {
fetchTrendingMovies,
fetchLatestMovies,
fetchTopIndia,
fetchByGenre,
IMAGE_BASE_URL
} from "../../services/tmdb";

import { generateRecommendations } from "../../utils/recommendationEngine";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 420;

export default function Home(){

const router = useRouter();
const scrollY = useRef(new Animated.Value(0)).current;

const heroListRef = useRef<FlatList>(null);

const authContext = useContext(AuthContext);
const user = authContext?.user;

const [loading,setLoading] = useState(true);

const [heroes,setHeroes] = useState<any[]>([]);
const [activeIndex,setActiveIndex] = useState(0);

const [recommended,setRecommended] = useState<any[]>([]);
const [homeData,setHomeData] = useState<any>({});

/* ================= LOAD MOVIES ================= */

useEffect(()=>{

const loadData = async ()=>{

try{

const trending = await fetchTrendingMovies();

setHeroes(trending.slice(0,5));

const data = {
latest: await fetchLatestMovies(),
topIndia: await fetchTopIndia(),
action: await fetchByGenre("28"),
romance: await fetchByGenre("10749"),
crime: await fetchByGenre("80"),
comedy: await fetchByGenre("35"),
thriller: await fetchByGenre("53"),
family: await fetchByGenre("10751"),
};

setHomeData(data);

}catch(err){
console.log("Home Load Error",err);
}

setLoading(false);

};

loadData();

},[]);

/* ================= HERO AUTO SCROLL ================= */

useEffect(()=>{

if(heroes.length === 0) return;

const interval = setInterval(()=>{

let next = activeIndex + 1;

if(next >= heroes.length){
next = 0;
}

heroListRef.current?.scrollToOffset({
offset: next * width,
animated: true
});

setActiveIndex(next);

},5000);

return ()=>clearInterval(interval);

},[activeIndex,heroes]);

/* ================= AI RECOMMENDATIONS ================= */

useEffect(()=>{

if(!user) return;

const loadRecommendations = async ()=>{

try{

const snapshot = await getDocs(
collection(db,"users",user.uid,"lists")
);

const watchlist = snapshot.docs.map(doc=>doc.data());

const aiData = await generateRecommendations(watchlist);

setRecommended(aiData);

}catch(err){

console.log("AI Error",err);

}

};

loadRecommendations();

},[user]);

/* ================= HERO FADE ================= */

const heroFade = scrollY.interpolate({

inputRange:[0,HERO_HEIGHT * 0.6],
outputRange:[0,1],
extrapolate:"clamp"

});

/* ================= HERO ================= */

const renderHero = ({item}:any)=>{

return(

<TouchableOpacity
activeOpacity={0.9}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<View style={{width,height:HERO_HEIGHT}}>

<Image
source={{
uri:`${IMAGE_BASE_URL}${item.backdrop_path}`
}}
style={{width,height:HERO_HEIGHT}}
/>

<Animated.View
style={[styles.heroShadow,{opacity:heroFade}]}
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
▶ Play
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

<ActivityIndicator
size="large"
color="#e50914"
/>

</View>

);

}

/* ================= UI ================= */

return(

<SafeAreaView style={styles.container}>

<StatusBar barStyle="light-content"/>

<View style={styles.header}>
<Text style={styles.logo}>
ReelSociety
</Text>
</View>

<Animated.ScrollView
showsVerticalScrollIndicator={false}
scrollEventThrottle={16}
onScroll={Animated.event(
[{nativeEvent:{contentOffset:{y:scrollY}}}],
{useNativeDriver:false}
)}
>

{/* HERO */}

<FlatList
ref={heroListRef}
data={heroes}
horizontal
pagingEnabled
renderItem={renderHero}
keyExtractor={(item)=>item.id.toString()}
showsHorizontalScrollIndicator={false}
onMomentumScrollEnd={(e)=>{

const index = Math.round(
e.nativeEvent.contentOffset.x / width
);

setActiveIndex(index);

}}
/>

{/* MOVIE ROWS */}

{recommended.length > 0 &&
renderRow("🎯 Recommended",recommended,router)}

{renderRow("🆕 Latest",homeData.latest,router)}
{renderRow("🇮🇳 Top India",homeData.topIndia,router)}
{renderRow("💥 Action",homeData.action,router)}
{renderRow("❤️ Romance",homeData.romance,router)}
{renderRow("🔫 Crime",homeData.crime,router)}
{renderRow("😂 Comedy",homeData.comedy,router)}
{renderRow("🔥 Thriller",homeData.thriller,router)}
{renderRow("👨‍👩‍👧 Family",homeData.family,router)}

<View style={{height:120}}/>

</Animated.ScrollView>

</SafeAreaView>

);

}

/* ================= MOVIE ROW ================= */

function renderRow(title:string,data:any[],router:any){

if(!data || data.length===0) return null;

return(

<View style={{marginTop:26}}>

<Text style={styles.rowTitle}>
{title}
</Text>

<FlatList
horizontal
data={data}
keyExtractor={(item)=>item.id.toString()}
showsHorizontalScrollIndicator={false}
contentContainerStyle={{paddingHorizontal:12}}
renderItem={({item})=>(

<MoviePoster
item={item}
router={router}
/>

)}
/>

</View>

);

}

/* ================= POSTER ================= */

function MoviePoster({item,router}:any){

const scale = useRef(new Animated.Value(1)).current;

const pressIn = ()=>{

Animated.spring(scale,{
toValue:0.9,
useNativeDriver:true
}).start();

};

const pressOut = ()=>{

Animated.spring(scale,{
toValue:1,
useNativeDriver:true
}).start();

};

return(

<Animated.View
style={{
transform:[{scale}],
marginRight:14
}}
>

<TouchableOpacity
activeOpacity={0.8}
onPressIn={pressIn}
onPressOut={pressOut}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<Image
source={{
uri:`${IMAGE_BASE_URL}${item.poster_path}`
}}
style={styles.poster}
/>

</TouchableOpacity>

</Animated.View>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000"
},

loading:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

header:{
paddingHorizontal:18,
paddingTop:10,
paddingBottom:8
},

logo:{
color:"#e50914",
fontSize:26,
fontWeight:"bold"
},

heroShadow:{
position:"absolute",
...StyleSheet.absoluteFillObject,
backgroundColor:"#000"
},

gradient:{
position:"absolute",
bottom:0,
height:180,
width:"100%"
},

heroTitle:{
position:"absolute",
bottom:90,
left:20,
color:"#fff",
fontSize:30,
fontWeight:"bold",
width:width * 0.8
},

heroButtons:{
position:"absolute",
bottom:40,
left:20,
flexDirection:"row"
},

playButton:{
backgroundColor:"#e50914",
paddingHorizontal:28,
paddingVertical:11,
borderRadius:30
},

playText:{
color:"#fff",
fontWeight:"bold"
},

rowTitle:{
color:"#fff",
fontSize:19,
marginLeft:12,
marginBottom:12,
fontWeight:"600"
},

poster:{
width:140,
height:210,
borderRadius:14,
backgroundColor:"#111"
}

});