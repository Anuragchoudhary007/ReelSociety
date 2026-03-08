import { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
FlatList,
Image,
TextInput,
Dimensions
} from "react-native";

import {
collection,
getDocs,
getDoc,
doc
} from "firebase/firestore";

import { db } from "../../../../services/firebase";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function FriendListScreen(){

const { uid, listId } = useLocalSearchParams();

const [listInfo,setListInfo] = useState<any>(null);
const [items,setItems] = useState<any[]>([]);
const [search,setSearch] = useState("");

useEffect(()=>{

const loadData = async()=>{

if(!uid || !listId) return;

const listSnap = await getDoc(
doc(db,"users",String(uid),"lists",String(listId))
);

if(listSnap.exists()){
setListInfo(listSnap.data());
}

const itemsSnap = await getDocs(
collection(
db,
"users",
String(uid),
"lists",
String(listId),
"items"
)
);

const data:any[] = [];

itemsSnap.forEach(docSnap=>{
data.push({id:docSnap.id,...docSnap.data()});
});

setItems(data);

};

loadData();

},[uid,listId]);

const filtered = items.filter(item =>
item.title?.toLowerCase().includes(search.toLowerCase())
);

const renderStars = (rating=0)=>{
return [1,2,3,4,5].map((_,i)=>(
<Text key={i} style={{color:i<rating?"#FFD700":"#333"}}>
★
</Text>
));
};

return(

<View style={styles.container}>

{/* Banner */}

{items[0]?.poster_path && (

<Image
source={{
uri:`https://image.tmdb.org/t/p/w780${items[0].poster_path}`
}}
style={styles.bannerImage}
/>

)}

<LinearGradient
colors={["transparent","#000"]}
style={styles.gradient}
/>

<View style={styles.headerContent}>

<Text style={styles.title}>
{listInfo?.title}
</Text>

<Text style={styles.count}>
{items.length} Items
</Text>

</View>

{/* Search */}

<TextInput
placeholder="Search movies..."
placeholderTextColor="#777"
value={search}
onChangeText={setSearch}
style={styles.search}
/>

{/* List */}

<FlatList
data={filtered}
keyExtractor={(item)=>item.id}
contentContainerStyle={{paddingBottom:50}}

renderItem={({item,index})=>(

<View style={styles.card}>

<Image
source={{
uri:item.poster_path
?`https://image.tmdb.org/t/p/w500${item.poster_path}`
:undefined
}}
style={styles.poster}
/>

<View style={styles.info}>

<Text style={styles.movieTitle}>
{item.title}
</Text>

<View style={{flexDirection:"row",marginVertical:4}}>
{renderStars(item.userRating)}
</View>

<Text style={{
color:item.watched?"#00ff88":"#aaa"
}}>
{item.watched?"✓ Watched":"Not watched"}
</Text>

</View>

<Text style={styles.rank}>
#{index+1}
</Text>

</View>

)}
/>

</View>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000"
},

bannerImage:{
width:width,
height:200
},

gradient:{
position:"absolute",
width:width,
height:200
},

headerContent:{
paddingHorizontal:20,
marginTop:-60,
marginBottom:20
},

title:{
color:"#fff",
fontSize:28,
fontWeight:"bold"
},

count:{
color:"#e50914",
marginTop:5
},

search:{
backgroundColor:"#111",
marginHorizontal:20,
padding:12,
borderRadius:20,
color:"#fff",
marginBottom:20
},

card:{
flexDirection:"row",
backgroundColor:"#111",
marginHorizontal:20,
marginBottom:15,
padding:18,
borderRadius:25,
alignItems:"center"
},

poster:{
width:80,
height:115,
borderRadius:15
},

info:{
flex:1,
marginLeft:15
},

movieTitle:{
color:"#fff",
fontSize:18,
fontWeight:"bold"
},

rank:{
color:"#e50914",
fontSize:18,
fontWeight:"bold"
}

});