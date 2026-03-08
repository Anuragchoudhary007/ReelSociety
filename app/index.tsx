import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthProvider";

import {
View,
Text,
StyleSheet,
Animated,
ActivityIndicator
} from "react-native";

export default function Index(){

const router = useRouter();
const { user, loading } = useAuth();

/* ================= ANIMATIONS ================= */

const fadeAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(0.85)).current;
const subtitleAnim = useRef(new Animated.Value(0)).current;

/* ================= START SPLASH ================= */

useEffect(()=>{

Animated.sequence([

Animated.parallel([

Animated.timing(fadeAnim,{
toValue:1,
duration:900,
useNativeDriver:true
}),

Animated.spring(scaleAnim,{
toValue:1,
friction:5,
useNativeDriver:true
})

]),

Animated.timing(subtitleAnim,{
toValue:1,
duration:600,
useNativeDriver:true
})

]).start();

},[]);

/* ================= ROUTE ================= */

useEffect(()=>{

if(loading) return;

const timeout = setTimeout(()=>{

if(user){

router.replace("/(tabs)/home");

}else{

router.replace("/(auth)/login");

}

},1800);

return ()=>clearTimeout(timeout);

},[user,loading]);

/* ================= UI ================= */

return(

<View style={styles.container}>

<Animated.View
style={{
opacity:fadeAnim,
transform:[{scale:scaleAnim}]
}}
>

<Text style={styles.logo}>
ReelSociety
</Text>

</Animated.View>

<Animated.Text
style={[
styles.subtitle,
{opacity:subtitleAnim}
]}
>

Track • Rate • Discover

</Animated.Text>

<ActivityIndicator
size="small"
color="#e50914"
style={{marginTop:20}}
/>

</View>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

logo:{
fontSize:44,
color:"#e50914",
fontWeight:"bold",
letterSpacing:2
},

subtitle:{
color:"#aaa",
marginTop:10,
fontSize:14,
letterSpacing:1
}

});