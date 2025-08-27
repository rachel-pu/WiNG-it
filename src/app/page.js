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
                            <Grid
                                container
                                spacing={2}
                                columns={3}
                                rows={1}
                                direction={{xs: "column", s: "column", md: "row", lg: "row"}}
                                wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                                sx={{ alignItems: 'stretch' }} // This makes all grid items equal height
                            >

                                {/* career prep tools card */}
                                <Grid xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                    <motion.div
                                        variants={itemVariants}
                                        transition={{ delay: 0.4 }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
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
                                <Grid xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                    <motion.div
                                        variants={itemVariants}
                                        transition={{ delay: 0.6 }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
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
                                <Grid xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                    <motion.div
                                        variants={itemVariants}
                                        transition={{ delay: 0.8 }}
                                        style={{ width: '100%', display: 'flex' }}
                                    >
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
                className="why-wing-it-section-container">
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
                                className="why-wing-it-title">
                                We created the quality, free tools we needed.️
                            </motion.h2>

                            {/* description*/}
                            <Stack spacing={2}
                                   style={{padding: '30px'}}>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.8 }}
                                    className="why-wing-it-description-text"
                                >
                                    As students, we know interviewing and networking can be hard. Like, really hard. And unfortunately, there are close to zero good, free, and
                                    useful career preparation tools out there.
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.95 }}
                                    className="why-wing-it-description-text">
                                    Our goal? <span
                                    style = {{fontFamily: 'DM Sans Bold', color: '#000000', letterSpacing: '-0.5px'}}>Making career preparation more accessible for everybody. </span> No paywall.
                                    No fees. Just practicing for your upcoming opportunities and needs.
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 1.1}}
                                    className="why-wing-it-description-text">
                                    Oh, and as a bonus, making it fun. Because who said preparing for your future can&apos;t be fun?
                                </motion.p>
                            </Stack>
                        </motion.div>
                    </Grid>

                    {/* --- replace this part with gif of a demo..? --- */}
                    {/*<Grid item xs={12} sm={6} md={4} lg={3} style={{backgroundColor: '#C1D6E6', borderRadius: '30px'}}>*/}
                    {/*    <motion.div*/}
                    {/*        initial="hidden"*/}
                    {/*        whileInView="visible"*/}
                    {/*        viewport={{ once: true }}*/}
                    {/*        variants={itemVariants}*/}
                    {/*        transition={{ delay: 1.3 }}*/}
                    {/*        >*/}
                    {/*        <Image*/}
                    {/*            src={'/static/images/behavioral.png'}*/}
                    {/*            alt={"Why WiNG.it image"}*/}
                    {/*            width={500}*/}
                    {/*            height={500}*/}
                    {/*        />*/}
                    {/*    </motion.div>*/}
                    {/*</Grid>*/}


                </Grid>
            </Box>

            {/*  ---------- about us ----------  */}
            <Box id="about-us"
                 className="about-us-section-container" >
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
                        <Typography className="about-us-section-title">
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
                            <motion.p className="about-us-section-description-text"
                                      variants = {itemVariants}
                                      transition={{ delay: 0.75 }}>
                                Our project was created for the
                                <span className="font-dm-sans-black tracking-tight"> University of Florida’s 🐊</span> first annual
                                <span className="font-dm-sans-black tracking-tight"> WiNGHacks Hackathon 🪽</span>, a hackathon designed to empower
                                women, non-binary, and gender minorities by providing them with a platform to innovate and create. Our project won
                                <span className="font-dm-sans-black tracking-tight"> first place 🏆</span> for best project created by first time hackathoners and was picked up by
                                <span className="font-dm-sans-black tracking-tight"> UF Professor Amanpreet Kapoor  💻</span> to continue being built for improvement.
                            </motion.p>
                            <motion.p className="about-us-section-description-text"
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
                className="developer-section-container">
                <motion.div initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants = {itemVariants}
                            transition={{ delay: 1.25 }}>
                <Grid container
                    spacing={3}
                    alignItems="center"
                    direction={{ xs: 'row', md: 'row', lg: 'row' }}
                    width={{ xs: '98%', sm: '90%', md: '80%', lg: '80%' }}
                    wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                    sx={{ mx: 'auto', pl: '250px', px: { xs: '2%', sm: '5%', lg: '8%' } }}>

                        {/* Rachel */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <Grid container spacing={2}>
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
                                    <Typography
                                    variant="h2"
                                    className="developer-section-developer-name"
                                    >
                                    Rachel Pu
                                    </Typography>
                                    <Typography
                                    className="developer-section-developer-description">
                                        Student at UF majoring in Computer Science and minoring in Digital Arts & Sciences
                                    </Typography>
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
                                    <Typography
                                    variant="h2"
                                    className="developer-section-developer-name"
                                    >
                                    Chelsea Nguyen
                                    </Typography>
                                    <Typography
                                        className="developer-section-developer-description"
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
                                    <Typography
                                    variant="h2"
                                    className="developer-section-developer-name"
                                    >
                                    Clarissa Cheung
                                    </Typography>
                                    <Typography
                                        className="developer-section-developer-description">
                                        Student at UF majoring in Computer Science and minoring in Economics
                                    </Typography>
                                </motion.div>
                            </Grid>
                            </Grid>
                            
                        </Grid>
                        
                    </Grid>
                    </motion.div>
                </Grid>
            {/*  honorable mention */}
                <Box 
                 sx={{
                    height: '10vh',
                 }}
                 className="honorable-mentions-section-container">
                    <Grid item xs={12}>
                        <motion.div
                            initial = "hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                            <motion.p
                                className="honorable-mentions-section-text"
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
                 className="getting-started-section-container" >
                <Stack direction={'column'} spacing={-0.5} style={{marginBottom:'40px'}}>
                    <motion.p
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        variants = {itemVariants}
                        transition = {{delay: 0.5}}
                        className="get-started-title">
                        Okay, enough about us.
                    </motion.p>
                    <motion.p
                        initial="hidden"
                        whileInView='visible'
                        viewport={{ once: true }}
                        transition={{ delay: 0.7 }}
                        variants = {itemVariants}
                        className="get-started-ready-text">
                        Ready to get started?
                    </motion.p>
                </Stack>
                <motion.div
                    initial="hidden"
                    whileInView='visible'
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    variants = {itemVariants}>
                    <Button color='inherit' href='/sign-up'
                            className="get-started-button">                        Get Started
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