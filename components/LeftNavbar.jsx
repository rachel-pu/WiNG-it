import React from 'react';
import { Drawer, Toolbar, Typography, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box } from '@mui/material';
import { GiFluffyWing } from 'react-icons/gi';
import { MdSpaceDashboard } from 'react-icons/md';
import { HiDocumentText } from 'react-icons/hi';
import { IoSettings } from 'react-icons/io5';

const LeftNavbar = () => {
    const drawerWidth = 240;

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                '& .MuiDrawer-paper': {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Toolbar >
                <GiFluffyWing color={'#324FD1'} size={25}/>
                <Typography component='div' sx={{ fontSize: '1.75rem', flexGrow: 1, display: { xs: 'none', md: 'flex' }, fontFamily: 'Satoshi Black', color: 'black' }}>
                    WiNG.it
                </Typography>
            </Toolbar>
            <Divider />
            <List sx={{ flexGrow: 1 }}>
                <ListItem>
                    <ListItemButton sx={{borderRadius: 2}} component="a" href="/dashboard">
                        <ListItemIcon>
                            <MdSpaceDashboard style={{ fontSize: '1.5rem' }} />
                        </ListItemIcon>
                        <ListItemText primary="Dashboard" primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }} />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton sx={{borderRadius: 2}} component="a" href="/saves">
                        <ListItemIcon>
                            <HiDocumentText style={{ fontSize: '1.5rem' }} />
                        </ListItemIcon>
                        <ListItemText primary="Saves" primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }} />
                    </ListItemButton>
                </ListItem>

                <ListItem>
                    <ListItemButton sx={{borderRadius: 2}} component="a" href="/settings">
                        <ListItemIcon>
                            <IoSettings style={{ fontSize: '1.5rem' }} />
                        </ListItemIcon>
                        <ListItemText primary="Settings" primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }} />
                    </ListItemButton>
                </ListItem>

            </List>
            <Divider />
            <Box sx={{ padding: 3, textAlign: 'center' }}>
                <Typography variant="caption" sx={{fontFamily: "Satoshi Medium"}}>
                    © 2024-2025 WiNG.it
                </Typography>
            </Box>
        </Drawer>
    );
};

export default LeftNavbar;
