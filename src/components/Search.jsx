import React, { useState } from "react";
import { RiSearch2Line } from "react-icons/ri";
import Avatar from "./Avatar";

import { useAuth } from "../context/authContext";
import { useChatContext } from "../context/chatContext";

// firebase imports
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const Search = () => {
  const [userName, setUserName] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const { currentUser } = useAuth();
  const { dispatch } = useChatContext();

  const onKeyUP = async (e) => {
    if (e.code === "Enter" && !!userName) {
      try {
        setErr(false);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("displayName", "==", userName));

        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setErr(true);
          setUser(null);
        } else {
          querySnapshot.forEach((doc) => {
            setUser(doc.data());
          });
        }
      } catch (error) {
        console.error(error);
        setErr(error);
      }
    }
  };

  const handleSelect = async () => {
    try {
      const combinedId =
        currentUser.uid > user.uid
          ? currentUser.uid + user.uid
          : user.uid + currentUser.uid;

      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        // chat document dosen't exits
        await setDoc(doc(db, "chats", combinedId), {
          messages: [],
        });

        // by any error the userChats does not have both current user and selected user creating them in userChats collection
        // from here to
        const currentUserChatRef = await getDoc(
          doc(db, "userChats", currentUser.uid)
        );

        if (!currentUserChatRef.exists()) {
          await setDoc(doc(db, "userChats", currentUser.uid), {});
        }

        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL || null,
            color: user.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        const selectedUserChatRef = await getDoc(
          doc(db, "userChats", user.uid)
        );

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL || null,
            color: currentUser.color,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        if (!selectedUserChatRef.exists()) {
          await setDoc(doc(db, "userChats", user.uid), {});
        }
        // to here
      } else {
        // chat document exits
      }

      setUser(null);
      setUserName("");
      dispatch({ type: "CHANGE_USER", payload: user });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="shrink-0">
      <div className="relative">
        <RiSearch2Line className="absolute top-4 left-4 text-c3" />
        <input
          type="text"
          placeholder="Search user.."
          onChange={(e) => {
            setUserName(e.target.value);
          }}
          onKeyUp={onKeyUP}
          value={userName}
          autoFocus
          className="w-full h-12 rounded-xl bg-c1/50 pl-11 pr-16 placeholder:text-c3 outline-none text-base"
        />
        <span className="absolute top-[14px] right-4 text-sm text-c3">
          Enter
        </span>
      </div>

      {err && (
        <>
          <div className="mt-5 w-full text-center text-sm">User not found!</div>
          <div className="w-full h-[1px] bg-white/10 mt-5" />
        </>
      )}

      {user && (
        <>
          <div
            className="mt-5 flex items-center gap-4 rounded-xl hover:bg-c5 py-2 px-4 cursor-pointer"
            key={user.uid}
            onClick={handleSelect}
          >
            <Avatar size="large" user={user} />
            <div className="flex flex-col gap-1 grow">
              <span className="text-base text-white flex items-center justify-between">
                <div className="font-medium">{user.displayName}</div>
              </span>
              <p className="text-sm text-c3">{user.email}</p>
            </div>
          </div>
          <div className="w-full h-[1px] bg-white/10 mt-5" />
        </>
      )}
    </div>
  );
};

export default Search;
