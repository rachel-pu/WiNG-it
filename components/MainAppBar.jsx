import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const drawerWidth = 240;
const collapsedWidth = 72;
const MainAppBar = ({ title, color }) => (
    <AppBar
        position="fixed"
        sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: color,
            color: "white",
            transition: "margin-left 0.3s ease, width 0.3s ease",
            ml: { xs: 0, sm: `${collapsedWidth}px`, md: `${drawerWidth}px` },
            width: {
            xs: "100%",
            sm: "100%",
            md: `calc(100% - ${drawerWidth}px)`,
            }
        }}
    >
        <Toolbar>
            <Box className="flex flex-row w-full" sx={{ justifyContent: 'space-between' }}>
                <Typography
                    noWrap
                    component="div"
                    sx={{
                       mt: { xs: '7px', sm: '5px', md: '5px', lg: '5px' },
                        fontFamily: 'Satoshi Bold',
                        fontSize: {
                        xs: '1.35rem',  
                        sm: '1.5rem', 
                        md: '1.5rem', 
                        lg: '1.70rem',
                        },
                        pl: { xs: "50px", sm: "40px", md: "0px" },
                    }}
                >
                    {title}
                </Typography>
            </Box>
        </Toolbar>
    </AppBar>
);

export default MainAppBar;