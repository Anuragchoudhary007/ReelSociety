import { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
Image,
ScrollView,
ActivityIndicator,
Alert
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { auth, db } from "../../services/firebase";
import { getUserLists, getListItems } from "../../services/lists";
import { listenToFriendCount } from "../../services/friends";

import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function ProfileScreen(){

const router = useRouter();

/* ================= STATES ================= */

const [watchlistCount,setWatchlistCount] = useState(0);
const [listCount,setListCount] = useState(0);
const [watchedCount,setWatchedCount] = useState(0);
const [friendCount,setFriendCount] = useState(0);

const [loading,setLoading] = useState(true);
const [userData,setUserData] = useState<any>(null);

/* ================= FRIEND COUNT ================= */

useEffect(()=>{
const unsubscribe = listenToFriendCount(setFriendCount);
return unsubscribe;
},[]);

/* ================= PROFILE DATA ================= */

useEffect(()=>{

const unsubscribe = auth.onAuthStateChanged(async(user)=>{

if(!user) return;

try{

const lists = await getUserLists();
setListCount(lists.length);

let watchlistItems = 0;
let watched = 0;

for(const list of lists){

const items = await getListItems(list.id);

watchlistItems += items.length;

items.forEach((item:any)=>{
if(item.watched) watched++;
});

}

setWatchlistCount(watchlistItems);
setWatchedCount(watched);

const snap = await getDoc(doc(db,"users",user.uid));

if(snap.exists()){
setUserData(snap.data());
}

}catch(err){
console.log("Profile Load Error:",err);
}

setLoading(false);

});

return unsubscribe;

},[]);

/* ================= LOGOUT ================= */

const handleLogout = async ()=>{
await auth.signOut();
router.replace("/login");
};

/* ================= DELETE ACCOUNT ================= */

const handleDelete = ()=>{

Alert.alert(
"Delete Account",
"This action is permanent.",
[
{ text:"Cancel", style:"cancel" },
{
text:"Delete",
style:"destructive",
onPress: async ()=>{
const user = auth.currentUser;
if(user){
await user.delete();
router.replace("/login");
}
}
}
]
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

const user = auth.currentUser;

const avatar =
user?.photoURL ||
`https://api.dicebear.com/7.x/bottts/png?seed=${userData?.username || user?.email}`;

/* ================= UI ================= */

return(

<ScrollView style={styles.container}>

{/* HEADER */}

<LinearGradient colors={["#1a1a1a","#000"]} style={styles.header}>

<Image source={{uri:avatar}} style={styles.avatar}/>

<Text style={styles.name}>
{userData?.username || "ReelSociety User"}
</Text>

<Text style={styles.email}>
{user?.email}
</Text>

</LinearGradient>

{/* STATS */}

<View style={styles.statsRow}>

<StatCard value={watchedCount} label="Watched"/>
<StatCard value={watchlistCount} label="Watchlist"/>
<StatCard value={listCount} label="Lists"/>
<StatCard value={friendCount} label="Friends"/>

</View>

{/* COMMUNITY */}

<Text style={styles.sectionTitle}>Community</Text>

<View style={styles.actions}>

<TouchableOpacity
style={styles.actionBtn}
onPress={()=>router.push("/users/friends")}
>
<Text style={styles.actionText}>Friends</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.actionBtn}
onPress={()=>router.push("/community/leaderboard")}
>
<Text style={styles.actionText}>Leaderboard</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.actionBtn}
onPress={()=>router.push("/community/activity")}
>
<Text style={styles.actionText}>Activity</Text>
</TouchableOpacity>

</View>

{/* ACCOUNT */}

<View style={styles.actions}>

<TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
<Text style={styles.logoutText}>Logout</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
<Text style={styles.deleteText}>Delete Account</Text>
</TouchableOpacity>

</View>

{/* CREDIT */}

<View style={styles.credit}>
<Text style={styles.creditText}>Created by</Text>
<Text style={styles.creditName}>Anurag Choudhary</Text>
</View>

<View style={{height:120}}/>

</ScrollView>

);

}

/* ================= STAT CARD ================= */

function StatCard({value,label}:{value:number,label:string}){

return(

<View style={styles.statCard}>
<Text style={styles.statNumber}>{value}</Text>
<Text style={styles.statLabel}>{label}</Text>
</View>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{flex:1,backgroundColor:"#000"},

loading:{flex:1,backgroundColor:"#000",justifyContent:"center",alignItems:"center"},

header:{paddingTop:90,paddingBottom:40,alignItems:"center"},

avatar:{width:130,height:130,borderRadius:65,marginBottom:16,borderWidth:3,borderColor:"#e50914"},

name:{color:"#fff",fontSize:24,fontWeight:"bold"},

email:{color:"#aaa",marginTop:4},

statsRow:{
flexDirection:"row",
justifyContent:"space-between",
paddingHorizontal:20,
marginTop:20
},

statCard:{
backgroundColor:"#111",
paddingVertical:14,
borderRadius:12,
alignItems:"center",
flex:1,
marginHorizontal:4
},

statNumber:{color:"#e50914",fontSize:18,fontWeight:"bold"},

statLabel:{color:"#aaa",fontSize:12,marginTop:4},

sectionTitle:{
color:"#fff",
fontSize:20,
fontWeight:"bold",
marginTop:35,
marginLeft:20
},

actions:{
marginTop:15,
paddingHorizontal:20
},

actionBtn:{
borderWidth:1,
borderColor:"#333",
paddingVertical:14,
borderRadius:30,
alignItems:"center",
marginBottom:12
},

actionText:{
color:"#fff",
fontWeight:"600"
},

logoutBtn:{
backgroundColor:"#e50914",
paddingVertical:14,
borderRadius:30,
alignItems:"center",
marginBottom:20
},

logoutText:{color:"#fff",fontWeight:"bold"},

deleteBtn:{
borderWidth:1,
borderColor:"#ff4444",
paddingVertical:14,
borderRadius:30,
alignItems:"center"
},

deleteText:{color:"#ff4444"},

credit:{
alignItems:"center",
marginTop:60
},

creditText:{color:"#555"},

creditName:{
color:"#e50914",
fontSize:16,
marginTop:4,
fontWeight:"bold"
}

});