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

const pages = ['Why WiNG.it', 'About Us', 'Get Started'];
export default function HomePage() {

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring", damping: 20, stiffness: 300 },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
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
                                            About Us
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
                                    About Us
                                </Link>
                            </Button>
                            <Button 
                                color='inherit' 
                                href='/dashboard' 
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

        {/* container*/}
        <Box sx={{ minHeight: '100dvh' }}>

            {/* ---------- home page ----------  */}
            <Box id="home-page" className="main-home-page-container">

                {/*  main content box  */}
                <Grid container
                    spacing={5}
                    direction={"column"}
                    width={'80%'}
                    sx={{px: "5%"}}>

                    {/*  title/slogan  */}
                    <Grid item xs>
                        <Stack direction={"column"} spacing={3}>
                            <motion.div
                                className="main-home-page-title-container"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={staggerContainer}
                            >
                                <motion.h1 variants={itemVariants} className="main-home-page-title-text">
                                    Master your interviews with
                                    <span className="gradient-text"> AI-powered</span> practice
                                </motion.h1>
                                
                                <motion.div 
                                    variants={itemVariants}
                                    className="floating-elements"
                                >
                                    <div className="floating-element element-1">💼</div>
                                    <div className="floating-element element-2">🎯</div>
                                    <div className="floating-element element-3">⭐</div>
                                </motion.div>
                            </motion.div>

                            {/* description */}
                            <motion.div 
                                className="main-home-page-description-container"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                            >
                                <motion.p
                                    variants={itemVariants}
                                    transition={{ delay: 0.2 }}
                                    className="description-text"
                                >
                                    Transform your career preparation with realistic interview simulations, 
                                    personalized feedback, and AI-driven insights. Practice makes perfect – and it'&apos;'s completely free.
                                </motion.p>
                            </motion.div>

                            {/* CTA buttons */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={staggerContainer}
                                className="cta-buttons-container"
                            >
                                <motion.div variants={itemVariants}>
                                    <Button
                                        href="/dashboard"
                                        className="primary-cta-button"
                                        size="large"
                                    >
                                        Start Practicing
                                        <svg className="button-arrow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </Button>
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <Button
                                        className="secondary-cta-button"
                                        size="large"
                                        onClick={() => {
                                            const element = document.getElementById('why-wing-it');
                                            element?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        Learn More
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </Stack>
                    </Grid>

                    {/* ---------- feature cards ---------- */}
                    <Grid item xs>
                        <motion.div 
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            <Grid
                                container
                                spacing={3}
                                columns={3}
                                rows={1}
                                direction={{xs: "column", s: "column", md: "row", lg: "row"}}
                                wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                                sx={{ alignItems: 'stretch' }}
                            >

                                {/* career prep tools card */}
                                <Grid xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                    <motion.div
                                        variants={itemVariants}
                                        style={{ width: '100%', display: 'flex' }}
                                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    >
                                        <Card className="main-home-page-card modern-card">
                                            <div className="card-icon-container orange-gradient">
                                                <FaPencilRuler color={'#E3632E'} size={24} />
                                            </div>
                                            <Typography variant="h5" className="main-home-page-card-feature-title">
                                                Interactive Simulations
                                            </Typography>
                                            <Typography className="main-home-page-card-feature-description">
                                                Practice with AI-powered interview scenarios that adapt to your responses and provide real-time feedback.
                                            </Typography>
                                            <div className="card-hover-effect"></div>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* saving saves card */}
                                <Grid xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                    <motion.div
                                        variants={itemVariants}
                                        style={{ width: '100%', display: 'flex' }}
                                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    >
                                        <Card className="main-home-page-card modern-card">
                                            <div className="card-icon-container blue-gradient">
                                                <IoDocumentText color={'#2a6ed5'} size={28} />
                                            </div>
                                            <Typography variant="h5" className="main-home-page-card-feature-title">
                                                Smart Analytics
                                            </Typography>
                                            <Typography className="main-home-page-card-feature-description">
                                                Track your progress with detailed transcripts, performance metrics, and personalized improvement suggestions.
                                            </Typography>
                                            <div className="card-hover-effect"></div>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* personalized feedback card */}
                                <Grid xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                                    <motion.div
                                        variants={itemVariants}
                                        style={{ width: '100%', display: 'flex' }}
                                        whileHover={{ y: -8, transition: { duration: 0.3 } }}
                                    >
                                        <Card className="main-home-page-card modern-card">
                                            <div className="card-icon-container green-gradient">
                                                <BiSolidMessageCheck color={'#559437'} size={28} />
                                            </div>
                                            <Typography variant="h5" className="main-home-page-card-feature-title">
                                                AI-Powered Feedback
                                            </Typography>
                                            <Typography className="main-home-page-card-feature-description">
                                                Receive instant, actionable feedback on your communication style, content quality, and interview performance.
                                            </Typography>
                                            <div className="card-hover-effect"></div>
                                        </Card>
                                    </motion.div>
                                </Grid>
                            </Grid>
                        </motion.div>
                    </Grid>

                </Grid>
            </Box>

            {/* ---------- why wing it ----------*/}
            <Box id="why-wing-it" className="why-wing-it-section-container">
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
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <motion.div 
                            style={{padding: '2.5%'}}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >

                            {/* title */}
                            <motion.h2
                                variants={itemVariants}
                                className="why-wing-it-title"
                            >
                                Built by students, for students 🎓
                            </motion.h2>

                            {/* description*/}
                            <Stack spacing={3} style={{padding: '30px'}}>
                                <motion.p
                                    variants={itemVariants}
                                    className="why-wing-it-description-text"
                                >
                                    We'&apos;'ve been in your shoes – stressing about interviews, lacking access to quality practice tools, 
                                    and struggling to get meaningful feedback on our performance.
                                </motion.p>
                                <motion.div
                                    variants={itemVariants}
                                    className="highlight-box"
                                >
                                    <p className="why-wing-it-description-text highlight-text">
                                        Our mission: <span className="bold-highlight">Making career preparation accessible for everyone.</span> 
                                        No subscriptions, no hidden fees, just powerful tools to help you succeed.
                                    </p>
                                </motion.div>
                                <motion.p
                                    variants={itemVariants}
                                    className="why-wing-it-description-text"
                                >
                                    Join thousands of students who'&apos;'ve already improved their interview skills with WiNG.it. 
                                    Because your future shouldn'&apos;'t be limited by access to resources.
                                </motion.p>
                            </Stack>
                        </motion.div>
                    </Grid>

                </Grid>
            </Box>

            {/*  ---------- about us ----------  */}
            <Box id="about-us" className="about-us-section-container">
                <Grid container
                    direction={"row"}
                    width={{ xs: '98%', sm: '90%', md: '80%' }}
                    sx={{ paddingLeft: { xs: '2%', sm: '5%' }, paddingRight: { xs: '2%', sm: '5%' } }}>

                    {/* title  */}
                    <Stack spacing={2} direction="column">
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                        >
                        <Typography className="about-us-section-title">
                            Meet the team behind WiNG.it
                        </Typography>
                        </motion.div>
                    </Grid>

                    {/* description */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                    >

                        <Stack spacing={4} direction={"column"}>
                            <motion.div variants={itemVariants} className="story-card">
                                <p className="about-us-section-description-text">
                                    Our journey started at the
                                    <span className="highlight-span"> University of Florida'&apos;'s 🐊</span> inaugural
                                    <span className="highlight-span"> WiNGHacks Hackathon 🪽</span> – a celebration of innovation by 
                                    women, non-binary, and gender minorities in tech.
                                </p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="achievement-card">
                                <div className="achievement-badge">🏆</div>
                                <p className="about-us-section-description-text">
                                    We'&apos;'re proud to have won <span className="highlight-span">first place</span> for best project by 
                                    first-time hackathoners and caught the attention of 
                                    <span className="highlight-span"> UF Professor Amanpreet Kapoor 💻</span>, who believed in our vision 
                                    enough to support our continued development.
                                </p>
                            </motion.div>
                            <motion.div variants={itemVariants} className="mission-card">
                                <p className="about-us-section-description-text">
                                    Today, WiNG.it continues to evolve as a comprehensive career preparation platform, 
                                    helping students worldwide build confidence, improve their skills, and land their dream opportunities.
                                </p>
                            </motion.div>
                        </Stack>
                    </motion.div>
                    </Stack>
                </Grid>
            </Box>

            {/*  developer section  */}
            <Grid className="developer-section-container">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                <Grid container
                    spacing={4}
                    alignItems="center"
                    justifyContent="center"
                    direction={{ xs: 'column', sm: 'column', md: 'row', lg: 'row' }}
                    width={{ xs: '98%', sm: '90%', md: '80%', lg: '80%' }}
                    wrap={{ xs: "wrap", sm: "wrap", md: "nowrap", lg: "nowrap" }}
                    sx={{ mx: 'auto', px: { xs: '2%', sm: '5%', lg: '8%' } }}>

                        {/* Rachel */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <motion.div variants={itemVariants}>
                                <Grid container spacing={2} direction="column" alignItems="center">
                                    {/* Photo */}
                                    <Grid item>
                                        <Link
                                        component="a"
                                        href="https://www.linkedin.com/in/rachel-pu-ufl/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                        <motion.div className="developer-card">
                                            <motion.img
                                                src="/static/images/rachel%20pu%20image.png"
                                                alt="Rachel Pu"
                                                className="developer-image"
                                                whileHover={{ scale: 1.05, rotate: 2, cursor: "pointer" }}
                                            />
                                            <div className="developer-overlay">
                                                <span>View LinkedIn →</span>
                                            </div>
                                        </motion.div>
                                        </Link>
                                    </Grid>
                                    {/* Text */}
                                    <Grid item>
                                        <Typography variant="h2" className="developer-section-developer-name">
                                            Rachel Pu
                                        </Typography>
                                        <Typography className="developer-section-developer-description">
                                            Computer Science & Digital Arts Sciences @ UF
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        </Grid>

                        {/* Chelsea */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <motion.div variants={itemVariants}>
                                <Grid container spacing={2} direction="column" alignItems="center">
                                    {/* Photo */}
                                    <Grid item>
                                        <Link
                                        component="a"
                                        href="https://www.linkedin.com/in/chelseaqnguyen/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                        <motion.div className="developer-card">
                                            <motion.img
                                                src="/static/images/chelsea nguyen image.png"
                                                alt="Chelsea Nguyen"
                                                className="developer-image"
                                                whileHover={{ scale: 1.05, rotate: 2, cursor: "pointer" }}
                                            />
                                            <div className="developer-overlay">
                                                <span>View LinkedIn →</span>
                                            </div>
                                        </motion.div>
                                        </Link>
                                    </Grid>
                                    {/* Text */}
                                    <Grid item>
                                        <Typography variant="h2" className="developer-section-developer-name">
                                            Chelsea Nguyen
                                        </Typography>
                                        <Typography className="developer-section-developer-description">
                                            Computer Science & Digital Arts Sciences @ UF
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        </Grid>

                        {/* Clarissa */}
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                            <motion.div variants={itemVariants}>
                                <Grid container spacing={2} direction="column" alignItems="center">
                                    {/* Photo */}
                                    <Grid item>
                                        <Link
                                        component="a"
                                        href="https://www.linkedin.com/in/clarissa-cheung-054035187/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        >
                                        <motion.div className="developer-card">
                                            <motion.img
                                                src="/static/images/clarissa-cheung.jpg"
                                                alt="Clarissa Cheung"
                                                className="developer-image"
                                                whileHover={{ scale: 1.05, rotate: 2, cursor: "pointer" }}
                                            />
                                            <div className="developer-overlay">
                                                <span>View LinkedIn →</span>
                                            </div>
                                        </motion.div>
                                        </Link>
                                    </Grid>
                                    {/* Text */}
                                    <Grid item>
                                        <Typography variant="h2" className="developer-section-developer-name">
                                            Clarissa Cheung
                                        </Typography>
                                        <Typography className="developer-section-developer-description">
                                            Computer Science & Economics @ UF
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </motion.div>
                        </Grid>
                        
                    </Grid>
                    </motion.div>
                </Grid>

            {/*  honorable mention */}
                <Box className="honorable-mentions-section-container">
                    <Grid item xs={12}>
                        <motion.div
                            initial = "hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={itemVariants}
                        >
                            <motion.p className="honorable-mentions-section-text">
                                Special thanks to our original WiNGHacks team members:
                                <br/>
                                <span className="highlight-span"> Xiaguo Jia</span> and
                                <span className="highlight-span"> Sara Smith</span>
                            </motion.p>

                        </motion.div>
                    </Grid>
            </Box>

            {/* ---------- getting started section ---------- */}
            <Box id="getting-started" className="getting-started-section-container">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="getting-started-content"
                >
                    <Stack direction={'column'} spacing={2} alignItems="center">
                        <motion.h2 variants={itemVariants} className="get-started-title">
                            Ready to ace your next interview?
                        </motion.h2>
                        <motion.p variants={itemVariants} className="get-started-subtitle">
                            Join us to improve your interview skills with WiNG.it
                        </motion.p>
                        <motion.div variants={itemVariants} className="final-cta-container">
                            <Button 
                                color='inherit' 
                                href='/dashboard'
                                className="final-cta-button"
                                size="large"
                            >
                                Start Your Journey
                                <svg className="button-arrow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Button>
                            <div className="cta-subtext">
                                <span>✨ Always free • No credit card required • Get started in 30 seconds</span>
                            </div>
                        </motion.div>
                    </Stack>
                </motion.div>
            </Box>
        </Box>
        </Box>
    );
}