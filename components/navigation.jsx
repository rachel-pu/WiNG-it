"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Navigation = () => {
    const router = useRouter();
    const [activePath, setActivePath] = useState(router.pathname);

    useEffect(() => {
        setActivePath(router.pathname); // Update the active path when the route changes
    }, [router.pathname]);

    return (
        <div className="bg-color282523 w-60 min-h-screen flex flex-col justify-between p-5">
            <div>
                <h1 className="text-xl font-dm-sans-black tracking-tighter text-white mb-5">Navigation</h1>
                <ul className="flex flex-col">
                    {[
                        { href: "/dashboard", label: "Dashboard" },
                        { href: "/transcripts", label: "Transcripts" },
                        { href: "/profile", label: "Profile" },
                    ].map(({ href, label }) => (
                        <li key={href} className="mb-3">
                            <Link href={href}>
                                <p
                                    className={`text-white cursor-pointer transition-all duration-300 p-2 rounded ${
                                        activePath === href ? "bg-gray-700" : "hover:bg-gray-600"
                                    }`}
                                >
                                    {label}
                                </p>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <p className="text-white text-sm font-satoshi">© 2023 Your Company</p>
            </div>
        </div>
    );
};

export default Navigation;
