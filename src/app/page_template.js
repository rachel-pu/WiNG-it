import React from "react";
import MainAppBar from "../../components/MainAppBar";
import LeftNavbar from "../../components/LeftNavbar";
import { useTheme, useMediaQuery } from '@mui/material';

const Page_Template = ({ title, color, children }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  // Match these with your LeftNavbar widths
  const drawerWidth = 240;
  const collapsedWidth = 72;
  const drawerWidthXs = isXs ? 0 : collapsedWidth;

  let marginLeft = 0;
  if (isXs) marginLeft = drawerWidthXs; // can toggle dynamically with your LeftNavbar state
  else if (isSm) marginLeft = collapsedWidth;
  else if (isMdUp) marginLeft = drawerWidth;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <MainAppBar title={title} color={color} />

      {/* Side Navbar + Content */}
      <div className="flex flex-1">
        <LeftNavbar />
        <main
          className="flex-1 w-full h-full transition-all duration-300"
          style={{
            marginLeft: marginLeft,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Page_Template;
