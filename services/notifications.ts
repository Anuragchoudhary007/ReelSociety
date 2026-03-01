import { collection, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const getFriendRequestsQuery = (uid: string) => {
  return query(
    collection(db, "friendRequests"),
    where("receiverId", "==", uid),
    where("status", "==", "pending")
  );
};