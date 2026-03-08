import { useLocalSearchParams } from "expo-router";
import {
View,
Text,
StyleSheet,
FlatList,
Image,
TouchableOpacity,
Dimensions,
ScrollView,
ActivityIndicator
} from "react-native";

import { useEffect,useState } from "react";

import {
fetchPersonDetails,
fetchPersonCredits,
IMAGE_BASE_URL
} from "../../services/tmdb";

import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const POSTER_WIDTH = width / 3 - 14;

export default function PersonScreen(){

const { id } = useLocalSearchParams();
const router = useRouter();

const [person,setPerson] = useState<any>(null);
const [credits,setCredits] = useState<any[]>([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const load = async()=>{

try{

const details = await fetchPersonDetails(id as string);

const movieCredits = await fetchPersonCredits(id as string);

const filtered = movieCredits.filter(
(item:any)=>item.poster_path
);

setPerson(details);
setCredits(filtered);

}catch(e){
console.log("Person load error",e);
}

setLoading(false);

};

load();

},[id]);

if(loading){

return(
<View style={styles.center}>
<ActivityIndicator size="large" color="#e50914"/>
</View>
);

}

if(!person) return null;

const profile =
person.profile_path
? `${IMAGE_BASE_URL}${person.profile_path}`
: "https://via.placeholder.com/300x450?text=No+Image";

return(

<ScrollView style={styles.container}>

<View style={styles.hero}>

<Image
source={{uri:profile}}
style={styles.profile}
/>

<Text style={styles.name}>
{person.name}
</Text>

<Text style={styles.meta}>
{person.known_for_department}
</Text>

</View>

{person.biography ? (

<View style={styles.bioSection}>

<Text style={styles.sectionTitle}>
Biography
</Text>

<Text
numberOfLines={5}
style={styles.bio}
>
{person.biography}
</Text>

</View>

) : null}

<Text style={styles.sectionTitle}>
Filmography
</Text>

<FlatList
data={credits}
keyExtractor={(item)=>item.id.toString()}
numColumns={3}
scrollEnabled={false}

renderItem={({item})=>{

return(

<TouchableOpacity
style={styles.card}
onPress={()=>router.push(`/movie/${item.id}`)}
>

<Image
source={{
uri:`${IMAGE_BASE_URL}${item.poster_path}`
}}
style={styles.poster}
/>

<Text
numberOfLines={2}
style={styles.movieTitle}
>
{item.title || item.name}
</Text>

</TouchableOpacity>

);

}}
/>

<View style={{height:120}}/>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000"
},

center:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

hero:{
alignItems:"center",
paddingTop:70,
paddingBottom:20
},

profile:{
width:160,
height:160,
borderRadius:80,
marginBottom:12
},

name:{
color:"#fff",
fontSize:24,
fontWeight:"bold"
},

meta:{
color:"#aaa",
marginTop:4
},

bioSection:{
paddingHorizontal:20,
marginTop:20
},

sectionTitle:{
color:"#fff",
fontSize:20,
fontWeight:"bold",
marginTop:25,
marginBottom:10,
marginLeft:15
},

bio:{
color:"#ccc",
lineHeight:22
},

card:{
width:POSTER_WIDTH,
margin:6
},

poster:{
width:"100%",
height:180,
borderRadius:12
},

movieTitle:{
color:"#ccc",
fontSize:12,
marginTop:4
}

});