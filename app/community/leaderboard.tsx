import { useEffect, useState, useRef } from "react";
import {
View,
Text,
StyleSheet,
FlatList,
Image,
Animated,
RefreshControl
} from "react-native";

import {
collection,
query,
orderBy,
limit,
getDocs,
doc,
getDoc
} from "firebase/firestore";

import ConfettiCannon from "react-native-confetti-cannon";

import { db } from "../../services/firebase";

export default function LeaderboardScreen(){

const [users,setUsers] = useState<any[]>([]);
const [refreshing,setRefreshing] = useState(false);

const glowAnim = useRef(new Animated.Value(0)).current;

/* ================= LOAD LEADERBOARD ================= */

const loadLeaderboard = async()=>{

const q = query(
collection(db,"leaderboard"),
orderBy("score","desc"),
limit(50)
);

const snap = await getDocs(q);

const data = await Promise.all(

snap.docs.map(async(docSnap,index)=>{

const uid = docSnap.id;
const score = docSnap.data().score || 0;

const userSnap = await getDoc(doc(db,"users",uid));

const username =
userSnap.exists()
? userSnap.data().username
: "User";

/* USER LEVEL */

let level = "Explorer";

if(score >= 50) level = "Legend";
else if(score >= 20) level = "Critic";
else if(score >= 5) level = "Cinephile";

return{
uid,
rank:index+1,
score,
username,
level
};

})

);

setUsers(data);

/* START GLOW */

Animated.loop(
Animated.sequence([
Animated.timing(glowAnim,{
toValue:1,
duration:1500,
useNativeDriver:false
}),
Animated.timing(glowAnim,{
toValue:0,
duration:1500,
useNativeDriver:false
})
])
).start();

};

useEffect(()=>{

loadLeaderboard();

},[]);

/* ================= REFRESH ================= */

const onRefresh = async()=>{

setRefreshing(true);

await loadLeaderboard();

setRefreshing(false);

};

/* ================= CARD COLOR ================= */

const getCardStyle = (rank:number)=>{

if(rank === 1){
return styles.goldCard;
}

if(rank === 2){
return styles.silverCard;
}

if(rank === 3){
return styles.bronzeCard;
}

return styles.normalCard;

};

/* ================= RENDER USER ================= */

const renderItem = ({item,index}:any)=>{

const avatar =
`https://api.dicebear.com/7.x/bottts/png?seed=${item.username}`;

let medal = "";

if(item.rank === 1) medal="🥇";
if(item.rank === 2) medal="🥈";
if(item.rank === 3) medal="🥉";

/* ENTRY ANIMATION */

const translate = new Animated.Value(30);
const opacity = new Animated.Value(0);

Animated.parallel([
Animated.timing(translate,{
toValue:0,
duration:500,
delay:index*80,
useNativeDriver:false
}),
Animated.timing(opacity,{
toValue:1,
duration:500,
delay:index*80,
useNativeDriver:false
})
]).start();

/* GLOW FOR #1 */

const glowColor = glowAnim.interpolate({
inputRange:[0,1],
outputRange:["#222","#ffd700"]
});

return(

<Animated.View
style={[
styles.card,
getCardStyle(item.rank),
item.rank === 1 && {shadowColor:glowColor},
{
opacity,
transform:[{translateY:translate}]
}
]}
>

<Text style={styles.rank}>
#{item.rank}
</Text>

<Image
source={{uri:avatar}}
style={styles.avatar}
/>

<View style={{flex:1}}>

<Text style={styles.username}>
{item.username}
</Text>

<Text style={styles.level}>
{item.level}
</Text>

</View>

<Text style={styles.score}>
{item.score} {medal}
</Text>

</Animated.View>

);

};

/* ================= UI ================= */

return(

<View style={styles.container}>

<Text style={styles.title}>
Leaderboard
</Text>

{/* CONFETTI FOR #1 */}

{users.length > 0 && users[0].rank === 1 && (
<ConfettiCannon
count={40}
origin={{x:-10,y:0}}
fadeOut
/>
)}

<FlatList
data={users}
keyExtractor={(item)=>item.uid}
renderItem={renderItem}
showsVerticalScrollIndicator={false}
refreshControl={
<RefreshControl
refreshing={refreshing}
onRefresh={onRefresh}
tintColor="#e50914"
/>
}
/>

</View>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
paddingTop:60,
paddingHorizontal:20
},

title:{
color:"#fff",
fontSize:28,
fontWeight:"bold",
marginBottom:20
},

card:{
flexDirection:"row",
alignItems:"center",
padding:16,
borderRadius:18,
marginBottom:12
},

normalCard:{
backgroundColor:"#111"
},

goldCard:{
backgroundColor:"#2b2200",
borderColor:"#ffd700",
borderWidth:1
},

silverCard:{
backgroundColor:"#1c1c1c",
borderColor:"#aaa",
borderWidth:1
},

bronzeCard:{
backgroundColor:"#2a1a10",
borderColor:"#cd7f32",
borderWidth:1
},

rank:{
color:"#e50914",
fontWeight:"bold",
width:40,
fontSize:16
},

avatar:{
width:42,
height:42,
borderRadius:21,
marginRight:12
},

username:{
color:"#fff",
fontWeight:"bold",
fontSize:16
},

level:{
color:"#aaa",
fontSize:12,
marginTop:2
},

score:{
color:"#ffd700",
fontWeight:"bold",
fontSize:16
}

});