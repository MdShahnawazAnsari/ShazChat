"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clear = async () => {
    try {
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          isOnline: false,
        });
      }

      setCurrentUser(null);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  // for sign out
  const userSignOut = async () => {
    await signOut(auth);
    clear();
  };

  // for login
  const authStateChanged = async (user) => {
    setIsLoading(true);
    if (!user) {
      clear();
      return;
    }

    const userDocExist = await getDoc(doc(db, "users", user.uid));

    if (userDocExist.exists()) {
      await updateDoc(doc(db, "users", user.uid), {
        isOnline: true,
      });
    }

    const userData = await getDoc(doc(db, "users", user.uid));
    setCurrentUser(userData.data());
    setIsLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, authStateChanged);

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        setIsLoading,
        userSignOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useAuth = () => useContext(UserContext);
