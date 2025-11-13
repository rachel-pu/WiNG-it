"use client";
import{ useState, useEffect } from "react";
import { cn } from "../lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "../components/sidebar";
import { MdDashboard } from "react-icons/md";
import { HiChatBubbleLeftRight, HiChartBar } from "react-icons/hi2";
import { IoMdSettings } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabase.js";
import { database } from '../lib/firebase.jsx';
import { ref, get, child } from "firebase/database";


const DefaultAppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState({ fullName: "", profilePhoto: "" });
  const [userId, setUserId] = useState(null);

   useEffect(() => {
      const setUserCookie = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session){
          setLoading(false);
          return;
      };

      const userId = data.session.user.id;
      setUserId(userId);
      document.cookie = `user_id=${userId}; path=/; max-age=604800; secure; samesite=strict`;
      };
      setUserCookie();
    }, []);

    useEffect(() => {
      if (!userId) return;

      const fetchProfile = async () => {
        try {
          const snapshot = await get(child(ref(database), `users/${userId}/personalInformation`));
          if (snapshot.exists()) {
            setProfile(snapshot.val());
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
    };

    fetchProfile();
  }, [userId]);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <MdDashboard className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Behavioral Interview",
      href: "/behavioral",
      icon: <HiChatBubbleLeftRight className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Statistics",
      href: "/statistics",
      icon: <HiChartBar className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <IoMdSettings className="h-6 w-6 shrink-0 text-neutral-700 dark:text-neutral-200" />,
    },
  ];


  return (
    <div className="flex flex-col h-screen">
      <div
        className={cn(
          "flex w-full flex-1 flex-col overflow-hidden bg-gray-100 md:flex-row dark:bg-neutral-800",
        )}
      >
        <Sidebar open={open} setOpen={setOpen} >
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              <Logo open={open} />
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink key={idx} link={link} />
                ))}
              </div>
            </div>
             <div className="mt-auto px-2 pb-4">
            <div
              className={cn(
                "flex items-center justify-start rounded-full p-1 transition-all duration-300 -ml-5",
                open ? " justify-start pl-2" : "justify-center w-12"
              )}
            >
              <img
                src={profile.profilePhoto || "/static/images/blank_profile.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover shrink-0 border-2 border-gray-400"
              />
              {open && (
                <motion.span
                  animate={{
                    opacity: open ? 1 : 0,
                    width: open ? "auto" : 0,
                  }}
                  style={{ fontFamily: 'Satoshi Bold, sans-serif', fontSize: 15, marginLeft: 12 }}
                  className="overflow-hidden font-medium text-black dark:text-white hover:text-current whitespace-nowrap"
                >
                  {profile.fullName || "Not set"}
                </motion.span>
               )}
            </div>
          </div>

          </SidebarBody>
        </Sidebar>
        <div className="flex-1 w-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Logo = ({ open }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
    } else {
      navigate("/signin");
    }
  };

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
          className="font-black whitespace-nowrap overflow-hidden text-black dark:text-white"
          style={{ fontFamily: 'Satoshi Black, sans-serif', fontSize: 25 }}
        >
          WiNG.it
        </motion.span>
      </div>

      <div>
        <FaSignOutAlt
          size={20}
          className="cursor-pointer text-black dark:text-white"
          onClick={handleSignOut}
        />
      </div>
    </div>
  );
};

export default DefaultAppLayout;