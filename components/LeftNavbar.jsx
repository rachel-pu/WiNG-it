"use client"
import React, { useState } from 'react';
import {
    Drawer,
    Toolbar,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    IconButton
} from '@mui/material';
import { GiFluffyWing } from 'react-icons/gi';
import { MdSpaceDashboard } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import { IoSettings } from 'react-icons/io5';
import { Menu as MenuIcon } from '@mui/icons-material';

const drawerWidth = 240;
const collapsedWidth = 72; // width when only icons are shown

const navItems = [
{ text: 'Dashboard', icon: <MdSpaceDashboard style={{ fontSize: '1.5rem' }} />, href: '/dashboard' },
{ text: 'Saves', icon: <HiDocumentText style={{ fontSize: '1.5rem' }} />, href: '/saves' },
{ text: 'Settings', icon: <IoSettings style={{ fontSize: '1.5rem' }} />, href: '/settings' },
];

const LeftNavbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerWidthXs, setDrawerWidthXs] = useState(0);
    const toggleDrawerXs = () => {
        setDrawerWidthXs(prev => (prev === 0 ? collapsedWidth : 0));
    };
    const toggleDrawer = () => setMobileOpen(!mobileOpen);

    const drawerContent = (hideText = false) => (
    <>
      <Toolbar>
        <GiFluffyWing color={'#324FD1'} size={25} />
        <Typography
          component="div"
          sx={{
            fontSize: '1.5rem',
            flexGrow: 1,
            display: { xs: 'none', md: 'flex' },
            fontFamily: 'Satoshi Black',
            color: 'black',
            ml: 1,
          }}
        >
          WiNG.it
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map(({ text, icon, href }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              component="a"
              href={href}
              sx={{
                borderRadius: 2,
                justifyContent: { xs: 'center', sm: 'center', md: 'flex-start' },
              }}
            >
              <ListItemIcon sx={{ minWidth: { xs: 0, md: 40 }, justifyContent: 'center' }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={text}
                sx={{ display: { xs: 'none', md: 'block' } }}
                primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ padding: 3, textAlign: 'center', display: { xs: 'none', md: 'block' } }}>
        <Typography variant="caption" sx={{ fontFamily: 'Satoshi Medium' }}>
          © 2024-2025 WiNG.it
        </Typography>
      </Box>
    </>
  );

  return (
    <>
      {/* Hamburger button only on mobile */}
      <IconButton
        color="inherit"
        edge="start"
        onClick={toggleDrawerXs}
        sx={{
            bgcolor: 'white',
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            left: { xs: '3px', md: '5px' },
            top: { xs: '3px', md: '5px' },
            zIndex: 2000,
            margin:0.8,
            "&:hover": {
                bgcolor: "#e0e0e0", // darker gray on hover
            },
        }}
      >
        <MenuIcon />
    </IconButton>

    {/* <Drawer
        variant="permanent"
        open={mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
            width: { xs: 0, sm: collapsedWidth, md: drawerWidth },
            flexShrink: 0,
            "& .MuiDrawer-paper": {
            width: { xs: 0, sm: collapsedWidth, md: drawerWidth },
            boxSizing: "border-box",
            },
        }}
    >
        {drawerContent}
      </Drawer> */}
      {/* Drawer for xs screens, toggles width between 0 and collapsedWidth */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidthXs,
          flexShrink: 0,
          transition: 'width 0.3s ease',
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidthXs,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
          },
        }}
      >
        {drawerContent(true)} {/* hideText = true */}
      </Drawer>

      {/* Permanent drawer for sm+ screens */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { sm: collapsedWidth, md: drawerWidth },
            transition: 'width 0.3s',
          },
        }}
        open
      >
        {drawerContent()}
      </Drawer>
    </>
  );
};

export default LeftNavbar;
