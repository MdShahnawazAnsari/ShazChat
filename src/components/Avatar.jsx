import Image from "next/image";
import React from "react";

const Avatar = ({ size, user, onClick }) => {
  const imageWidthAndHeight =
    size === "small"
      ? 32
      : size === "medium"
      ? 36
      : size === "x-large"
      ? 56
      : size === "xx-large"
      ? 96
      : 40;

  const widthAndHeight =
    size === "small"
      ? "w-8 h-8"
      : size === "medium"
      ? "w-9 h-9"
      : size === "large"
      ? "w-10 h-10"
      : size === "x-large"
      ? "w-14 h-14"
      : "w-24 h-24";

  const fontSize =
    size === "x-large"
      ? "text-2xl"
      : size === "xx-large"
      ? "text-4xl"
      : "text-base";
  return (
    <div
      className={`${widthAndHeight} rounded-full flex items-center justify-center text-base shrink-0 relative`}
      style={{ backgroundColor: user?.color }}
      onClick={onClick}
    >
      {user?.isOnline && (size === "large" || size === "x-large") && (
        <span className="w-3 h-3 bg-green-500 rounded-full absolute bottom-[2px] right-[2px]"></span>
      )}
      {user?.photoURL ? (
        <div className={`${widthAndHeight} overflow-hidden rounded-full`}>
          <Image
            src={user?.photoURL}
            alt="Avatar"
            width={imageWidthAndHeight}
            height={imageWidthAndHeight}
          />
        </div>
      ) : (
        <div className={`${fontSize} uppercase font-semibold`}>
          {user?.displayName.charAt(0)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
