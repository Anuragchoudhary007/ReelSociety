import { useEffect, useState } from "react";
import {
View,
Text,
FlatList,
Image,
StyleSheet,
TouchableOpacity,
ActivityIndicator
} from "react-native";

import {
collection,
query,
orderBy,
limit,
onSnapshot
} from "firebase/firestore";

import { db } from "../services/firebase";
import { useRouter } from "expo-router";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function Feed(){

const router = useRouter();

const [activities,setActivities] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

/* ================= LOAD GLOBAL FEED ================= */

useEffect(()=>{

const q = query(
collection(db,"activity"),
orderBy("createdAt","desc"),
limit(50)
);

const unsubscribe = onSnapshot(q,(snapshot)=>{

const data = snapshot.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setActivities(data);
setLoading(false);

});

return unsubscribe;

},[]);

/* ================= TIME FORMAT ================= */

const timeAgo = (timestamp:number)=>{

const diff = Date.now() - timestamp;

const minutes = Math.floor(diff / 60000);
const hours = Math.floor(diff / 3600000);
const days = Math.floor(diff / 86400000);

if(minutes < 60) return `${minutes}m ago`;
if(hours < 24) return `${hours}h ago`;
return `${days}d ago`;

};

/* ================= RENDER ITEM ================= */

const renderItem = ({item}:any)=>{

let text = "";

if(item.type === "added_movie"){
text = `added ${item.movieTitle}`;
}

if(item.type === "watched_movie"){
text = `watched ${item.movieTitle}`;
}

if(item.type === "rated_movie"){
text = `rated ${item.movieTitle} ★${item.rating}`;
}

if(item.type === "new_user"){
text = `joined ReelSociety`;
}

const avatar =
item.avatar ||
`https://api.dicebear.com/7.x/bottts/png?seed=${item.username}`;

return(

<View style={styles.card}>

<Image
source={{uri:avatar}}
style={styles.avatar}
/>

<View style={{flex:1}}>

<Text style={styles.text}>

<Text style={styles.username}>
{item.username}
</Text>{" "}

{text}

</Text>

<Text style={styles.time}>
{timeAgo(item.createdAt)}
</Text>

{item.poster && (

<TouchableOpacity
onPress={()=>router.push(`/movie/${item.movieId}`)}
>

<Image
source={{uri:`${IMAGE_BASE}${item.poster}`}}
style={styles.poster}
/>

</TouchableOpacity>

)}

</View>

</View>

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

<FlatList
style={styles.container}
data={activities}
keyExtractor={(item)=>item.id}
renderItem={renderItem}
/>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
padding:20
},

loading:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

card:{
flexDirection:"row",
marginBottom:22,
backgroundColor:"#111",
padding:12,
borderRadius:14
},

avatar:{
width:40,
height:40,
borderRadius:20,
marginRight:12
},

text:{
color:"#fff",
fontSize:14
},

username:{
fontWeight:"bold",
color:"#e50914"
},

time:{
color:"#777",
fontSize:12,
marginTop:4
},

poster:{
width:110,
height:160,
borderRadius:10,
marginTop:8
}

});