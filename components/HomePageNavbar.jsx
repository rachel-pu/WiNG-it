"use client";
import React from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  IconButton,
  Menu,
  Button,
  Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { GiFluffyWing } from "react-icons/gi";
import { Link } from "react-scroll";

export default function HomePagenNavbar() {
    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };
    
    return (
        <AppBar position="static" className="navigation-bar">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* desktop logo / big viewport */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
                        <GiFluffyWing color="#324FD1" size={25} />
                    </Box>
                    <Typography component='div' sx={{ fontSize: '1.75rem', flexGrow: 1, display:{xs:'none', md:'flex', fontFamily: 'Satoshi Black'}, color: 'black'}}>WiNG.it</Typography>

                    {/* smaller viewport: hamburger icon */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
                        <IconButton
                            size="large"
                            aria-label="open navigation menu"
                            onClick={handleOpenNavMenu}
                            color="black"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {/* navigation bar drop down */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    rowGap: 1,
                                    p: 1
                                }}
                            >
                                <Button
                                    color="inherit"
                                    sx={{
                                        fontSize: '1.05rem',
                                        fontFamily: 'Satoshi Bold',
                                        textTransform: 'none',
                                        color: 'black',
                                        letterSpacing: '-0.01px',
                                        px: 2,
                                    }}
                                >
                                    <Link
                                        activeClass="active"
                                        to="why-wing-it"
                                        offset={-50}
                                        duration={500}
                                        style={{
                                            fontSize: '1.05rem',
                                            fontFamily: 'Satoshi Medium',
                                            textTransform: 'none',
                                            color: 'black',
                                            letterSpacing: '-0.01px',
                                        }}
                                    >
                                        Why WiNG.it
                                    </Link>
                                </Button>

                                <Button
                                    color="inherit"
                                    sx={{
                                        fontSize: '1.05rem',
                                        fontFamily: 'Satoshi Medium',
                                        textTransform: 'none',
                                        color: 'black',
                                        letterSpacing: '-0.01px',
                                        px: 2,
                                    }}
                                >
                                    <Link
                                        activeClass="active"
                                        to="about-us"
                                        offset={-50}
                                        duration={500}
                                        style={{
                                            fontSize: '1.05rem',
                                            fontFamily: 'Satoshi Medium',
                                            textTransform: 'none',
                                            color: 'black',
                                            letterSpacing: '-0.01px',
                                        }}
                                    >
                                        Our Story
                                    </Link>
                                </Button>

                                <Button
                                    color="inherit"
                                    href="/dashboard"
                                    sx={{
                                        fontSize: '1.05rem',
                                        fontFamily: 'Satoshi Medium',
                                        textTransform: 'none',
                                        background: 'linear-gradient(135deg, #2850d9 0%, #667eea 100%)',
                                        px: 2.5,
                                        borderRadius: '12px',
                                        color: 'white',
                                        letterSpacing: '-0.01px',
                                        transition: 'transform 0.3s',
                                    }}
                                >
                                    Get Started
                                </Button>
                            </Box>
                        </Menu>
                    </Box>

                    {/* mobile logo / small viewport */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
                        <GiFluffyWing color="#324FD1" size={25} />
                    </Box>
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'Satoshi Black',
                            color: '#000000',
                            fontSize: '1.75rem',
                            textDecoration: 'none',
                        }}
                    >
                        WiNG.it
                    </Typography>

                    {/* desktop navigation on the right */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap:1.5}}>
                        <Button color='inherit' sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color:  'black', letterSpacing: '-0.01px', borderRadius: '12px', paddingX: 2, '&:hover': { backgroundColor: 'rgba(40, 80, 217, 0.08)' }}}>
                            <Link
                                activeClass="active"
                                to="why-wing-it"
                                offset={-50}
                                duration={500}
                                style={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px', borderRadius: '12px', paddingX: 2 }}
                            >
                                Why WiNG.it
                            </Link>
                        </Button>
                        <Button color='inherit' sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px',borderRadius: '12px',paddingX: 2, '&:hover': { backgroundColor: 'rgba(40, 80, 217, 0.08)' }}}>
                            <Link
                                activeClass="active"
                                to="about-us"
                                offset={-50}
                                duration={500}
                                style={{ fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px', borderRadius: '12px', paddingX: 2 }}
                            >
                                Our Story
                            </Link>
                        </Button>
                        <Button 
                            color='inherit' 
                            // href='/sign-up' 
                            href = '/dashboard'
                            sx={{
                                fontSize: '1.05rem', 
                                fontFamily: 'Satoshi Bold', 
                                textTransform: 'none', 
                                background: 'linear-gradient(135deg, #2850d9 0%, #667eea 100%)',
                                paddingX: 2.5,
                                borderRadius: '12px', 
                                color: 'white', 
                                letterSpacing: '-0.01px', 
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                boxShadow: '0 4px 14px 0 rgba(40, 80, 217, 0.3)',
                                '&:hover': { 
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px 0 rgba(40, 80, 217, 0.4)'
                                }
                            }}
                        >
                            Get Started
                        </Button>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}