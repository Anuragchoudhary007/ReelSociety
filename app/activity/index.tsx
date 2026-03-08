import { useEffect,useState } from "react";
import {
View,
Text,
FlatList,
Image,
StyleSheet
} from "react-native";

import {
collection,
query,
orderBy,
limit,
onSnapshot
} from "firebase/firestore";

import { db } from "../../services/firebase";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function ActivityFeed(){

const [feed,setFeed] = useState<any[]>([]);

useEffect(()=>{

const q = query(
collection(db,"activity"),
orderBy("createdAt","desc"),
limit(50)
);

const unsub = onSnapshot(q,(snap)=>{

const data = snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setFeed(data);

});

return unsub;

},[]);

const renderItem = ({item}:any)=>{

let text="";

if(item.type==="added_movie")
text=`${item.username} added ${item.movieTitle}`;

if(item.type==="watched_movie")
text=`${item.username} watched ${item.movieTitle}`;

if(item.type==="rated_movie")
text=`${item.username} rated ${item.movieTitle} ★${item.rating}`;

if(item.type==="new_user")
text=`${item.username} joined ReelSociety`;

return(

<View style={styles.card}>

<Image
source={{uri:item.avatar}}
style={styles.avatar}
/>

<View style={{flex:1}}>

<Text style={styles.text}>
{text}
</Text>

{item.poster && (

<Image
source={{uri:`${IMAGE_BASE}${item.poster}`}}
style={styles.poster}
/>

)}

</View>

</View>

);

};

return(

<FlatList
style={styles.container}
data={feed}
keyExtractor={(item)=>item.id}
renderItem={renderItem}
/>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
padding:20
},

card:{
flexDirection:"row",
marginBottom:20
},

avatar:{
width:40,
height:40,
borderRadius:20,
marginRight:10
},

text:{
color:"#fff",
marginBottom:6
},

poster:{
width:90,
height:130,
borderRadius:8
}

});