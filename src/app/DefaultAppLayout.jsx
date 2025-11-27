"use client";

import { useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "../components/sidebar";
import { MdDashboard } from "react-icons/md";
import { HiChatBubbleLeftRight, HiChartBar } from "react-icons/hi2";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase.js";
import { database } from "../lib/firebase.jsx";
import { ref, get, child } from "firebase/database";

const DefaultAppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", profilePhoto: "" });
  const [userId, setUserId] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/signin");
    }
  };

  useEffect(() => {
    if (!open) setIsProfileMenuOpen(false);
  }, [open]);

  useEffect(() => {
    const setUserCookie = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data.session) {
        const uid = data.session.user.id;
        setUserId(uid);
        document.cookie = `user_id=${uid}; path=/; max-age=604800; secure; samesite=strict`;
      }
    };
    setUserCookie();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const snapshot = await get(
          child(ref(database), `users/${userId}/personalInformation`)
        );
        if (snapshot.exists()) {
          setProfile(snapshot.val());
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setProfileLoaded(true); // mark that we have loaded/verified profile
      }
    };

    fetchProfile();
  }, [userId]);

  // ❗ Render loader until profile is fetched
  if (!profileLoaded) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-neutral-800">
        <div className="animate-pulse w-48 h-10 bg-gray-300 dark:bg-neutral-700 rounded-md" />
      </div>
    );
  }

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <MdDashboard className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Behavioral Interview",
      href: "/behavioral",
      icon: (
        <HiChatBubbleLeftRight className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Statistics",
      href: "/statistics",
      icon: (
        <HiChartBar className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div
        className={cn(
          "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800"
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <Logo open={open} />
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>

            {/* Profile Section */}
            <div className="mt-auto px-2 pb-4 relative">
              <div className="relative w-full flex flex-col items-start">
                <div
                  onClick={() => {
                    if (open) setIsProfileMenuOpen((prev) => !prev);
                  }}
                  className="flex items-center rounded-full p-1 cursor-pointer transition-transform duration-300 hover:bg-gray-100 dark:hover:bg-neutral-700/30"
                  style={{
                    transform: open ? "translateX(0)" : "translateX(-18px)",
                    transition: "transform 0.2s ease-in-out",
                  }}
                >
                  <img
                    src={profile.profilePhoto || "/static/images/blank_profile.png"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-gray-400"
                  />
                  {open && (
                    <motion.span
                      animate={{ opacity: 1, width: "auto" }}
                      className="ml-3 overflow-hidden font-medium text-black dark:text-white whitespace-nowrap"
                      style={{ fontFamily: "Satoshi Bold, sans-serif", fontSize: 15 }}
                    >
                      {profile.fullName || "Not set"}
                    </motion.span>
                  )}
                </div>

                {/* Profile menu */}
                <AnimatePresence>
                  {isProfileMenuOpen && open && (
                    <ProfileMenu profile={profile} handleSignOut={handleSignOut} navigate={navigate} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="flex-1 w-full overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export const Logo = ({ open }) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-between w-full px-1">
      <div className="flex items-center gap-2">
        <img
          src="/static/icons/logos/blue-wingit.png"
          alt="WiNG.it Logo"
          className="shrink-0"
          style={{ width: 23, height: 23 }}
        />
        <motion.span
          onClick={() => navigate("/")}
          animate={{
            opacity: open ? 1 : 0,
            width: open ? "auto" : 0,
          }}
          className="font-black whitespace-nowrap overflow-hidden text-black dark:text-white cursor-pointer"
          style={{ fontFamily: "Satoshi Black, sans-serif", fontSize: 25 }}
        >
          WiNG.it
        </motion.span>
      </div>
    </div>
  );
};

// Extract profile menu to separate component for clarity
const ProfileMenu = ({ profile, handleSignOut, navigate }) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    className="absolute left-0 bottom-full mb-3 w-56 rounded-2xl shadow-2xl bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 overflow-hidden z-50"
  >
    <div className="absolute inset-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl -z-10" />

    <div className="p-2">
      {/* Profile info */}
      <div className="px-3 py-3 mb-1 border-b border-gray-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <img
            src={profile.profilePhoto || "/static/images/blank_profile.png"}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-400"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {profile.fullName || "Not set"}
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-0.5">
        <motion.button
          onClick={() => navigate("/settings")}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors group"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">
            Settings
          </span>
        </motion.button>

        <div className="my-1 mx-2 border-t border-gray-200 dark:border-neutral-700" />

        <motion.button
          onClick={handleSignOut}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
        >
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            Logout
          </span>
        </motion.button>
      </div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
  </motion.div>
);

export default DefaultAppLayout;
