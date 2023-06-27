"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// icons
import { IoLogoGoogle, IoLogoFacebook } from "react-icons/io";


// for login authentication
import { auth } from "../../firebase/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { useAuth } from "../../context/authContext";
const googleProvider = new GoogleAuthProvider();

// alert
// import Toastify from "../components/Toastify";
import Toastify from "../../components/Toastify"
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

// type for login form

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    password: "",
  });
  // context api
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();

  // ON Change
  const handleChange = (e) => {
    setInput((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // login with email and password
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, input.email, input.password);
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

  //reset password
  const resetPassword = async () => {
    try {
      toast.promise(
        async () => {
          await sendPasswordResetEmail(auth, input.email);
        },
        {
          pending: "Generating reset Link",
          success: "Reset email send to your registered email id.",
          error: "You may have entered wrong email id!",
        },
        {
          autoClose: 5000,
        }
      );
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
      <Toastify />
      <div className="flex items-center flex-col">
        <div className="text-center">
          <div className="text-2xl md:text-4xl font-bold">
            Log in To Your Account
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
                <span className="text-sm md:text-lg">Login With Google</span>
              </div>
            </div>

            <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 w-1/2 h-14 rounded-md cursor-pointer p-[1px]">
              <div className="flex items-center gap-3 justify-center text-white font-semibold bg-c1 w-full h-full rounded-md">
                <IoLogoFacebook size={24} />
                <span className="text-sm md:text-lg">Login With Facebook</span>
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

          {/* form starts */}
          <form
            className="flex flex-col items-center gap-3 mt-5 md:w-[500px]"
            onSubmit={(e) => handleSubmit(e)}
          >
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
            {/* forget passowrd starts */}
            <div className="text-right w-full text-c3">
              <span className="cursor-pointer" onClick={resetPassword}>
                Forget Password
              </span>
            </div>
            {/* forget passowrd end */}
            <button className="mt4 w-full h-14 rounded-xl outline-none text-base font-semibold bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500">
              Login to Your Account
            </button>
            <div className="flex gap-1 justify-center text-c3 mt-5">
              <span>Not a member yet?</span>
              <Link
                href="/register"
                className="font-semibold underline underline-offset-2 text-white"
              >
                Register Now
              </Link>
            </div>
          </form>
          {/* form end */}
        </div>
      </div>
    </div>
  );
};

export default Login;
