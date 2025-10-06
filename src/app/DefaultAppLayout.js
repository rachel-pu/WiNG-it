"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar, SidebarBody, SidebarLink } from "../components/ui/sidebar";
import { GiFluffyWing } from "react-icons/gi";
import { MdDashboard } from "react-icons/md";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import Link from "next/link";
import { motion } from "motion/react";


const DefaultAppLayout = ({ title, color, titlecolor, elevation, children }) => {
  const [ready, setReady] = useState(false);
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
  ];

  useEffect(() => {
    setReady(true);
  }, []);

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
  return (
    <Link
      href="/"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black no-underline"
    >
      <GiFluffyWing color="#324FD1" size={25} className="shrink-0" />
      <motion.span
        animate={{
          opacity: open ? 1 : 0,
          width: open ? "auto" : 0,
        }}
        className="font-black whitespace-nowrap overflow-hidden text-black dark:text-white"
        style={{ fontFamily: 'Satoshi Black, sans-serif', fontSize: 25}}
      >
        WiNG.it
      </motion.span>
    </Link>
  );
};

export default DefaultAppLayout;