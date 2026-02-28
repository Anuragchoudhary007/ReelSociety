// import { useEffect, useState } from "react";
// import { useRouter } from "expo-router";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../services/firebase";
// import { View, ActivityIndicator } from "react-native";

// export default function Index() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         router.replace("/(tabs)/home");
//       } else {
//         router.replace("/(auth)/login");
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   if (loading) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: "center",
//           alignItems: "center",
//           backgroundColor: "#000",
//         }}
//       >
//         <ActivityIndicator size="large" color="#e50914" />
//       </View>
//     );
//   }

//   return null;
// }
  
import { useContext, useEffect } from "react";
import { useRouter } from "expo-router";
import { AuthContext } from "../context/AuthProvider";

export default function Index() {
  const router = useRouter();
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/(tabs)/home");
    } else {
      router.replace("/(auth)/login");
    }
  }, [user, loading]);

  return null;
}