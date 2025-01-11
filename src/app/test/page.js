// import Link from "next/link";
// import Image from "next/image";
// import Navigation from "/components/navigation";
// import Box from '@mui/material/Box';
// import Drawer from '@mui/material/Drawer';
// import Grid from '@mui/material/Grid2';
// import {Typography} from "@mui/material";
// import Stack from '@mui/material/Stack';
// import {AppBar} from "@mui/material";
// import Toolbar from '@mui/material/Toolbar';
// import {Button} from "@mui/material";
// import Card from '@mui/material/Card';
// import { GiFluffyWing } from "react-icons/gi";
//
// const Test = () => {
//     return (
//         <Box>
//         {/*  sidebar navigation  */}
//         {/*    */}
//
//         {/* end*/}
//         </Box>
//     )
//
// }
//
// export default Test;

import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { MdSpaceDashboard } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";
import { IoSettings } from "react-icons/io5";
import {GiFluffyWing} from "react-icons/gi";
import LeftNavbar from '/components/leftNavbar';



const drawerWidth = 240;

export default function PermanentDrawerLeft() {
    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            {/*<AppBar*/}
            {/*    position="fixed"*/}
            {/*    sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: `${drawerWidth}px`, bgcolor: '#324fd1', boxShadow: 'none' }}*/}
            {/*>*/}
            {/*    <Toolbar>*/}
            {/*        <Typography variant="h6" noWrap component="div" style={{ fontFamily: 'Satoshi Bold' }}>*/}
            {/*            WiNG.it*/}
            {/*        </Typography>*/}
            {/*    </Toolbar>*/}
            {/*</AppBar>*/}

            {/* --------- sidebar navigation --------- */}
            <LeftNavbar />
            {/*<Drawer*/}
            {/*    sx={{*/}
            {/*        width: drawerWidth,*/}
            {/*        flexShrink: 0,*/}
            {/*        '& .MuiDrawer-paper': {*/}
            {/*            width: drawerWidth,*/}
            {/*            boxSizing: 'border-box',*/}
            {/*        },*/}
            {/*    }}*/}
            {/*    variant="permanent"*/}
            {/*    anchor="left"*/}
            {/*>*/}
            {/*    <Toolbar>*/}
            {/*        <GiFluffyWing color={'#324FD1'} size={25}/>*/}
            {/*        <Typography component='div' sx={{ fontSize: '1.75rem', flexGrow: 1, display:{xs:'none', md:'flex', fontFamily: 'Satoshi Black'}, color: 'black'}}>WiNG.it</Typography>*/}
            {/*    </Toolbar>*/}
            {/*    <Divider />*/}
            {/*    <List>*/}
            {/*        /!* dashboard list item *!/*/}
            {/*        <ListItem >*/}
            {/*            <ListItemButton>*/}
            {/*                <ListItemIcon>*/}
            {/*                    <MdSpaceDashboard style={{ fontSize: '1.5rem'}} />*/}
            {/*                </ListItemIcon>*/}
            {/*                <ListItemText primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }}>*/}
            {/*                    Dashboard*/}
            {/*                </ListItemText>*/}
            {/*            </ListItemButton>*/}
            {/*        </ListItem>*/}

            {/*        /!* transcript list item  *!/*/}
            {/*        <ListItem >*/}
            {/*            <ListItemButton>*/}
            {/*                <ListItemIcon>*/}
            {/*                    <HiDocumentText style={{ fontSize: '1.5rem' }} />*/}
            {/*                </ListItemIcon>*/}
            {/*                <ListItemText primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }}>*/}
            {/*                    Transcripts*/}
            {/*                </ListItemText>*/}
            {/*            </ListItemButton>*/}
            {/*        </ListItem>*/}

            {/*        /!* settings list item  *!/*/}
            {/*        <ListItem >*/}
            {/*            <ListItemButton>*/}
            {/*                <ListItemIcon>*/}
            {/*                    <IoSettings style={{ fontSize: '1.5rem' }} />*/}
            {/*                </ListItemIcon>*/}
            {/*                <ListItemText primaryTypographyProps={{ fontFamily: 'Satoshi Bold' }}>*/}
            {/*                    Settings*/}
            {/*                </ListItemText>*/}
            {/*            </ListItemButton>*/}
            {/*        </ListItem>*/}
            {/*    </List>*/}
            {/*    <Divider />*/}

            {/*</Drawer>*/}
            <Box
                component="main"
                sx={{ flexGrow: 1, bgcolor: '#F3F1EB', p: 3, height: '100vh', overflow: 'auto' }}
            >
                <Toolbar />
                <Typography sx={{ marginBottom: 2, color: "#000000", fontSize: "2rem"}}>Dashboard</Typography>
                <Typography sx={{ marginBottom: 2, color: "#000000"}}>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Rhoncus dolor purus non
                    enim praesent elementum facilisis leo vel. Risus at ultrices mi tempus
                    imperdiet. Semper risus in hendrerit gravida rutrum quisque non tellus.
                    Convallis convallis tellus id interdum velit laoreet id donec ultrices.
                    Odio morbi quis commodo odio aenean sed adipiscing. Amet nisl suscipit
                    adipiscing bibendum est ultricies integer quis. Cursus euismod quis viverra
                    nibh cras. Metus vulputate eu scelerisque felis imperdiet proin fermentum
                    leo. Mauris commodo quis imperdiet massa tincidunt. Cras tincidunt lobortis
                    feugiat vivamus at augue. At augue eget arcu dictum varius duis at
                    consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem donec massa
                    sapien faucibus et molestie ac.
                </Typography>
                <Typography sx={{ marginBottom: 2,color: "#000000"}}>
                    Consequat mauris nunc congue nisi vitae suscipit. Fringilla est ullamcorper
                    eget nulla facilisi etiam dignissim diam. Pulvinar elementum integer enim
                    neque volutpat ac tincidunt. Ornare suspendisse sed nisi lacus sed viverra
                    tellus. Purus sit amet volutpat consequat mauris. Elementum eu facilisis
                    sed odio morbi. Euismod lacinia at quis risus sed vulputate odio. Morbi
                    tincidunt ornare massa eget egestas purus viverra accumsan in. In hendrerit
                    gravida rutrum quisque non tellus orci ac. Pellentesque nec nam aliquam sem
                    et tortor. Habitant morbi tristique senectus et. Adipiscing elit duis
                    tristique sollicitudin nibh sit. Ornare aenean euismod elementum nisi quis
                    eleifend. Commodo viverra maecenas accumsan lacus vel facilisis. Nulla
                    posuere sollicitudin aliquam ultrices sagittis orci a.
                </Typography>
            </Box>
        </Box>
    );
}