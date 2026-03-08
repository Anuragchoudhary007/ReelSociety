import { useState, useEffect } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
FlatList,
TextInput,
Image
} from "react-native";

import {
collection,
query,
where,
getDocs,
onSnapshot
} from "firebase/firestore";

import { db, auth } from "../../services/firebase";

export default function FriendsHub(){

const [tab,setTab] = useState("friends");

const [friends,setFriends] = useState<any[]>([]);
const [requests,setRequests] = useState<any[]>([]);
const [users,setUsers] = useState<any[]>([]);

const [search,setSearch] = useState("");

/* ================= LOAD FRIENDS ================= */

useEffect(()=>{

const uid = auth.currentUser?.uid;
if(!uid) return;

const q = query(
collection(db,"friends"),
where("userId","==",uid)
);

return onSnapshot(q,(snapshot)=>{

const data = snapshot.docs.map(doc=>doc.data());

setFriends(data);

});

},[]);

/* ================= LOAD REQUESTS ================= */

useEffect(()=>{

const uid = auth.currentUser?.uid;
if(!uid) return;

const q = query(
collection(db,"friendRequests"),
where("receiverId","==",uid)
);

return onSnapshot(q,(snapshot)=>{

const data = snapshot.docs.map(doc=>doc.data());

setRequests(data);

});

},[]);

/* ================= SEARCH USERS ================= */

const searchUsers = async(text:string)=>{

setSearch(text);

if(text.length < 2) return;

const snapshot = await getDocs(collection(db,"users"));

const results = snapshot.docs
.map(doc=>({
id:doc.id,
...doc.data()
}))
.filter((u:any)=>
u.username?.toLowerCase().includes(text.toLowerCase())
);

setUsers(results);

};

/* ================= RENDER ================= */

const renderFriends = ()=>{

return(

<FlatList
data={friends}
keyExtractor={(item,i)=>i.toString()}
renderItem={({item})=>(

<View style={styles.row}>
<Text style={styles.name}>
Friend
</Text>
</View>

)}
/>

);

};

const renderRequests = ()=>{

return(

<FlatList
data={requests}
keyExtractor={(item,i)=>i.toString()}
renderItem={({item})=>(

<View style={styles.row}>
<Text style={styles.name}>
Friend Request
</Text>
</View>

)}
/>

);

};

const renderSearch = ()=>{

return(

<View>

<TextInput
placeholder="Search users..."
placeholderTextColor="#777"
style={styles.input}
value={search}
onChangeText={searchUsers}
/>

<FlatList
data={users}
keyExtractor={(item)=>item.id}
renderItem={({item})=>(

<View style={styles.row}>
<Text style={styles.name}>
{item.username}
</Text>
</View>

)}
/>

</View>

);

};

/* ================= UI ================= */

return(

<View style={styles.container}>

<Text style={styles.header}>
Friends
</Text>

{/* TABS */}

<View style={styles.tabs}>

<TabBtn
title="Friends"
active={tab==="friends"}
onPress={()=>setTab("friends")}
/>

<TabBtn
title="Find"
active={tab==="search"}
onPress={()=>setTab("search")}
/>

<TabBtn
title="Requests"
active={tab==="requests"}
onPress={()=>setTab("requests")}
/>

</View>

{/* CONTENT */}

{tab==="friends" && renderFriends()}
{tab==="search" && renderSearch()}
{tab==="requests" && renderRequests()}

</View>

);

}

/* ================= TAB BUTTON ================= */

function TabBtn({title,active,onPress}:any){

return(

<TouchableOpacity
onPress={onPress}
style={[
styles.tab,
active && {borderBottomColor:"#e50914"}
]}
>

<Text
style={[
styles.tabText,
active && {color:"#fff"}
]}
>
{title}
</Text>

</TouchableOpacity>

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

header:{
color:"#fff",
fontSize:28,
fontWeight:"bold",
marginBottom:20
},

tabs:{
flexDirection:"row",
justifyContent:"space-around",
marginBottom:20
},

tab:{
paddingBottom:8,
borderBottomWidth:2,
borderBottomColor:"transparent"
},

tabText:{
color:"#777",
fontSize:16
},

row:{
paddingVertical:14,
borderBottomWidth:1,
borderBottomColor:"#222"
},

name:{
color:"#fff"
},

input:{
backgroundColor:"#111",
color:"#fff",
padding:12,
borderRadius:10,
marginBottom:15
}

});