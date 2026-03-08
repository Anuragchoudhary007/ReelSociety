import {
collection,
addDoc,
serverTimestamp,
query,
where,
getDocs,
doc,
getDoc,
deleteDoc,
onSnapshot,
writeBatch
} from "firebase/firestore";

import { db, auth } from "./firebase";

/* =======================================================
   SEND FRIEND REQUEST
======================================================= */

export const sendFriendRequest = async (receiverId:string)=>{

const currentUser = auth.currentUser;
if(!currentUser) return;

if(currentUser.uid === receiverId) return;

/* CHECK FRIEND ALREADY */

const friendCheck = query(
collection(db,"friends"),
where("userId","==",currentUser.uid),
where("friendId","==",receiverId)
);

if(!(await getDocs(friendCheck)).empty) return;

/* CHECK PENDING REQUEST */

const requestCheck = query(
collection(db,"friendRequests"),
where("senderId","==",currentUser.uid),
where("receiverId","==",receiverId),
where("status","==","pending")
);

if(!(await getDocs(requestCheck)).empty) return;

/* CREATE REQUEST */

await addDoc(collection(db,"friendRequests"),{

senderId:currentUser.uid,
receiverId,
createdAt:serverTimestamp(),
status:"pending"

});

};

/* =======================================================
   CANCEL FRIEND REQUEST
======================================================= */

export const cancelFriendRequest = async(receiverId:string)=>{

const currentUser = auth.currentUser;
if(!currentUser) return;

const q = query(
collection(db,"friendRequests"),
where("senderId","==",currentUser.uid),
where("receiverId","==",receiverId),
where("status","==","pending")
);

const snapshot = await getDocs(q);

snapshot.forEach(async(docSnap)=>{
await deleteDoc(docSnap.ref);
});

};

/* =======================================================
   LISTEN TO INCOMING REQUESTS
======================================================= */

export const listenToIncomingRequests = (callback:any)=>{

const currentUser = auth.currentUser;
if(!currentUser) return ()=>{};

const q = query(
collection(db,"friendRequests"),
where("receiverId","==",currentUser.uid),
where("status","==","pending")
);

return onSnapshot(q,async(snapshot)=>{

const requests:any[] = [];

for(const docSnap of snapshot.docs){

const data = docSnap.data();

const userSnap = await getDoc(
doc(db,"users",data.senderId)
);

requests.push({

id:docSnap.id,
senderId:data.senderId,
receiverId:data.receiverId,

senderUsername:userSnap.exists()
? userSnap.data().username
: "Unknown User"

});

}

callback(requests);

});

};

/* =======================================================
   ACCEPT FRIEND REQUEST
======================================================= */

export const acceptRequest = async(request:any)=>{

const batch = writeBatch(db);

/* ADD BOTH USERS */

batch.set(doc(collection(db,"friends")),{

userId:request.senderId,
friendId:request.receiverId

});

batch.set(doc(collection(db,"friends")),{

userId:request.receiverId,
friendId:request.senderId

});

/* REMOVE REQUEST */

batch.delete(
doc(db,"friendRequests",request.id)
);

await batch.commit();

/* ================= ACTIVITY ================= */

const currentUser = auth.currentUser;

if(currentUser){

const userSnap = await getDoc(
doc(db,"users",currentUser.uid)
);

const username = userSnap.exists()
? userSnap.data().username
: "User";

const avatar = userSnap.exists()
? userSnap.data().avatar || ""
: "";

await addDoc(collection(db,"activity"),{

type:"new_friend",
userId:currentUser.uid,
username,
avatar,
createdAt:Date.now()

});

}

};

/* =======================================================
   REMOVE FRIEND
======================================================= */

export const removeFriend = async(friendUid:string)=>{

const currentUser = auth.currentUser;
if(!currentUser) return;

const q1 = query(
collection(db,"friends"),
where("userId","==",currentUser.uid),
where("friendId","==",friendUid)
);

const q2 = query(
collection(db,"friends"),
where("userId","==",friendUid),
where("friendId","==",currentUser.uid)
);

const snap1 = await getDocs(q1);
const snap2 = await getDocs(q2);

snap1.forEach(async(docSnap)=>{
await deleteDoc(docSnap.ref);
});

snap2.forEach(async(docSnap)=>{
await deleteDoc(docSnap.ref);
});

};

/* =======================================================
   LISTEN TO FRIEND COUNT
======================================================= */

export const listenToFriendCount = (callback:any)=>{

const user = auth.currentUser;
if(!user) return ()=>{};

const q = query(
collection(db,"friends"),
where("userId","==",user.uid)
);

return onSnapshot(q,(snapshot)=>{

callback(snapshot.size);

});

};

/* =======================================================
   GET FRIENDS LIST
======================================================= */

export const getFriends = async()=>{

const user = auth.currentUser;
if(!user) return [];

const q = query(
collection(db,"friends"),
where("userId","==",user.uid)
);

const snap = await getDocs(q);

const friends:any[] = [];

for(const docSnap of snap.docs){

const data = docSnap.data();

const userSnap = await getDoc(
doc(db,"users",data.friendId)
);

friends.push({

uid:data.friendId,
username:userSnap.exists()
? userSnap.data().username
: "Unknown User"

});

}

return friends;

};

/* =======================================================
   REALTIME FRIEND LIST
======================================================= */

export const listenToFriends = (callback:any)=>{

const user = auth.currentUser;
if(!user) return ()=>{};

const q = query(
collection(db,"friends"),
where("userId","==",user.uid)
);

return onSnapshot(q,async(snapshot)=>{

const friends:any[] = [];

for(const docSnap of snapshot.docs){

const data = docSnap.data();

const userSnap = await getDoc(
doc(db,"users",data.friendId)
);

friends.push({

uid:data.friendId,
username:userSnap.exists()
? userSnap.data().username
: "Unknown User"

});

}

callback(friends);

});

};

/* =======================================================
   MUTUAL FRIENDS
======================================================= */

export const getMutualFriends = async(otherUid:string)=>{

const user = auth.currentUser;
if(!user) return [];

const myFriendsSnap = await getDocs(
query(collection(db,"friends"),where("userId","==",user.uid))
);

const otherFriendsSnap = await getDocs(
query(collection(db,"friends"),where("userId","==",otherUid))
);

const myFriends = myFriendsSnap.docs.map(
d=>d.data().friendId
);

const otherFriends = otherFriendsSnap.docs.map(
d=>d.data().friendId
);

return myFriends.filter(
id=>otherFriends.includes(id)
);

};