import React, { useEffect, useState } from "react";
import MainAppBar from "../../components/MainAppBar";
import LeftNavbar from "../../components/LeftNavbar";
import { useTheme, useMediaQuery } from '@mui/material';

const DefaultAppLayout = ({ title, color, titlecolor, elevation, children }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm') , { noSsr: true });
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md') , { noSsr: true });
  const isMdUp = useMediaQuery(theme.breakpoints.up('md') , { noSsr: true });
  const [ready, setReady] = useState(false);

  // Match these with your LeftNavbar widths
  const drawerWidth = 240;
  const collapsedWidth = 72;
  const drawerWidthXs = isXs ? 0 : collapsedWidth;

  let marginLeft = 0;
  if (isXs) marginLeft = drawerWidthXs; // can toggle dynamically with your LeftNavbar state
  else if (isSm) marginLeft = 0;
  else if (isMdUp) marginLeft = drawerWidth;

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {/* You can replace with a spinner or skeleton loader */}
      </div>
    );
  }

  return (  
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <MainAppBar title={title} color={color} titlecolor={titlecolor} elevation={elevation}/>

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

export default DefaultAppLayout;
