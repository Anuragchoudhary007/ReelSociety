import { useState, useCallback, useRef } from "react";
import {
View,
Text,
StyleSheet,
FlatList,
Image,
TouchableOpacity,
Dimensions,
ActivityIndicator,
Animated
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";
import { getUserLists, getListItems } from "../../services/lists";
import { IMAGE_BASE_URL } from "../../services/tmdb";

const { width } = Dimensions.get("window");

const ITEM_WIDTH = width / 3 - 16;
const ITEM_HEIGHT = 190;

export default function WatchlistScreen() {

const router = useRouter();

const [movies,setMovies] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

const scale = useRef(new Animated.Value(1)).current;

const pressIn = ()=>{
Animated.spring(scale,{
toValue:0.94,
useNativeDriver:true
}).start();
};

const pressOut = ()=>{
Animated.spring(scale,{
toValue:1,
useNativeDriver:true
}).start();
};

useFocusEffect(
useCallback(()=>{

const load = async ()=>{

setLoading(true);

const lists = await getUserLists();

if(lists.length === 0){
setMovies([]);
setLoading(false);
return;
}

const firstList = lists[0];

const items = await getListItems(firstList.id);

setMovies(items);

setLoading(false);

};

load();

},[])
);

if(loading){

return(
<View style={styles.center}>
<ActivityIndicator size="large" color="#e50914"/>
</View>
);

}

if(movies.length === 0){

return(
<View style={styles.emptyContainer}>

<Text style={styles.emptyEmoji}>
🎬
</Text>

<Text style={styles.emptyTitle}>
Your Watchlist is Empty
</Text>

<Text style={styles.emptySubtitle}>
Save movies to watch later
</Text>

</View>
);

}

return(

<View style={styles.container}>

<Text style={styles.title}>
My Watchlist
</Text>

<FlatList
data={movies}
numColumns={3}
keyExtractor={(item)=>item.id.toString()}
contentContainerStyle={{paddingBottom:120}}

renderItem={({item})=>{

const poster =
item.poster_path
? `${IMAGE_BASE_URL}${item.poster_path}`
: "https://via.placeholder.com/300x450/111111/ffffff?text=No+Poster";

return(

<Animated.View
style={[
styles.cardWrapper,
{transform:[{scale}]}
]}
>

<TouchableOpacity
onPress={()=>router.push(`/movie/${item.id}`)}
onPressIn={pressIn}
onPressOut={pressOut}
activeOpacity={0.9}
>

<Image
source={{uri:poster}}
style={styles.poster}
/>

</TouchableOpacity>

</Animated.View>

);

}}

>

</FlatList>

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
paddingHorizontal:8,
paddingTop:60
},

title:{
color:"#fff",
fontSize:24,
fontWeight:"bold",
marginBottom:20,
marginLeft:10
},

cardWrapper:{
width:ITEM_WIDTH,
margin:4
},

poster:{
width:"100%",
height:ITEM_HEIGHT,
borderRadius:14,
backgroundColor:"#111"
},

center:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

emptyContainer:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

emptyEmoji:{
fontSize:50,
marginBottom:10
},

emptyTitle:{
color:"#fff",
fontSize:22,
fontWeight:"bold"
},

emptySubtitle:{
color:"#888",
marginTop:6
}

});