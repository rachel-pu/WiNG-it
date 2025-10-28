"use client";
import{ useState } from "react";
import { cn } from "../lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "../components/sidebar";
import { MdDashboard } from "react-icons/md";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { IoMdSettings } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";
import { motion } from "motion/react";
import { useAsyncError, useNavigate } from "react-router-dom";
import { supabase } from "../../supabase.js";


const DefaultAppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);

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
      label: "Settings",
      href: "/settings/profile",
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

  // const token = await grecaptcha.execute("YOUR_SITE_KEY", { action: "signup" });
  // const response = await fetch("/api/verify-recaptcha", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ token })
  // });
  // const data = await response.json();
  // if (!data.success) {
  //   setError("reCAPTCHA verification failed. Please try again.");
  //   return;
  // }

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
      {/* Left side: Logo + Text */}
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

      {/* Right side: Sign Out */}
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