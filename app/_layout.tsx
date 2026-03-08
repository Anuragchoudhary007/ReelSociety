import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AuthProvider from "../context/AuthProvider";

import { useEffect, useRef, useState } from "react";
import {
View,
Text,
StyleSheet,
Animated
} from "react-native";

/* ================= SPLASH SCREEN ================= */

function SplashScreen() {

const fadeAnim = useRef(new Animated.Value(0)).current;
const scaleAnim = useRef(new Animated.Value(0.8)).current;

useEffect(()=>{

Animated.parallel([

Animated.timing(fadeAnim,{
toValue:1,
duration:900,
useNativeDriver:true
}),

Animated.spring(scaleAnim,{
toValue:1,
friction:6,
useNativeDriver:true
})

]).start();

},[]);

return(

<View style={styles.splashContainer}>

<Animated.Text
style={[
styles.logo,
{
opacity:fadeAnim,
transform:[{scale:scaleAnim}]
}
]}

>

ReelSociety
</Animated.Text>

<Text style={styles.loadingText}>
Loading...
</Text>

</View>

);

}

/* ================= ROOT LAYOUT ================= */

export default function RootLayout(){

const [ready,setReady] = useState(false);

useEffect(()=>{

/* Simulate loading */

const timer = setTimeout(()=>{

setReady(true);

},1500);

return ()=>clearTimeout(timer);

},[]);

if(!ready){

return <SplashScreen />;

}

return(

<GestureHandlerRootView style={{flex:1}}>

<AuthProvider>

<Slot />

</AuthProvider>

</GestureHandlerRootView>

);

}

/* ================= STYLES ================= */

const styles = StyleSheet.create({

splashContainer:{
flex:1,
backgroundColor:"#000",
justifyContent:"center",
alignItems:"center"
},

logo:{
fontSize:40,
fontWeight:"bold",
color:"#e50914"
},

loadingText:{
color:"#777",
marginTop:12
}

});
