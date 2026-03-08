import { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
Image,
FlatList,
TouchableOpacity,
ScrollView
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
doc,
getDoc,
collection,
getDocs
} from "firebase/firestore";

import { db } from "../../../services/firebase";

export default function FriendProfile(){

const router = useRouter();
const { uid } = useLocalSearchParams();

const [userData,setUserData] = useState<any>(null);
const [lists,setLists] = useState<any[]>([]);

useEffect(()=>{
load();
},[]);

const load = async()=>{

if(!uid) return;

/* USER PROFILE */

const userSnap = await getDoc(doc(db,"users",String(uid)));

if(userSnap.exists()){
setUserData(userSnap.data());
}

/* USER LISTS */

const listsSnap = await getDocs(
collection(db,"users",String(uid),"lists")
);

const userLists = listsSnap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setLists(userLists);

};

const avatar =
`https://api.dicebear.com/7.x/bottts/png?seed=${userData?.username || uid}`;

return(

<ScrollView style={styles.container}>

<View style={styles.header}>

<Image
source={{uri:avatar}}
style={styles.avatar}
/>

<Text style={styles.username}>
{userData?.username || "User"}
</Text>

</View>

<Text style={styles.section}>
Lists
</Text>

<FlatList
horizontal
data={lists}
keyExtractor={(item)=>item.id}
showsHorizontalScrollIndicator={false}
renderItem={({item})=>(

<TouchableOpacity
style={styles.listCard}
onPress={()=>router.push(`/users/${uid}/list/${item.id}`)}
>

<Text style={styles.listTitle}>
{item.title}
</Text>

</TouchableOpacity>

)}
/>

<View style={{height:120}}/>

</ScrollView>

);

}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
padding:20
},

header:{
alignItems:"center",
marginBottom:30
},

avatar:{
width:120,
height:120,
borderRadius:60,
marginBottom:12
},

username:{
color:"#fff",
fontSize:22,
fontWeight:"bold"
},

section:{
color:"#fff",
fontSize:18,
marginBottom:12
},

listCard:{
backgroundColor:"#111",
padding:20,
borderRadius:12,
marginRight:12
},

listTitle:{
color:"#fff",
fontWeight:"bold"
}

});