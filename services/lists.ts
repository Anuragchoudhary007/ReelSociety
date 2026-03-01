import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  addDoc,
} from "firebase/firestore";

import { db, auth } from "./firebase";

/* ================= CREATE LIST ================= */

export const createList = async (
  title: string,
  description: string,
  isPublic: boolean
) => {
  const user = auth.currentUser;
  if (!user) return null;

  const listRef = doc(
    collection(db, "users", user.uid, "lists")
  );

  await setDoc(listRef, {
    title,
    description,
    isPublic,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });

  return listRef.id;
};

/* ================= GET ALL LISTS ================= */

export const getUserLists = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  const listsRef = collection(
    db,
    "users",
    user.uid,
    "lists"
  );

  const snapshot = await getDocs(listsRef);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ================= ADD ITEM + ACTIVITY ================= */

export const addItemToList = async (
  listId: string,
  item: any,
  rank: number
) => {
  const user = auth.currentUser;
  if (!user) return;

  // 🧠 Validate incoming item first
  if (!item || !item.id) {
    console.log("❌ Invalid item object:", item);
    return;
  }

  const safeTitle =
    item.title || item.name || "Untitled";

  const safePoster =
    item.poster_path || "";

  const itemRef = doc(
    db,
    "users",
    user.uid,
    "lists",
    listId,
    "items",
    String(item.id)
  );

  await setDoc(itemRef, {
    id: String(item.id),
    title: safeTitle,
    poster_path: safePoster,
    media_type: item.media_type || "movie",
    rank,
    userRating: 0,
    watched: false,
    addedAt: Date.now(),
  });

  // 🔥 Activity Feed Entry (also safe)
  await addDoc(
    collection(db, "users", user.uid, "activity"),
    {
      type: "added_movie",
      listId,
      movieId: String(item.id),
      title: safeTitle,
      poster_path: safePoster,
      createdAt: Date.now(),
    }
  );
};
/* ================= GET ITEMS ================= */

export const getListItems = async (listId: string) => {
  const user = auth.currentUser;
  if (!user) return [];

  const itemsRef = collection(
    db,
    "users",
    user.uid,
    "lists",
    listId,
    "items"
  );

  const q = query(itemsRef, orderBy("rank"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

/* ================= UPDATE RANK ================= */

export const updateItemRank = async (
  listId: string,
  itemId: string | number,
  newRank: number
) => {
  const user = auth.currentUser;
  if (!user) return;

  const itemRef = doc(
    db,
    "users",
    user.uid,
    "lists",
    listId,
    "items",
    String(itemId)
  );

  await updateDoc(itemRef, {
    rank: newRank,
  });
};

/* ================= UPDATE RATING ================= */

export const updateItemRating = async (
  listId: string,
  itemId: string | number,
  rating: number
) => {
  const user = auth.currentUser;
  if (!user) return;

  const itemRef = doc(
    db,
    "users",
    user.uid,
    "lists",
    listId,
    "items",
    String(itemId)
  );

  await updateDoc(itemRef, {
    userRating: rating,
  });
};

/* ================= TOGGLE WATCHED ================= */

export const toggleWatchedStatus = async (
  listId: string,
  itemId: string | number,
  currentStatus: boolean
) => {
  const user = auth.currentUser;
  if (!user) return;

  const itemRef = doc(
    db,
    "users",
    user.uid,
    "lists",
    listId,
    "items",
    String(itemId)
  );

  await updateDoc(itemRef, {
    watched: !currentStatus,
  });
};

/* ================= REMOVE ITEM ================= */

export const removeItemFromList = async (
  listId: string,
  itemId: string | number
) => {
  const user = auth.currentUser;
  if (!user) return;

  const itemRef = doc(
    db,
    "users",
    user.uid,
    "lists",
    listId,
    "items",
    String(itemId)
  );

  await deleteDoc(itemRef);
};