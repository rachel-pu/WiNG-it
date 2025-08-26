"use client";
import React from "react";
import Image from "next/image";
import {motion, inView, animate} from "framer-motion";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import {Typography} from "@mui/material";
import Stack from '@mui/material/Stack';
import {AppBar} from "@mui/material";
import Toolbar from '@mui/material/Toolbar';
import {Button} from "@mui/material";
import { GiFluffyWing } from "react-icons/gi";
import Card from '@mui/material/Card';
import { FaPencilRuler } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { BiSolidMessageCheck } from "react-icons/bi";
import { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import {IconButton, Paper} from "@mui/material";

import "./HomePage.css";

const pages = ['Why WiNG.it', 'About Us', 'Login'];
export default function HomePage() {

    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring"},
    };

    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };


    return (
        <Box>
            {/* ---------- nav bar ---------- */}
            <AppBar position="static"
                    className="navigation-bar">
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
                                            About Us
                                        </Link>
                                    </Button>

                                    <Button
                                        color="inherit"
                                        href="/sign-up"
                                        sx={{
                                            fontSize: '1.05rem',
                                            fontFamily: 'Satoshi Medium',
                                            textTransform: 'none',
                                            backgroundColor: '#2850d9',
                                            px: 2.5,
                                            borderRadius: '5px',
                                            color: 'white',
                                            letterSpacing: '-0.01px',
                                            transition: 'transform 0.3s',
                                        }}
                                    >
                                        Login
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
                                    <Button color='inherit'  sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color:  'black', letterSpacing: '-0.01px', borderRadius: '50px',paddingX: 2}}>
                                        <Link
                                            activeClass="active"
                                            to="why-wing-it"
                                            offset={-50}
                                            duration={500}
                                            style={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px', borderRadius: '50px', paddingX: 2 }}
                                        >
                                            Why WiNG.it
                                        </Link>
                                    </Button>
                                    <Button color='inherit' sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px',borderRadius: '50px',paddingX: 2}}>
                                        <Link
                                            activeClass="active"
                                            to="about-us"
                                            offset={-50}
                                            duration={500}
                                            style={{ fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px', borderRadius: '50px', paddingX: 2 }}
                                        >
                                            About Us
                                        </Link>
                                    </Button>
                                    <Button color='inherit' href='/sign-up' sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', backgroundColor: '#2850d9', paddingX: 2.5,borderRadius: '50px', color:  'white', letterSpacing: '-0.01px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05) rotate(-2deg)' }}}>
                                        Login
                                    </Button>
                                </Box>
                    </Toolbar>
                </Container>
            </AppBar>

        {/* container*/}
        <Box
            sx={{
            minHeight: '100dvh',
        }}>

            {/* ---------- home page ----------  */}
            <Box id="home-page"
                // sx={{
                //     minHeight: '100dvh',
                //     pt: { xs: "5%", md: 0 }
                //  }}
                //  className="w-full bg-colorF3F1EA flex justify-center items-center"
                className="main-home-page-container">

                {/*  main content box  */}
                <Grid container
                    spacing={5}
                    direction={"column"}
                    width={'80%'}
                    sx={{px: "5%"}}>

                    {/*  title/slogan  */}
                    <Grid item xs>
                        <Stack direction={"column"} spacing={2}>
                            <motion.div
                                className="main-home-page-title-container"
                                // className="flex items-center justify-center space-x-2 flex-col -space-y-3.5"
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        >
                                <motion.p
                                    variants = {itemVariants}
                                    className="main-home-page-title-text">
                                    Unlock all your career tools
                                    with no strings attached. 😉
                                </motion.p>
                            </motion.div>

                            {/* description */}
                            <motion.div className="main-home-page-description-container"
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.05 }}
                                    className="description-text">
                                    WiNG.it provides tools to enhance your skills in
                                    interviews, networking, and beyond, helping you excel in your career.
                                </motion.p>
                            </motion.div>
                        </Stack>
                    </Grid>

                    {/* ---------- cards ---------- */}
                    <Grid item xs>
                        <motion.div initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}>
                            <Grid container spacing={2} columns={3} rows={1}  direction={{xs: "column", s: "column", md: "row", lg: "row"}}
                            wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                            >

                                {/* career prep tools card */}
                                <Grid xs={12} sm={6} md={4} lg={3}>
                                    <motion.div variants = {itemVariants}
                                                transition={{ delay: 0.4 }}>
                                        <Card className="main-home-page-card">
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1c4a8', borderRadius: '50%', width: '40px', height: '40px', marginBottom:'15px'}}>
                                                <FaPencilRuler color={'#E3632E'} size={20} />
                                            </div>
                                            <Typography variant="h5" className="main-home-page-card-feature-title">
                                                Career Prep Tools
                                            </Typography>
                                            <Typography className="main-home-page-card-feature-description">
                                                Using our variety of tools, you can practice for interviews, networking, and more.
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* saving saves card */}
                                <Grid xs={12} sm={6} md={4} lg={3}>
                                    <motion.div variants = {itemVariants}
                                                transition={{ delay: 0.6 }}>
                                        <Card className="main-home-page-card">
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#9db8ea', borderRadius: '50%', width: '40px', height: '40px', marginBottom:'15px'}}>
                                                <IoDocumentText color={'#2a6ed5'} size={25} />
                                            </div>
                                            <Typography variant="h5" className="main-home-page-card-feature-title">
                                                Saves Transcripts
                                            </Typography>
                                            <Typography className="main-home-page-card-feature-description">
                                                After each practice session, you can save your transcripts to review for later.
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* personalized feedback card */}
                                <Grid xs={12} sm={6} md={4} lg={3}>
                                    <motion.div variants = {itemVariants}
                                                transition={{ delay: 0.8 }}>
                                        <Card className="main-home-page-card">
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#9fcb95', borderRadius: '50%', width: '40px', height: '40px', marginBottom:'15px'}}>
                                                <BiSolidMessageCheck color={'#559437'} size={25} style={{marginTop: '2.5px'}}/>
                                            </div>
                                            <Typography variant="h5" className="main-home-page-card-feature-title">
                                                Personalized Feedback
                                            </Typography>
                                            <Typography className="main-home-page-card-feature-description">
                                                Receive customized feedback on your performance to help you improve your skills.
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            </Grid>
                        </motion.div>
                    </Grid>

                    {/* and it's all for free */}
                    <Grid item xs>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                            transition={{ delay: 1.3 }}
                            >
                        <Typography style={{color: 'black', textAlign: 'center', fontSize: '1.35rem', fontFamily: 'Satoshi Medium'}}>
                            And the best part? It&#39;s all for <span style={{fontFamily: 'Satoshi Black', color: 'black'}}>free.</span>
                        </Typography>
                        </motion.div>
                    </Grid>


                </Grid>
            </Box>

            {/* ---------- why wing it ----------*/}
            <Box id="why-wing-it"
                sx={{
                    minHeight: '100vh',
                    pt: { xs: "10%", md: 0 }
                }}
                 className="w-full bg-colorF3F1EA flex justify-center items-center">
                <Grid container 
                    spacing={4}
                    columns={5}
                    rows={1}
                    wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                    justifyContent={{ xs: "center", sm: "center", md: "flex-start", lg: "flex-start" }}
                    direction={{ xs: 'column', md: 'row' }}
                    width={{ xs: '98%', sm: '90%', md: '80%' }}
                >

                    {/* ---------- title / description ---------- */}
                    <Grid item xs={12} sm={6} md={4} lg={3} >
                        <motion.div style={{padding: '2.5%'}}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}>

                            {/* title */}
                            <motion.h2
                                variants = {itemVariants}
                                transition={{ delay: 0.5 }}
                                style={{paddingLeft: '23px', fontFamily:'Satoshi Bold', color: 'black', fontSize: '3rem', letterSpacing: '-0.5px', lineHeight: '132%'}}>
                                We created the quality, free tools we needed. 🛠️
                            </motion.h2>

                            {/* description*/}
                            <Stack spacing={2}
                                   style={{padding: '30px'}}>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.8 }}
                                    style = {{fontFamily: 'DM Sans', color: 'black', lineHeight: '150%', fontSize: '1.25rem'}}>
                                    As students, we know interviewing and networking can be hard. Like, really hard. And unfortunately, there are close to zero good, free, and
                                    useful career preparation tools out there.
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.95 }}
                                    className="text-1.5xl" style = {{fontFamily: 'DM Sans', color: 'black', lineHeight: '150%', fontSize: '1.25rem'}}>
                                    Our goal? <span
                                    style = {{fontFamily: 'DM Sans Bold', color: '#000000', letterSpacing: '-0.5px'}}>Making career preparation more accessible for everybody. </span> No paywall.
                                    No fees. Just practicing for your upcoming opportunities and needs.
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 1.1}}
                                    className="text-1.5xl" style = {{fontFamily: 'DM Sans', color: 'black', lineHeight: '150%', fontSize: '1.25rem'}}>
                                    Oh, and as a bonus, making it fun. Because who said preparing for your future can&apos;t be fun?
                                </motion.p>
                            </Stack>
                        </motion.div>
                    </Grid>

                    {/* picture */}
                    <Grid item xs={12} sm={6} md={4} lg={3} style={{backgroundColor: '#C1D6E6', borderRadius: '30px'}}>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                            transition={{ delay: 1.3 }}
                            >
                            <Image
                                src={'/static/images/behavioral.png'}
                                alt={"Why WiNG.it image"}
                                width={500}
                                height={500}
                            />
                        </motion.div>
                    </Grid>


                </Grid>
            </Box>

            {/*  ---------- about us ----------  */}
            <Box id="about-us"
                 sx={{
                    minHeight: '40dvh',
                    paddingTop: { xs: '12%', sm: '8%', md: '6%' },
                 }}
                 className=" w-full flex justify-center bg-colorF3F1EA" >
                <Grid container
                    direction={"row"}
                    width={{ xs: '98%', sm: '90%', md: '80%' }}
                    sx={{ paddingLeft: { xs: '2%', sm: '5%' }, paddingRight: { xs: '2%', sm: '5%' } }}>

                    {/* title  */}
                    <Stack spacing={1} direction="column">
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            variants={itemVariants}>
                        <Typography style={{fontFamily:'Satoshi Bold', color: 'black', fontSize: '3.3rem', letterSpacing: '-0.5px',userSelect: 'none', textAlign:'center'}}>
                            Really quick, here&#39;s a little about us.
                        </Typography>
                        </motion.div>
                    </Grid>

                    {/* description */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>

                        <Stack spacing={3} direction={"column"}>
                            <motion.p className="text-1.5xl leading-tight text-center"
                                      variants = {itemVariants}
                                      style = {{fontFamily: 'DM Sans', color: 'black', fontSize: '1.2rem', lineHeight: '150%'}}
                                      transition={{ delay: 0.75 }}>
                                Our project was created for the
                                <span className="font-dm-sans-black tracking-tight"> University of Florida’s 🐊</span> first annual
                                <span className="font-dm-sans-black tracking-tight"> WiNGHacks Hackathon 🪽</span>, a hackathon designed to empower
                                women, non-binary, and gender minorities by providing them with a platform to innovate and create. Our project won
                                <span className="font-dm-sans-black tracking-tight"> first place 🏆</span> for best project created by first time hackathoners and was picked up by
                                <span className="font-dm-sans-black tracking-tight"> UF Professor Amanpreet Kapoor  💻</span> to continue being built for improvement.
                            </motion.p>
                            <motion.p className="text-1.5xl leading-tight text-center"
                                      style = {{fontFamily: 'DM Sans', color: 'black', fontSize: '1.2rem', lineHeight: '150%'}}
                                      variants = {itemVariants}
                                      transition={{ delay: 1 }}>
                                WiNG.it was created to reduce the stress of interview prep.
                                As college students, we recognize the importance of being prepared for interviews and networking, as well as having easy access to resources.
                                We hope that with WiNG.it, we can help elevate that stress & push you to be the best version of yourself.
                            </motion.p>
                        </Stack>
                        </motion.div>
                        </Stack>
                </Grid>
            </Box>


            {/*  developer section  */}
            <Grid 
                sx={{
                    py: { xs: 6, sm: 8, md: 10 },
                    // backgroundColor: '#F3F1EA'
                }}>
                <Grid container
                    spacing={3}
                    alignItems="center"
                    direction={{ xs: 'row', md: 'row', lg: 'row' }}
                    width={{ xs: '98%', sm: '90%', md: '80%', lg: '80%' }}
                    wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                    sx={{ mx: 'auto', pl: '250px', px: { xs: '2%', sm: '5%', lg: '8%' } }}>

                        {/* Rachel */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Grid container spacing={2} alignItems="center">
                            {/* Photo */}
                            <Grid item xs={6}>
                                <Link
                                component="a"
                                href="https://www.linkedin.com/in/rachel-pu-ufl/"
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                <motion.img
                                    src="/static/images/rachel%20pu%20image.png"
                                    alt="Rachel Pu"
                                    className="rounded-2xl drop-shadow-lg w-32 h-32 sm:w-40 sm:h-40 md:w-46 md:h-46"
                                    whileHover={{ scale: 1.05, rotate: 2, cursor: "pointer" }}
                                />
                                </Link>
                            </Grid>
                            {/* Text */}
                            <Grid item xs={6}>
                                <motion.div className=" flex justify-end flex-col"
                                >
                                    <svg className="mr-[75%]" width="80" height="40" viewBox="0 0 160 81" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M156.5 77.0683C154.41 74.8293 159.5 47.9643 124.573 31.436C112.186 27.8405 98.4507 27.7896 86.2908 31.9493C82.3414 33.3003 75.4181 36.8744 77.6474 42.2157C78.6654 44.6548 81.0524 45.8653 83.3122 47.0145C84.8813 47.8125 87.2686 48.6898 89.0055 47.9643C91.6025 46.8795 93.3429 43.7303 93.4438 41.0234C93.5767 37.4546 91.4058 34.0529 89.1138 31.4474C87.3829 29.4798 85.3765 27.8624 83.1231 26.5118C78.1125 23.5086 72.5744 21.0674 66.8886 19.7329C61.228 18.4043 55.2856 18.077 49.5198 18.5148C42.1294 19.076 35.4292 21.5196 28.8482 24.7135C22.9236 27.5887 17.2903 30.9925 11.43 33.9847C10.6607 34.3775 9.86975 34.7294 9.1074 35.1352C9.09475 35.1419 8.21484 35.5192 8.45132 35.7966C9.08297 36.5375 11.0659 36.9922 11.8847 37.2908C16.2038 38.8662 20.4808 40.488 24.6644 42.409C27.6769 43.7922 30.6364 45.2918 33.5077 46.9496C34.0948 47.2885 32.272 46.4532 32.1737 46.4105C25.6681 43.5896 18.9151 41.612 12.0745 39.7891C10.8699 39.4681 8.80368 38.923 7.55391 38.6175C6.48865 38.3571 5.12525 38.2561 4.09873 37.817C3.42585 37.5291 5.97025 35.1791 6.12197 34.9911C9.12405 31.2712 11.4965 27.0298 13.8929 22.9111C16.408 18.5885 18.4498 14.2139 20.1097 9.49715C20.3421 8.83669 21.371 3.95918 22.4476 4.27169"
                                            stroke="black" strokeWidth="7" strokeLinecap="round"/>
                                    </svg>
                                    <Typography
                                    variant="h2"
                                    sx={{
                                        fontFamily: 'Satoshi Bold',
                                        fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.2rem" },
                                        marginBottom: '-4px',
                                        lineHeight: { xs: 1.8, sm: 2, md: 2.2, lg: 2.2 }
                                    }}
                                    className="tracking-tight text-color282523 text-left"
                                    >
                                    Rachel Pu
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color:"#81807C",
                                            fontFamily: 'Satoshi Medium',
                                            fontSize:{ xs: "1.0rem", sm: "1.0rem", md: "1.0rem" },
                                            lineHeight: { xs: 1.1, sm: 1.2, md: 1.2, lg: 1.3 }
                                        }}
                                        className="font-dm-sans-medium text-left"
                                        >
                                        Student at UF majoring in Computer Science and minoring in Digital Arts & Sciences
                                    </Typography>
                                </motion.div>
                            </Grid>
                            </Grid>
                        </Grid>

                        {/* Chelsea */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Grid container spacing={2} alignItems="center">
                            {/* Photo */}
                            <Grid item xs={6}>
                                <Link
                                component="a"
                                href="https://www.linkedin.com/in/chelseaqnguyen/"
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                             
                                <motion.img
                                    src="/static/images/chelsea nguyen image.png"
                                    alt="Chelsea Nguyen"
                                    className="rounded-2xl drop-shadow-lg w-32 h-32 sm:w-40 sm:h-40 md:w-46 md:h-46"
                                    whileHover={{ scale: 1.05, rotate: 2, cursor: "pointer" }}
                                />
                                </Link>
                            </Grid>
                            {/* Text */}
                            <Grid item xs={6}>
                                <motion.div className=" flex justify-end flex-col"
                                >
                                    <svg className="mr-[75%]" width="80" height="40" viewBox="0 0 160 81" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M156.5 77.0683C154.41 74.8293 159.5 47.9643 124.573 31.436C112.186 27.8405 98.4507 27.7896 86.2908 31.9493C82.3414 33.3003 75.4181 36.8744 77.6474 42.2157C78.6654 44.6548 81.0524 45.8653 83.3122 47.0145C84.8813 47.8125 87.2686 48.6898 89.0055 47.9643C91.6025 46.8795 93.3429 43.7303 93.4438 41.0234C93.5767 37.4546 91.4058 34.0529 89.1138 31.4474C87.3829 29.4798 85.3765 27.8624 83.1231 26.5118C78.1125 23.5086 72.5744 21.0674 66.8886 19.7329C61.228 18.4043 55.2856 18.077 49.5198 18.5148C42.1294 19.076 35.4292 21.5196 28.8482 24.7135C22.9236 27.5887 17.2903 30.9925 11.43 33.9847C10.6607 34.3775 9.86975 34.7294 9.1074 35.1352C9.09475 35.1419 8.21484 35.5192 8.45132 35.7966C9.08297 36.5375 11.0659 36.9922 11.8847 37.2908C16.2038 38.8662 20.4808 40.488 24.6644 42.409C27.6769 43.7922 30.6364 45.2918 33.5077 46.9496C34.0948 47.2885 32.272 46.4532 32.1737 46.4105C25.6681 43.5896 18.9151 41.612 12.0745 39.7891C10.8699 39.4681 8.80368 38.923 7.55391 38.6175C6.48865 38.3571 5.12525 38.2561 4.09873 37.817C3.42585 37.5291 5.97025 35.1791 6.12197 34.9911C9.12405 31.2712 11.4965 27.0298 13.8929 22.9111C16.408 18.5885 18.4498 14.2139 20.1097 9.49715C20.3421 8.83669 21.371 3.95918 22.4476 4.27169"
                                            stroke="black" stroke-width="7" strokeLinecap="round"/>
                                    </svg>
                                    <Typography
                                    variant="h2"
                                    sx={{
                                        fontFamily: 'Satoshi Bold',
                                        fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.2rem" },
                                        marginBottom: '-4px',
                                        lineHeight: { xs: 1.8, sm: 2, md: 2.2, lg: 2.2 }
                                    }}
                                    className="tracking-tight text-color282523 text-left"
                                    >
                                    Chelsea Nguyen
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color:"#81807C",
                                            fontFamily: 'Satoshi Medium',
                                            fontSize:{ xs: "1.0rem", sm: "1.0rem", md: "1.0rem" },
                                            lineHeight: { xs: 1.1, sm: 1.2, md: 1.2, lg: 1.3 }
                                        }}
                                        className="font-dm-sans-medium text-left"
                                        >
                                        Student at UF majoring in Computer Science and minoring in Digital Arts & Sciences
                                    </Typography>
                                    </motion.div>
                            </Grid>
                        </Grid>
                        </Grid>

                        {/* Clarissa */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Grid container spacing={2} alignItems="center">
                            {/* Photo */}
                            <Grid item xs={6}>
                                <Link
                                component="a"
                                href="https://www.linkedin.com/in/clarissa-cheung-054035187/"
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                <motion.img
                                    src="/static/images/clarissa-cheung.jpg"
                                    alt="Clarissa Cheung"
                                    className="rounded-2xl drop-shadow-lg w-32 h-32 sm:w-40 sm:h-40 md:w-46 md:h-46"
                                    whileHover={{ scale: 1.05, rotate: 2, cursor: "pointer" }}
                                />

                                </Link>
                            </Grid>
                            {/* Text */}
                            <Grid item xs={6}>
                                <motion.div className=" flex justify-end flex-col"
                                >
                                    <svg className="mr-[75%]" width="80" height="40" viewBox="0 0 160 81" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M156.5 77.0683C154.41 74.8293 159.5 47.9643 124.573 31.436C112.186 27.8405 98.4507 27.7896 86.2908 31.9493C82.3414 33.3003 75.4181 36.8744 77.6474 42.2157C78.6654 44.6548 81.0524 45.8653 83.3122 47.0145C84.8813 47.8125 87.2686 48.6898 89.0055 47.9643C91.6025 46.8795 93.3429 43.7303 93.4438 41.0234C93.5767 37.4546 91.4058 34.0529 89.1138 31.4474C87.3829 29.4798 85.3765 27.8624 83.1231 26.5118C78.1125 23.5086 72.5744 21.0674 66.8886 19.7329C61.228 18.4043 55.2856 18.077 49.5198 18.5148C42.1294 19.076 35.4292 21.5196 28.8482 24.7135C22.9236 27.5887 17.2903 30.9925 11.43 33.9847C10.6607 34.3775 9.86975 34.7294 9.1074 35.1352C9.09475 35.1419 8.21484 35.5192 8.45132 35.7966C9.08297 36.5375 11.0659 36.9922 11.8847 37.2908C16.2038 38.8662 20.4808 40.488 24.6644 42.409C27.6769 43.7922 30.6364 45.2918 33.5077 46.9496C34.0948 47.2885 32.272 46.4532 32.1737 46.4105C25.6681 43.5896 18.9151 41.612 12.0745 39.7891C10.8699 39.4681 8.80368 38.923 7.55391 38.6175C6.48865 38.3571 5.12525 38.2561 4.09873 37.817C3.42585 37.5291 5.97025 35.1791 6.12197 34.9911C9.12405 31.2712 11.4965 27.0298 13.8929 22.9111C16.408 18.5885 18.4498 14.2139 20.1097 9.49715C20.3421 8.83669 21.371 3.95918 22.4476 4.27169"
                                            stroke="black" stroke-width="7" strokeLinecap="round"/>
                                    </svg>
                                    <Typography
                                    variant="h2"
                                    sx={{
                                        fontFamily: 'Satoshi Bold',
                                        fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.2rem" },
                                        marginBottom: '-4px',
                                        lineHeight: { xs: 1.8, sm: 2, md: 2.2, lg: 2.2 }
                                    }}
                                    className="tracking-tight text-color282523 text-left"
                                    >
                                    Clarissa Cheung
                                    </Typography>
                                    <Typography
                                        sx={{
                                            color:"#81807C",
                                            fontFamily: 'Satoshi Medium',
                                            fontSize:{ xs: "1.0rem", sm: "1.0rem", md: "1.0rem" },
                                            lineHeight: { xs: 1.1, sm: 1.2, md: 1.2, lg: 1.3 }
                                        }}
                                        className="font-dm-sans-medium text-left"
                                        >
                                        Student at UF majoring in Computer Science and minoring in Economics
                                    </Typography>
                                </motion.div>
                            </Grid>
                            </Grid>
                            
                        </Grid>
                        
                    </Grid>
                </Grid>

                <Box 
                 sx={{
                    height: '10vh',
                 }}
                 className="h-screen w-full flex justify-center bg-colorF3F1EA" >
                    {/*  honorable mention */}
                    <Grid item xs={12}>
                        <motion.div
                            initial = "hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                            <motion.p
                                style={{
                                    fontFamily: 'Satoshi Medium',
                                    fontSize: '1.2rem',
                                    whiteSpace: 'normal',   
                                    wordBreak: 'break-word',
                                    width: '100%', 
                                    textWrap: 'balance',
                                }}
                                className="text-color282523 text-center leading-tight"
                                variants={itemVariants}
                                transition={{ delay: 1.45 }}
                                >
                                Honorable developers from the original WiNGHacks project team:
                                <br/>
                                <span className="font-dm-sans-black tracking-tight"> Xiaguo Jia</span>,
                                <span className="font-dm-sans-black tracking-tight"> Sara Smith</span>
                            </motion.p>

                        </motion.div>
                    </Grid>
            </Box>

            {/* ---------- getting started section ---------- */}
            <Box id="getting-started"
                 sx={{
                    minHeight: '100vh',
                 }}
                 className="h-screen w-full bg-colorF3F1EA flex justify-center items-center flex-col" >
                <Stack direction={'column'} spacing={-0.5} style={{marginBottom:'40px'}}>
                    <motion.p
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        variants = {itemVariants}
                        transition = {{delay: 0.5}}
                              style={{fontFamily:'Satoshi Bold', color: 'black', fontSize: '3.2rem', letterSpacing: '-0.5px',userSelect: 'none', textAlign:'center'}}>
                        Okay, enough about us.
                    </motion.p>
                    <motion.p
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                        variants = {itemVariants}
                              style={{fontFamily:'DM Sans', color: '#81807C', fontSize: '2rem', letterSpacing: '-0.5px',userSelect: 'none',textAlign:'center'}}>
                        Ready to get started?
                    </motion.p>
                </Stack>
                <motion.div
                    initial="hidden"
                    whileInView='visible'
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    variants = {itemVariants}>
                    <Button color='inherit' href='/sign-up' sx={{fontSize: '2.5rem', fontFamily: 'Satoshi Bold', textTransform: 'none', backgroundColor: '#2850d9', paddingX: 5.5,borderRadius: '50px', color:  'white', letterSpacing: '-0.01px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05) rotate(-2deg)'}, boxShadow: 4, display: 'flex', alignItems: 'center', gap: 1}}>
                        Get Started
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                        </svg>
                    </Button>
                </motion.div>
            </Box>
        </Box>
        </Box>
    );
}