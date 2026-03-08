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

import {
onSnapshot,
doc,
getDoc,
collection,
query,
orderBy,
limit,
getDocs
} from "firebase/firestore";

import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../../services/firebase";
import { getUserLists, getListItems } from "../../services/lists";
import { useRouter } from "expo-router";
import { listenToFriendCount } from "../../services/friends";

export default function ProfileScreen(){

const router = useRouter();

/* STATES */

const [watchlistCount,setWatchlistCount] = useState(0);
const [listCount,setListCount] = useState(0);
const [watchedCount,setWatchedCount] = useState(0);
const [friendCount,setFriendCount] = useState(0);

const [leaderboard,setLeaderboard] = useState<any[]>([]);
const [userRank,setUserRank] = useState<number | null>(null);

const [activity,setActivity] = useState<any[]>([]);

const [loading,setLoading] = useState(true);
const [userData,setUserData] = useState<any>(null);

/* FRIEND COUNT */

useEffect(()=>{
const unsubscribe = listenToFriendCount(setFriendCount);
return unsubscribe;
},[]);

/* PROFILE DATA */

useEffect(()=>{

const unsubscribe = auth.onAuthStateChanged(async(user)=>{

if(!user) return;

try{

const lists = await getUserLists();
setListCount(lists.length);

let watchlistItems = 0;

for(const list of lists){

const items = await getListItems(list.id);
watchlistItems += items.length;

}

setWatchlistCount(watchlistItems);
setWatchedCount(watchlistItems);

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

/* LEADERBOARD */

useEffect(()=>{

const loadLeaderboard = async ()=>{

const q = query(
collection(db,"leaderboard"),
orderBy("score","desc"),
limit(10)
);

const snapshot = await getDocs(q);

const top = snapshot.docs.map((doc,i)=>({
rank:i+1,
uid:doc.id,
...doc.data()
}));

setLeaderboard(top);

/* FIND USER RANK */

const all = await getDocs(
query(collection(db,"leaderboard"),orderBy("score","desc"))
);

let rank = 1;

all.docs.forEach((d)=>{

if(d.id === auth.currentUser?.uid){
setUserRank(rank);
}

rank++;

});

};

loadLeaderboard();

},[]);

/* GLOBAL ACTIVITY */

useEffect(()=>{

const q = query(
collection(db,"activity"),
orderBy("createdAt","desc"),
limit(50)
);

return onSnapshot(q,(snapshot)=>{

const items = snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

setActivity(items);

});

},[]);

/* LOGOUT */

const handleLogout = async ()=>{
await auth.signOut();
router.replace("/login");
};

/* DELETE ACCOUNT */

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

/* LOADING */

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

/* UI */

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

{/* FRIENDS */}

<Text style={styles.sectionTitle}>Community</Text>

<View style={styles.actions}>

<TouchableOpacity
style={styles.actionBtn}
onPress={()=>router.push("/users/friends")}
>

<Text style={styles.actionText}>
Friends
</Text>

</TouchableOpacity>

</View>

{/* LEADERBOARD */}

<Text style={styles.sectionTitle}>Leaderboard</Text>

<View style={styles.fixedBox}>

<ScrollView showsVerticalScrollIndicator={false}>

{leaderboard.map((u:any)=>{

let badge = "";

if(u.rank === 1) badge = "🥇";
if(u.rank === 2) badge = "🥈";
if(u.rank === 3) badge = "🥉";

return(

<View key={u.uid} style={styles.rankRow}>

<Image
source={{
uri:`https://api.dicebear.com/7.x/bottts/png?seed=${u.uid}`
}}
style={styles.rankAvatar}
/>

<Text style={styles.rankUser}>
{u.username || "User"}
</Text>

<Text style={styles.rankScore}>
#{u.rank} • {u.score} {badge}
</Text>

</View>

);

})}

<Text style={styles.yourRank}>
Your Rank #{userRank}
</Text>

</ScrollView>

</View>

{/* GLOBAL FEED */}

<Text style={styles.sectionTitle}>Activity</Text>

<View style={styles.fixedBox}>

<ScrollView showsVerticalScrollIndicator={false}>

{activity.map(item=>{

return(

<View key={item.id} style={styles.feedItem}>

<Image
source={{uri:item.avatar}}
style={styles.feedAvatar}
/>

<View style={{flex:1}}>

<Text style={styles.feedUser}>
{item.username}
</Text>

<Text style={styles.feedMovie}>
{item.movieTitle}
</Text>

{item.rating && (
<Text style={styles.feedRating}>
⭐ {item.rating}/5
</Text>
)}

</View>

{item.poster ? (

<Image
source={{
uri:`https://image.tmdb.org/t/p/w500${item.poster}`
}}
style={styles.feedPoster}
/>

) : null}

</View>

);

})}

</ScrollView>

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

/* STAT CARD */

function StatCard({value,label}:{value:number,label:string}){

return(

<View style={styles.statCard}>

<Text style={styles.statNumber}>
{value}
</Text>

<Text style={styles.statLabel}>
{label}
</Text>

</View>

);

}

/* STYLES */

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
alignItems:"center"
},

actionText:{
color:"#fff",
fontWeight:"600"
},

fixedBox:{
backgroundColor:"#111",
marginHorizontal:20,
marginTop:15,
borderRadius:16,
height:220,
padding:15
},

rankRow:{
flexDirection:"row",
alignItems:"center",
marginBottom:12
},

rankAvatar:{
width:30,
height:30,
borderRadius:15,
marginRight:10
},

rankUser:{color:"#fff",flex:1},

rankScore:{color:"#e50914"},

yourRank:{
marginTop:10,
color:"#fff",
fontWeight:"bold"
},

feedItem:{
flexDirection:"row",
alignItems:"center",
marginBottom:14
},

feedAvatar:{
width:36,
height:36,
borderRadius:18,
marginRight:10
},

feedUser:{
color:"#fff",
fontWeight:"600"
},

feedMovie:{
color:"#aaa",
fontSize:13
},

feedRating:{
color:"#e50914",
fontSize:12
},

feedPoster:{
width:40,
height:60,
borderRadius:6,
marginLeft:10
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