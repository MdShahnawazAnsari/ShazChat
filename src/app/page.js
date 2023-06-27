"use client";

import { useAuth } from "../context/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "../components/Loader";
import LeftNav from "../components/LeftNav";
import Chats from "../components/Chats"
export default function Home() {
  const router = useRouter();
  const { isLoading, currentUser } = useAuth();

  // when logedout push user into login page
  useEffect(() => {
    if (!isLoading && !currentUser) router.push("/login");
  }, [isLoading, currentUser]);

  return !currentUser ? (
    <Loader />
  ) : (
    <main>
      <div className="bg-c1 flex h-[100vh]">
        <div className="flex w-full shrink-0">
          {/* left menu start */}
          <LeftNav />
          {/* left menu end */}

          {/* main div starts */}
          <div className="flex bg-c2 grow">
            {/* contact starts */}
            <div className="scrollbar w-[400px] p-5 overflow-auto shrink-0 border-r border-white/[0.5]">
              <div className="flex flex-col h-full">
                <Chats />
              </div>
            </div>
            <div>SideBar</div>
            {/* contact end */}

            {/* chat starts */}
            <div>chat</div>
            {/* chat end */}
          </div>
          {/* main div end */}
        </div>
      </div>
    </main>
  );
}
