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
increment,
getDoc
} from "firebase/firestore";

import { db, auth } from "./firebase";

/* =====================================================
CREATE GLOBAL ACTIVITY
===================================================== */

const createGlobalActivity = async (
type:string,
movie:any,
rating?:number
)=>{

const user = auth.currentUser;
if(!user) return;

/* GET USER DATA */

const userSnap = await getDoc(
doc(db,"users",user.uid)
);

const username = userSnap.exists()
? userSnap.data().username
: "User";

/* SAFE AVATAR */

const avatar = userSnap.exists()
? userSnap.data().avatar || `https://api.dicebear.com/7.x/bottts/png?seed=${username}`
: `https://api.dicebear.com/7.x/bottts/png?seed=${username}`;

/* SAFE POSTER */

const poster = movie?.poster_path
? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
: "";

/* ACTION LABEL */

let action = "activity";

if(type === "added_movie"){
action = "added";
}

if(type === "watched_movie"){
action = "watched";
}

if(type === "rated_movie"){
action = "rated";
}

/* SAVE GLOBAL ACTIVITY */

await addDoc(
collection(db,"activity"),
{

type,
action,

userId:user.uid,
username,
avatar,

movieId:movie?.id || null,
movieTitle:movie?.title || movie?.name || "",

poster,

rating:rating || null,

createdAt:Date.now()

});

};

/* =====================================================
CREATE LIST
===================================================== */

export const createList = async (
title:string,
description:string,
isPublic:boolean
)=>{

const user = auth.currentUser;
if(!user) return null;

const listRef = doc(
collection(db,"users",user.uid,"lists")
);

await setDoc(listRef,{

title:title || "Untitled List",
description:description || "",
isPublic,
createdAt:Date.now(),
updatedAt:Date.now()

});

return listRef.id;

};

/* =====================================================
GET USER LISTS
===================================================== */

export const getUserLists = async()=>{

const user = auth.currentUser;
if(!user) return [];

const listsRef = collection(
db,
"users",
user.uid,
"lists"
);

const snapshot = await getDocs(listsRef);

return snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

};

/* =====================================================
ADD ITEM TO LIST
===================================================== */

export const addItemToList = async(
listId:string,
item:any,
rank:number
)=>{

const user = auth.currentUser;
if(!user) return;

if(!item || !item.id) return;

const safeTitle = item.title || item.name || "Untitled";
const safePoster = item.poster_path || "";

/* SAVE MOVIE */

const itemRef = doc(
db,
"users",
user.uid,
"lists",
listId,
"items",
String(item.id)
);

await setDoc(itemRef,{

id:String(item.id),
title:safeTitle,
poster_path:safePoster,
media_type:item.media_type || "movie",
rank,
userRating:0,
watched:false,
addedAt:Date.now()

});

/* PROFILE ACTIVITY */

await addDoc(
collection(db,"users",user.uid,"activity"),
{
type:"added_movie",
movieId:String(item.id),
title:safeTitle,
poster_path:safePoster,
userId:user.uid,
createdAt:Date.now()
}
);

/* GLOBAL ACTIVITY */

await createGlobalActivity("added_movie",item);

};

/* =====================================================
GET LIST ITEMS
===================================================== */

export const getListItems = async(listId:string)=>{

const user = auth.currentUser;
if(!user) return [];

const itemsRef = collection(
db,
"users",
user.uid,
"lists",
listId,
"items"
);

const q = query(itemsRef,orderBy("rank"));

const snapshot = await getDocs(q);

return snapshot.docs.map(doc=>({

id:doc.id,
...doc.data()

}));

};

/* =====================================================
UPDATE RATING
===================================================== */

export const updateItemRating = async(
listId:string,
itemId:string | number,
rating:number,
movie:any
)=>{

const user = auth.currentUser;
if(!user) return;

const itemRef = doc(
db,
"users",
user.uid,
"lists",
listId,
"items",
String(itemId)
);

await updateDoc(itemRef,{
userRating:rating
});

/* GLOBAL ACTIVITY */

await createGlobalActivity(
"rated_movie",
movie,
rating
);

};

/* =====================================================
TOGGLE WATCHED STATUS
===================================================== */

export const toggleWatchedStatus = async(
listId:string,
itemId:string | number,
currentStatus:boolean,
movie:any
)=>{

const user = auth.currentUser;
if(!user) return;

const itemRef = doc(
db,
"users",
user.uid,
"lists",
listId,
"items",
String(itemId)
);

/* TOGGLE WATCHED */

await updateDoc(itemRef,{
watched:!currentStatus
});

/* UPDATE LEADERBOARD */

const leaderboardRef = doc(
db,
"leaderboard",
user.uid
);

await setDoc(
leaderboardRef,
{
uid:user.uid,
score:increment(currentStatus ? -1 : 1),
updatedAt:Date.now()
},
{ merge:true }
);

/* PROFILE ACTIVITY */

await addDoc(
collection(db,"users",user.uid,"activity"),
{
type:"watched_movie",
movieId:String(itemId),
userId:user.uid,
createdAt:Date.now()
}
);

/* GLOBAL ACTIVITY */

await createGlobalActivity(
"watched_movie",
movie
);

};

/* =====================================================
REMOVE ITEM FROM LIST
===================================================== */

export const removeItemFromList = async(
listId:string,
itemId:string | number
)=>{

const user = auth.currentUser;
if(!user) return;

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

/* =====================================================
DELETE LIST
===================================================== */

export const deleteList = async (listId:string)=>{

const user = auth.currentUser;
if(!user) return;

const listRef = doc(
db,
"users",
user.uid,
"lists",
listId
);

await deleteDoc(listRef);

};