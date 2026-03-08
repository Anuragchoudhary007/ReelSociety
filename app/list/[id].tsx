import { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
Image,
TouchableOpacity,
TextInput,
Dimensions,
Animated,
ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import DraggableFlatList from "react-native-draggable-flatlist";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";

import {
getListItems,
updateItemRank,
updateItemRating,
removeItemFromList,
addItemToList,
toggleWatchedStatus,
} from "../../services/lists";

import { searchMulti, IMAGE_BASE_URL } from "../../services/tmdb";

const { width } = Dimensions.get("window");

const AnimatedStarRating = ({ rating, onRate }: any) => {

const scale = new Animated.Value(1);

const animate = (value:number) => {

Animated.sequence([
Animated.timing(scale,{toValue:1.3,duration:120,useNativeDriver:true}),
Animated.timing(scale,{toValue:1,duration:120,useNativeDriver:true})
]).start();

onRate(value);

};

return(
<View style={{flexDirection:"row",marginTop:6}}>

{[1,2,3,4,5].map((star)=>(

<TouchableOpacity key={star} onPress={()=>animate(star)}>

<Animated.Text style={{
fontSize:24,
marginRight:6,
color:star<=rating?"#FFD700":"#444",
transform:[{scale}]
}}>
★
</Animated.Text>

</TouchableOpacity>

))}

</View>
);

};

export default function ListDetailsScreen(){

const params = useLocalSearchParams();
const listId = Array.isArray(params.id) ? params.id[0] : params.id;

const [items,setItems] = useState<any[]>([]);
const [query,setQuery] = useState("");
const [results,setResults] = useState<any[]>([]);

/* LOAD LIST */

useEffect(()=>{

if(!listId) return;

getListItems(listId).then((data)=>setItems(data||[]));

},[]);

/* SEARCH */

useEffect(()=>{

const delay=setTimeout(async()=>{

if(!query.trim()) return setResults([]);

const data = await searchMulti(query);

const filtered =
data?.filter((item:any)=>
item.media_type==="movie"||item.media_type==="tv"
)||[];

setResults(filtered);

},400);

return ()=>clearTimeout(delay);

},[query]);

/* ADD */

const handleAdd = async(item:any)=>{

if(!listId) return;

const exists = items.some(i=>i.id===String(item.id));
if(exists) return;

const newItem={
id:String(item.id),
title:item.title||item.name,
poster_path:item.poster_path||"",
rank:items.length+1,
userRating:0,
watched:false
};

setItems(prev=>[...prev,newItem]);

addItemToList(listId,item,items.length+1);

setQuery("");
setResults([]);

};

/* DELETE */

const handleRemove=(item:any)=>{

setItems(prev=>prev.filter(i=>i.id!==item.id));

removeItemFromList(listId,item.id);

};

const renderRightActions=(item:any)=>(
<View style={styles.deleteBox}>
<Text style={styles.deleteText}>Delete</Text>
</View>
);

/* DRAG */

const handleDragEnd=async({data}:any)=>{

const updated=data.map((item:any,index:number)=>({
...item,
rank:index+1
}));

setItems(updated);

updated.forEach((item:any)=>{
updateItemRank(listId,item.id,item.rank);
});

};

/* ITEM */

const renderItem=({item,drag,isActive}:any)=>{

return(

<Swipeable
renderRightActions={()=>renderRightActions(item)}
onSwipeableOpen={()=>handleRemove(item)}
>

<TouchableOpacity
onLongPress={drag}
activeOpacity={0.9}
style={{
marginBottom:18,
opacity:isActive?0.85:1
}}
>

<LinearGradient
colors={["#1a1a1a","#0b0b0b"]}
style={styles.card}
>

<Image
source={{uri:`${IMAGE_BASE_URL}${item.poster_path}`}}
style={styles.image}
/>

<View style={{flex:1}}>

<View style={styles.titleRow}>

<Text style={styles.title}>
{item.title}
</Text>

<View style={styles.rankBadge}>
<Text style={styles.rankText}>
#{item.rank}
</Text>
</View>

</View>

<AnimatedStarRating
rating={item.userRating||0}
onRate={(value:number)=>{

setItems(prev=>
prev.map(i=>
i.id===item.id
?{...i,userRating:value}
:i
)
);

updateItemRating(listId,item.id,value);

}}
/>

<View style={styles.row}>

<TouchableOpacity
style={[
styles.watchedBtn,
item.watched && styles.watchedActive
]}
onPress={()=>{

setItems(prev=>
prev.map(i=>
i.id===item.id
?{...i,watched:!i.watched}
:i
)
);

toggleWatchedStatus(
listId,
item.id,
item.watched
);

}}
>

<Text style={styles.watchedText}>
{item.watched?"✓ Watched":"Mark Watched"}
</Text>

</TouchableOpacity>

</View>

</View>

</LinearGradient>

</TouchableOpacity>

</Swipeable>

);

};

/* UI */

return(

<SafeAreaView style={styles.safe}>

<View style={styles.container}>

{items.length>0 &&(

<View style={styles.cover}>

<Image
source={{uri:`${IMAGE_BASE_URL}${items[0].poster_path}`}}
style={styles.coverImage}
/>

<LinearGradient
colors={["transparent","rgba(0,0,0,0.8)"]}
style={styles.coverGradient}
/>

<Text style={styles.coverText}>
{items.length} Items
</Text>

</View>

)}

<TextInput
placeholder="Search movies & series..."
placeholderTextColor="#888"
style={styles.search}
value={query}
onChangeText={setQuery}
/>

{results.length>0&&(

<View style={styles.searchOverlay}>

<ScrollView>

{results.map(item=>(

<TouchableOpacity
key={item.id}
style={styles.suggestionItem}
onPress={()=>handleAdd(item)}
>

<Image
source={{
uri:item.poster_path
?`${IMAGE_BASE_URL}${item.poster_path}`
:"https://via.placeholder.com/60x90"
}}
style={styles.suggestionPoster}
/>

<View style={{flex:1}}>

<Text style={styles.suggestionTitle}>
{item.title||item.name}
</Text>

<Text style={styles.suggestionSub}>
{item.release_date||item.first_air_date||"Unknown"}
</Text>

</View>

</TouchableOpacity>

))}

</ScrollView>

</View>

)}

<DraggableFlatList
data={items}
keyExtractor={(item)=>item.id.toString()}
renderItem={renderItem}
onDragEnd={handleDragEnd}
activationDistance={10}
contentContainerStyle={{paddingBottom:120}}
/>

</View>

</SafeAreaView>

);

}

/* STYLES */

const styles=StyleSheet.create({

safe:{flex:1,backgroundColor:"#000"},

container:{flex:1,paddingHorizontal:20},

cover:{
height:220,
borderRadius:20,
overflow:"hidden",
marginBottom:20,
marginTop:10
},

coverImage:{
width:"100%",
height:"100%",
position:"absolute"
},

coverGradient:{
...StyleSheet.absoluteFillObject
},

coverText:{
position:"absolute",
bottom:20,
left:20,
color:"#fff",
fontSize:24,
fontWeight:"bold"
},

search:{
backgroundColor:"#121212",
padding:14,
borderRadius:14,
color:"#fff",
marginBottom:10,
fontSize:15
},

searchOverlay:{
position:"absolute",
top:330,
left:20,
right:20,
backgroundColor:"#111",
borderRadius:16,
padding:12,
zIndex:100,
maxHeight:300
},

card:{
flexDirection:"row",
padding:14,
borderRadius:18
},

image:{
width:80,
height:120,
borderRadius:10,
marginRight:12
},

titleRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center"
},

title:{
color:"#fff",
fontWeight:"bold",
fontSize:16,
flex:1
},

rankBadge:{
backgroundColor:"#e50914",
paddingHorizontal:10,
paddingVertical:4,
borderRadius:10
},

rankText:{
color:"#fff",
fontWeight:"bold"
},

row:{
marginTop:10
},

watchedBtn:{
paddingHorizontal:12,
paddingVertical:6,
borderRadius:10,
backgroundColor:"#1a1a1a",
alignSelf:"flex-start"
},

watchedActive:{
backgroundColor:"#00cc77"
},

watchedText:{
color:"#fff",
fontSize:13
},

deleteBox:{
backgroundColor:"#e50914",
justifyContent:"center",
alignItems:"center",
width:100,
borderRadius:18,
marginBottom:18
},

deleteText:{
color:"#fff",
fontWeight:"bold"
},

suggestionItem:{
flexDirection:"row",
alignItems:"center",
padding:10,
borderBottomWidth:1,
borderBottomColor:"#222"
},

suggestionPoster:{
width:50,
height:75,
borderRadius:6,
marginRight:12
},

suggestionTitle:{
color:"#fff",
fontWeight:"600"
},

suggestionSub:{
color:"#888",
fontSize:12
}

});