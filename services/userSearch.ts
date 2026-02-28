import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const searchUsers = async (text: string) => {
  const q = query(
    collection(db, "users"),
    where("usernameLowercase", ">=", text.toLowerCase()),
    where("usernameLowercase", "<=", text.toLowerCase() + "\uf8ff")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    uid: doc.id,
    ...doc.data(),
  }));
};