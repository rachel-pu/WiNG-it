import Link from "next/link";

const Navbar = () => {
    return (
        <div>
            {/* --------------------- vertical navbar --------------------- */}
            <div className="bg-color282523 w-60 min-h-screen flex flex-col justify-between p-5">
                <div>
                    <h1 className="text-xl font-dm-sans-black tracking-tighter text-white mb-5">Navigation</h1>
                    <ul className="flex flex-col">
                        <li className="mb-3">
                            <Link href="/dashboard">
                                <p className="text-white">Dashboard</p>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/transcripts">
                                <p className="text-white">Transcripts</p>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/settings">
                                <p className="text-white">Settings</p>
                            </Link>
                        </li>
                        <li className="mb-3">
                            <Link href="/profile">
                                <p className="text-white">Profile</p>
                            </Link>
                        </li>
                        {/* Add more navigation items here */}
                    </ul>
                </div>
                <div>
                    <p className="text-white text-sm font-satoshi">© 2023 Your Company</p>
                </div>
            </div>
        </div>
    );
}

export default Navbar;