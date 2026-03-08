import { useEffect, useState, useRef } from "react";
import {
View,
Text,
StyleSheet,
TouchableOpacity,
FlatList,
Dimensions,
Modal,
TextInput,
Switch,
Animated,
Alert
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { createList, getUserLists, deleteList } from "../../services/lists";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function ListsScreen() {

const router = useRouter();

const [lists,setLists] = useState<any[]>([]);
const [modalVisible,setModalVisible] = useState(false);
const [title,setTitle] = useState("");
const [desc,setDesc] = useState("");
const [isPublic,setIsPublic] = useState(true);

const scale = useRef(new Animated.Value(1)).current;

/* ================= ANIMATION ================= */

const pressIn = ()=>{
Animated.spring(scale,{
toValue:0.97,
useNativeDriver:true
}).start();
};

const pressOut = ()=>{
Animated.spring(scale,{
toValue:1,
useNativeDriver:true
}).start();
};

/* ================= LOAD LISTS ================= */

const loadLists = async ()=>{
const data = await getUserLists();
setLists(data);
};

useEffect(()=>{
loadLists();
},[]);

/* ================= CREATE LIST ================= */

const handleCreate = async ()=>{

if(!title.trim()) return;

await createList(title,desc,isPublic);

setModalVisible(false);
setTitle("");
setDesc("");

loadLists();

};

/* ================= DELETE LIST ================= */

const handleDelete = (id:string)=>{

Alert.alert(
"Delete List",
"This list will be permanently deleted.",
[
{ text:"Cancel",style:"cancel" },
{
text:"Delete",
style:"destructive",
onPress: async ()=>{
await deleteList(id);
loadLists();
}
}
]
);

};

/* ================= UI ================= */

return(

<View style={styles.container}>

<Text style={styles.header}>
My Lists
</Text>

{lists.length === 0 && (

<View style={styles.emptyContainer}>

<Text style={styles.emptyEmoji}>
📚
</Text>

<Text style={styles.emptyTitle}>
No Lists Yet
</Text>

<Text style={styles.emptySubtitle}>
Create your first movie collection
</Text>

</View>

)}

<FlatList
data={lists}
keyExtractor={(item)=>item.id}

renderItem={({item})=>{

return(

<Animated.View
style={{transform:[{scale}],marginBottom:18}}
>

<TouchableOpacity
activeOpacity={0.9}
onPress={()=>router.push(`/list/${item.id}`)}
onPressIn={pressIn}
onPressOut={pressOut}
>

<LinearGradient
colors={["#1a1a1a","#0d0d0d"]}
style={styles.card}
>

<View style={{flex:1}}>

<Text style={styles.listTitle}>
{item.title}
</Text>

{item.description ? (
<Text style={styles.desc}>
{item.description}
</Text>
) : null}

<Text style={styles.meta}>
{item.isPublic ? "🌍 Public" : "🔒 Private"}
</Text>

</View>

<TouchableOpacity
style={styles.deleteBtn}
onPress={()=>handleDelete(item.id)}
>

<Text style={styles.deleteText}>
Delete
</Text>

</TouchableOpacity>

</LinearGradient>

</TouchableOpacity>

</Animated.View>

);

}}

contentContainerStyle={{paddingBottom:120}}
/>

{/* CREATE BUTTON */}

<TouchableOpacity
style={styles.fab}
onPress={()=>setModalVisible(true)}
>

<Text style={styles.fabText}>
+
</Text>

</TouchableOpacity>

{/* CREATE LIST MODAL */}

<Modal
visible={modalVisible}
animationType="slide"
transparent
>

<View style={styles.modalContainer}>

<View style={styles.modalBox}>

<Text style={styles.modalTitle}>
Create New List
</Text>

<TextInput
placeholder="List Name"
placeholderTextColor="#888"
style={styles.input}
value={title}
onChangeText={setTitle}
/>

<TextInput
placeholder="Description"
placeholderTextColor="#888"
style={styles.input}
value={desc}
onChangeText={setDesc}
/>

<View style={styles.switchRow}>

<Text style={{color:"#fff"}}>
Public
</Text>

<Switch
value={isPublic}
onValueChange={setIsPublic}
/>

</View>

<TouchableOpacity
style={styles.createBtn}
onPress={handleCreate}
>

<Text style={{color:"#fff",fontWeight:"bold"}}>
Create List
</Text>

</TouchableOpacity>

</View>

</View>

</Modal>

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

header:{
color:"#fff",
fontSize:28,
fontWeight:"bold",
marginBottom:20
},

card:{
padding:22,
borderRadius:20,
flexDirection:"row",
alignItems:"center"
},

listTitle:{
color:"#fff",
fontSize:22,
fontWeight:"bold"
},

desc:{
color:"#aaa",
marginTop:6
},

meta:{
color:"#e50914",
marginTop:10
},

deleteBtn:{
backgroundColor:"#e50914",
paddingHorizontal:14,
paddingVertical:8,
borderRadius:8
},

deleteText:{
color:"#fff",
fontWeight:"bold"
},

fab:{
position:"absolute",
right:25,
bottom:40,
backgroundColor:"#e50914",
width:65,
height:65,
borderRadius:32,
alignItems:"center",
justifyContent:"center",
elevation:5
},

fabText:{
color:"#fff",
fontSize:30,
marginTop:-2
},

modalContainer:{
flex:1,
justifyContent:"center",
backgroundColor:"rgba(0,0,0,0.85)"
},

modalBox:{
backgroundColor:"#111",
margin:20,
padding:22,
borderRadius:20
},

modalTitle:{
color:"#fff",
fontSize:20,
marginBottom:16,
fontWeight:"bold"
},

input:{
backgroundColor:"#222",
padding:12,
borderRadius:12,
color:"#fff",
marginBottom:12
},

switchRow:{
flexDirection:"row",
justifyContent:"space-between",
marginBottom:16
},

createBtn:{
backgroundColor:"#e50914",
padding:14,
borderRadius:12,
alignItems:"center"
},

emptyContainer:{
flex:1,
justifyContent:"center",
alignItems:"center",
marginTop:80
},

emptyEmoji:{
fontSize:48,
marginBottom:10
},

emptyTitle:{
color:"#fff",
fontSize:22,
fontWeight:"bold"
},

emptySubtitle:{
color:"#888",
marginTop:6
}

});