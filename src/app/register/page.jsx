"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// icons
import { IoLogoGoogle, IoLogoFacebook } from "react-icons/io";

// for login authentication
import { auth, db } from "../../firebase/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useAuth } from "../../context/authContext";
const googleProvider = new GoogleAuthProvider();

// for creacting collections in db
import { doc, setDoc } from "firebase/firestore";

import { profileColors } from "../../utils/constents";
import Loader from "../../components/Loader";

const Register = () => {
  const router = useRouter();
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  // context api
  const { currentUser, isLoading } = useAuth();

  // On Change
  const handleChange = (e) => {
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // On Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    let index = Math.floor(Math.random() * profileColors.length);
    try {
      let { user } = await createUserWithEmailAndPassword(
        auth,
        input.email,
        input.password
      );
      // adding user into users collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: input.name,
        email: user.email,
        color: profileColors[index],
      });
      // adding user into Chats collection
      await setDoc(doc(db, "userChats", user.uid), {});

      // updating user display name
      await updateProfile(user, {
        displayName: input.name,
      });
      console.log(user);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  // login with google provider
  const logInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
    }
  };

  // check if the user is loged in or when loged in send user to landingPage
  useEffect(() => {
    if (!isLoading && currentUser) router.push("/");
  }, [currentUser, isLoading]);
  return isLoading || (!isLoading && currentUser) ? (
    <Loader />
  ) : (
    <div className="h-[100vh] flex justify-center items-center bg-c1">
      <div className="flex items-center flex-col">
        <div className="text-center">
          <div className="text-2xl md:text-4xl font-bold">
            Create New Account
          </div>
          <div className="mt-3 text-c3">
            Connect and Chat with anyone, anywhere
          </div>
          {/* Button Starts */}
          <div className="flex items-center gap-2 w-full mt-10 mb-5">
            <div
              className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]"
              onClick={logInWithGoogle}
            >
              <div className="flex items-center justify-center gap-3 text-white font-semibold bg-c1 w-full h-full rounded-md">
                <IoLogoGoogle size={24} />
                <span className="text-sm md:text-lg">SignUp With Google</span>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
              <div className="flex items-center gap-3 justify-center text-white font-semibold bg-c1 w-full h-full rounded-md">
                <IoLogoFacebook size={24} />
                <span className="text-sm md:text-lg">SignUp With Facebook</span>
              </div>
            </div>
          </div>
          {/* Button Ends */}
          {/* -OR- starts */}
          <div className="flex justify-center items-center gap-1">
            <span className="w-5 h-[1px] bg-c3"></span>
            <span className="text-c3 font-semibold">OR</span>
            <span className="w-5 h-[1px] bg-c3"></span>
          </div>
          {/* -OR- ends */}

          <form
            className="flex flex-col items-center gap-3 mt-5 md:w-[500px]"
            onSubmit={(e) => handleSubmit(e)}
          >
            <input
              type="text"
              placeholder="Display Name"
              className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
              autoCorrect="off"
              name="name"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
              autoCorrect="off"
              name="email"
              onChange={(e) => handleChange(e)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full h-14 bg-c5 rounded-xl outline-none border-none px-5 text-c3"
              autoCorrect="off"
              name="password"
              onChange={(e) => handleChange(e)}
            />
            <button className="mt4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
              Sing Up
            </button>
            <div className="flex gap-1 justify-center text-c3 mt-5">
              <span>Already have an account?</span>
              <Link
                href="/login"
                className="font-semibold underline underline-offset-2 text-white"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
