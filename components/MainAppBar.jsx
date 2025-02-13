import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { UserButton } from '@clerk/nextjs';

const drawerWidth = 240;

const MainAppBar = ({ title, color }) => (
    <AppBar
        position="fixed"
        sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: color, boxShadow: 'none'}}
    >
        <Toolbar>
            <Box className="flex flex-row w-full" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="h6" noWrap component="div" style={{ marginTop: '8px', fontFamily: 'Satoshi Bold', fontSize: "1.5rem" }}>
                    {title}
                </Typography>
                <UserButton appearance={{
                    variables: {
                        fontFamily: 'DM Sans',
                    }
                }} />
            </Box>
        </Toolbar>
    </AppBar>
);

export default MainAppBar;