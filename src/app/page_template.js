import React from "react";
import MainAppBar from "../../components/MainAppBar";
import LeftNavbar from "../../components/LeftNavbar";

const Page_Template = ({ title, color, children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <MainAppBar title={title} color={color} />

      {/* Side Navbar + Content */}
      <div className="flex flex-1">
        <LeftNavbar />
        <main className="flex-1 w-full h-full">{children}</main>
      </div>
    </div>
  );
};

export default Page_Template;
