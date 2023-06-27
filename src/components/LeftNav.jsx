import { useState, KeyboardEvent, ChangeEvent } from "react";
import { useAuth } from "../context/authContext";
import Avatar from "./Avatar";
import Icon from "./Icon";
import UsersPopup from "./popup/UsersPopup";

// alert
import Toastify from "./Toastify";
import { toast } from "react-toastify";

import { MdAddAPhoto, MdDeleteForever, MdPhotoCamera } from "react-icons/md";
import { BiCheck, BiEdit } from "react-icons/bi";
import { FiPlus } from "react-icons/fi";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { IoClose, IoLogOutOutline } from "react-icons/io5";
import { profileColors } from "../utils/constents";
//firebase imports
import { doc, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase/firebase";
import { updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const LeftNav = () => {
  const { currentUser, userSignOut, setCurrentUser } = useAuth();
  const [openUserPopup, setOpenUserPopup] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [dName, setDName] = useState(currentUser?.displayName);
  const [nameEdited, setNameEdited] = useState(false);

  const authUser = auth.currentUser;

  const uploadImageToFireStore = (event) => {
    const file = event.target.files?.[0];
    try {
      if (file) {
        const storageRef = ref(storage, dName);

        const uploadTask = uploadBytesResumable(storageRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            console.error(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then(
              async (downloadURL) => {
                handleUpdateProfile("photo", downloadURL);
              }
            );
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = (
    type,
    value
  ) => {
    let obj = { ...currentUser };
    switch (type) {
      case "color":
        obj.color = value;
        break;
      case "name":
        obj.displayName = value;
        break;
      case "photo":
        obj.photoURL = value;
        break;
      case "photo-remove":
        obj.photoURL = null;
        break;
      default:
        break;
    }

    try {
      toast.promise(
        async () => {
          let userDocRef = await doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, obj);
          setCurrentUser(obj);

          if (type === "photo-remove") {
            await updateProfile(authUser, {
              photoURL: null,
            });
          }
          if (type === "name") {
            await updateProfile(authUser, {
              displayName: value,
            });
          }
          if (type === "photo") {
            await updateProfile(authUser, {
              photoURL: value,
            });
          }
          setNameEdited(false);
        },
        {
          pending: "Updating Profile",
          success: "Profile udated successfully",
          error: "Profile Update failed",
        },
        {
          autoClose: 3000,
        }
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onKeyUp = (event) => {
    dName === currentUser.displayName
      ? setNameEdited(false)
      : setNameEdited(true);
  };

  const onKeyDown = (event) => {
    if (event.key === "Enter") event.preventDefault();
  };

  const editProfileContainer = () => {
    return (
      <div className="relative flex flex-col items-center">
        <Toastify />
        <Icon
          size="small"
          className="absolute top-0 right-5 hover:bg-c2"
          icon={<IoClose size={20} />}
          onClick={() => setEditProfile(false)}
        />
        <div className="relative group cursor-pointer">
          <Avatar size="xx-large" user={currentUser} />
          <div className="w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex">
            <label htmlFor="fileUpload">
              {currentUser?.photoURL ? (
                <MdPhotoCamera size={34} />
              ) : (
                <MdAddAPhoto size={34} />
              )}
              <input
                id="fileUpload"
                type="file"
                style={{ display: "none" }}
                onChange={uploadImageToFireStore}
              />
            </label>
          </div>
          {currentUser?.photoURL && (
            <div
              className="w-5 h-6 rounded-full bg-red-500 flex justify-center items-center absolute right-0 bottom-0"
              onClick={() => handleUpdateProfile("photo-remove", null)}
            >
              <MdDeleteForever size={14} />
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col items-center">
          <div className="flex items-center gap-2">
            {nameEdited ? (
              <BsFillCheckCircleFill
                className="text-c4 cursor-pointer"
                onClick={() => handleUpdateProfile("name", dName)}
              />
            ) : (
              <BiEdit className="text-c3" />
            )}
            <form id="displayNameEdit">
              <input
                type="text"
                className="outline-none bg-transparent text-c3 text-center inline-block border-none"
                value={dName}
                onChange={(e) => setDName(e.target.value)}
                onKeyUp={onKeyUp}
                onKeyDown={onKeyDown}
              />
            </form>
          </div>
          <span className="text-c3 text-sm">{currentUser?.email}</span>
        </div>

        <div className="grid grid-cols-5 gap-4 mt-5">
          {profileColors.map((color, index) => (
            <span
              key={index}
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
              onClick={() => handleUpdateProfile("color", color)}
            >
              {color === currentUser.color && <BiCheck size={24} />}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        editProfile ? "w-[350px]" : "w-[80px] items-center"
      } flex flex-col justify-between py-5 shrink-0 transition-all`}
    >
      {editProfile ? (
        editProfileContainer()
      ) : (
        <div
          className="relative group cursor-pointer"
          onClick={() => setEditProfile(true)}
        >
          <Avatar size="large" user={currentUser} />
          <div className="w-full h-full rounded-full bg-black/[0.5] absolute top-0 left-0 justify-center items-center hidden group-hover:flex">
            <BiEdit size={14} />
          </div>
        </div>
      )}

      <div
        className={`flex gap-5 ${
          editProfile ? "ml-5" : "flex-col items-center"
        }`}
      >
        <Icon
          size="x-large"
          icon={<FiPlus size={24} />}
          className="bg-green-500 hover:bg-gray-600"
          onClick={() => setOpenUserPopup(!openUserPopup)}
        />
        <Icon
          size="x-large"
          icon={<IoLogOutOutline size={24} />}
          className="bg-green-500 hover:bg-c2"
          onClick={userSignOut}
        />
      </div>
      {openUserPopup && <UsersPopup title="Find Users" hide={()=>setOpenUserPopup(false)} />}
    </div>
  );
};

export default LeftNav;
