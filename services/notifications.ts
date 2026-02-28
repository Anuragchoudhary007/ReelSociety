import { collection, query } from "firebase/firestore";
import { db } from "./firebase";

export const getFriendRequestsQuery = (uid: string) => {
  return query(
    collection(db, "users", uid, "friendRequests")
  );
};