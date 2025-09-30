"use client";
import React, { useState, useEffect } from "react";
import {motion, inView, animate, useReducedMotion} from "framer-motion";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import {Typography} from "@mui/material";
import Stack from '@mui/material/Stack';
import {Button} from "@mui/material";
import Card from '@mui/material/Card';
import { FaPencilRuler } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { BiSolidMessageCheck } from "react-icons/bi";
import HomePageNavbar from "../../components/HomePageNavbar";
import "./HomePage.css";

const pages = ['Why WiNG.it', 'Our Story', 'Get Started'];
export default function HomePage() {
    const [isScrolling, setIsScrolling] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    // Scroll detection to pause heavy animations during fast scroll
    useEffect(() => {
        let scrollTimer;
        const handleScroll = () => {
            setIsScrolling(true);
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => setIsScrolling(false), 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimer);
        };
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: shouldReduceMotion ? "tween" : "spring",
                damping: 25,
                stiffness: 200,
                duration: shouldReduceMotion ? 0.3 : undefined
            }
        }
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0.05 : 0.1
            }
        }
    };
    return (
        <Box>
        <HomePageNavbar/>

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
                                viewport={{ once: true, margin: "-10%" }}
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
                                viewport={{ once: true, margin: "-5%" }}
                            >
                                <motion.p
                                    variants={itemVariants}
                                    transition={{ delay: 0.2 }}
                                    className="description-text"
                                >
                                    Transform your career preparation with realistic interview simulations, 
                                    personalized feedback, and AI-driven insights. Practice makes perfect – and it &apos;s completely free.
                                </motion.p>
                            </motion.div>

                            {/* CTA buttons */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-5%" }}
                                variants={staggerContainer}
                                className="cta-buttons-container"
                            >
                                <motion.div variants={itemVariants}>
                                    <Button
                                        // href="/sign-up"
                                        href = '/dashboard'
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
                            viewport={{ once: true, margin: "-15%" }}
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
                                        whileHover={!isScrolling ? { y: -8, transition: { duration: 0.3 } } : {}}
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
                                        whileHover={!isScrolling ? { y: -8, transition: { duration: 0.3 } } : {}}
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
                                        whileHover={!isScrolling ? { y: -8, transition: { duration: 0.3 } } : {}}
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
    <Box
        id="why-wing-it"
        className="student-section-container"
        sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #2a2a3e 0%, #26314e 50%, #1f4470 100%)',
            padding: { xs: '4rem 1rem', md: '6rem 2rem' }
        }}
    >

        <Box sx={{ maxWidth: '1200px', width: '100%', zIndex: 2, position: 'relative', margin: '0 auto' }}>
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-10%" }}
                variants={staggerContainer}
            >
                {/* Main Header */}
                <Box sx={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div variants={itemVariants}>
                        <Typography
                            sx={{
                                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.2rem' },
                                fontWeight: 900,
                                fontFamily: 'Satoshi Black, sans-serif',
                                color: 'white',
                                marginBottom: '1rem',
                                letterSpacing: '-0.02em',
                                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                background: 'linear-gradient(135deg, #ffffff 0%, #a8c7ed 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}
                        >
                            Built by students, for students
                        </Typography>
                    </motion.div>
                </Box>

                {/* Content Grid */}
                <Grid container spacing={4} alignItems="stretch" justifyContent="center">
                    {/* Left side - Our Story */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div variants={itemVariants} style={{ height: '100%' }}>
                            <Box
                                sx={{
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '24px',
                                    padding: '2.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                {/* Gradient overlay */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '4px',
                                        background: 'linear-gradient(90deg, #667eea, #764ba2, #feca57)',
                                        borderRadius: '24px 24px 0 0'
                                    }}
                                />

                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        marginBottom: '1rem',
                                        display: 'block'
                                    }}
                                >
                                    OUR STORY
                                </Typography>

                                <Typography
                                    sx={{
                                        color: 'white',
                                        fontSize: '1.3rem',
                                        fontWeight: 600,
                                        lineHeight: 1.5,
                                        marginBottom: '1.5rem',
                                        fontFamily: 'Satoshi Bold, sans-serif'
                                    }}
                                >
                                    We've been in your shoes
                                </Typography>

                                <Typography
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        fontFamily: 'DM Sans, sans-serif',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    Stressing about interviews, lacking access to quality practice tools,
                                    and struggling to get meaningful feedback. That's why we created WiNG.it.
                                </Typography>

                                <Typography
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '1rem',
                                        lineHeight: 1.6,
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontStyle: 'italic'
                                    }}
                                >
                                    We understand the challenges because we've faced them ourselves.
                                    Every feature in WiNG.it comes from real student experiences and needs.
                                </Typography>
                            </Box>
                        </motion.div>
                    </Grid>

                    {/* Right side - Our Mission */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <motion.div variants={itemVariants} style={{ height: '100%' }}>
                            <Box
                                sx={{
                                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                                    backdropFilter: 'blur(20px)',
                                    borderRadius: '24px',
                                    padding: '2.5rem',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
                                    position: 'relative',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <Typography
                                    variant="overline"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.6)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        letterSpacing: '0.1em',
                                        marginBottom: '1rem',
                                        display: 'block'
                                    }}
                                >
                                    OUR MISSION
                                </Typography>

                                <Typography
                                    sx={{
                                        color: 'white',
                                        fontSize: '1.4rem',
                                        fontWeight: 700,
                                        lineHeight: 1.3,
                                        fontFamily: 'Satoshi Bold, sans-serif',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    Making career preparation accessible for everyone
                                </Typography>

                                <Typography
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.85)',
                                        fontSize: '1rem',
                                        lineHeight: 1.5,
                                        fontFamily: 'DM Sans, sans-serif',
                                        marginBottom: '1.5rem'
                                    }}
                                >
                                    We're building a comprehensive platform where students can practice, learn, and grow.
                                    No expensive coaching, no gatekeeping—just the tools you need to succeed.
                                </Typography>

                                <Typography
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.9)',
                                        fontSize: '1rem',
                                        lineHeight: 1.5,
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontStyle: 'italic'
                                    }}
                                >
                                    Every student deserves the chance to showcase their potential.
                                </Typography>
                            </Box>
                        </motion.div>
                    </Grid>
                </Grid>

                {/* What's Next Section */}
                <motion.div variants={itemVariants}>
                    <Box sx={{ textAlign: 'center', marginTop: '4rem' }}>
                        <Typography
                            sx={{
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '1.2rem',
                                marginBottom: '2rem',
                                fontFamily: 'Satoshi Bold, sans-serif'
                            }}
                        >
                            What's next for WiNG.it?
                        </Typography>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '2rem',
                            maxWidth: '800px',
                            margin: '0 auto'
                        }}>
                            {[
                                { icon: '🎯', title: 'Networking', desc: 'Connect with peers and build your professional network' },
                                { icon: '💬', title: 'Smarter Feedback', desc: 'Expanding AI-powered insights for deeper performance analysis' },
                                { icon: '⚡', title: 'New Tools', desc: 'Expand your career preparation toolkit' }
                            ].map((goal, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        backdropFilter: 'blur(10px)',
                                        borderRadius: '20px',
                                        padding: '2rem 1.5rem',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        textAlign: 'center',
                                        cursor: 'default'
                                    }}
                                >
                                    <Box sx={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                                        {goal.icon}
                                    </Box>
                                    <Typography sx={{
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '1.1rem',
                                        marginBottom: '0.8rem',
                                        fontFamily: 'Satoshi Bold, sans-serif'
                                    }}>
                                        {goal.title}
                                    </Typography>
                                    <Typography sx={{
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        fontSize: '0.9rem',
                                        lineHeight: 1.4,
                                        fontFamily: 'DM Sans, sans-serif'
                                    }}>
                                        {goal.desc}
                                    </Typography>
                                </div>
                            ))}
                        </Box>
                    </Box>
                </motion.div>
            </motion.div>
        </Box>
    </Box>

{/*  ---------- Our Story ----------  */}
<Box 
    id="about-us" 
    sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #F3F1EA 0%, #E8E6D9 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: { xs: '3rem 1rem', md: '4rem 2rem' },
        position: 'relative',
        overflow: 'hidden'
    }}
>
    {/* Header Section */}
    <Box sx={{ textAlign: 'center', marginBottom: '4rem' }}>
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={itemVariants}
        >
            <Typography 
                sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 900,
                    fontFamily: 'Satoshi Black, sans-serif',
                    background: 'linear-gradient(135deg, #1a202c 0%, #2850d9 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '1rem',
                    letterSpacing: '-0.02em'
                }}
            >
                Our Story
            </Typography>
            <Typography 
                sx={{
                    fontSize: '1.2rem',
                    color: '#64748b',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                    fontFamily: 'DM Sans, sans-serif'
                }}
            >
                From hackathon winners to career platform builders
            </Typography>
        </motion.div>
    </Box>

    {/* Story Section - COMPLETELY REDESIGNED */}
    <Box sx={{ maxWidth: '900px', width: '100%', margin: '0 auto', marginBottom: '4rem' }}>
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
        >
            <Box 
                sx={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: { xs: '2rem 1.5rem', md: '2.5rem 3rem' },
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography 
                        sx={{
                            fontSize: { xs: '1.4rem', md: '1.6rem' },
                            fontWeight: 700,
                            color: '#1e293b',
                            marginBottom: '2rem',
                            textAlign: 'center',
                            fontFamily: 'Satoshi Bold, sans-serif'
                        }}
                    >
                        Our Journey
                    </Typography>

                    {/* Modern Timeline */}
                    <Box sx={{ position: 'relative' }}>
                        {/* Timeline line */}
                        <Box 
                            sx={{
                                position: 'absolute',
                                left: '20px',
                                top: '20px',
                                bottom: '20px',
                                width: '2px',
                                background: 'linear-gradient(to bottom, #ff6b6b, #ffd700, #667eea)',
                                display: { xs: 'none', md: 'block' }
                            }}
                        />

                        <Stack spacing={3}>
                            {/* Timeline Item 1 */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                    <Box 
                                        sx={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.25)',
                                            zIndex: 1,
                                            border: '3px solid white'
                                        }}
                                    >
                                        🐊
                                    </Box>
                                    <Box sx={{ flex: 1, paddingTop: '0.2rem' }}>
                                        <Typography 
                                            sx={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                marginBottom: '0.5rem',
                                                fontFamily: 'Satoshi Bold, sans-serif'
                                            }}
                                        >
                                            Started at UF&apos;s WiNGHacks
                                        </Typography>
                                        <Typography 
                                            sx={{
                                                color: '#64748b',
                                                fontSize: '1rem',
                                                lineHeight: 1.5,
                                                fontFamily: 'DM Sans, sans-serif',
                                                '& .highlight': {
                                                    color: '#2850d9',
                                                    fontWeight: 600,
                                                    fontFamily: 'DM Sans Bold, sans-serif'
                                                }
                                            }}
                                        >
                                            Our journey began at the <span className="highlight">University of Florida&apos;s inaugural WiNGHacks Hackathon</span> – celebrating innovation by women, non-binary, and gender minorities in tech.
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>

                            {/* Timeline Item 2 */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                    <Box 
                                        sx={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            background: 'linear-gradient(135deg, #ffd700, #ffb347)',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.25)',
                                            zIndex: 1,
                                            border: '3px solid white'
                                        }}
                                    >
                                        🏆
                                    </Box>
                                    <Box sx={{ flex: 1, paddingTop: '0.2rem' }}>
                                        <Typography 
                                            sx={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                marginBottom: '0.5rem',
                                                fontFamily: 'Satoshi Bold, sans-serif'
                                            }}
                                        >
                                            Won First Place
                                        </Typography>
                                        <Typography 
                                            sx={{
                                                color: '#64748b',
                                                fontSize: '1rem',
                                                lineHeight: 1.5,
                                                fontFamily: 'DM Sans, sans-serif',
                                                '& .highlight': {
                                                    color: '#2850d9',
                                                    fontWeight: 600,
                                                    fontFamily: 'DM Sans Bold, sans-serif'
                                                }
                                            }}
                                        >
                                            We won <span className="highlight">first place</span> for best project by first-time hackathoners and caught the attention of <span className="highlight">UF Professor Amanpreet Kapoor</span>, who supported our continued development.
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>

                            {/* Timeline Item 3 */}
                            <motion.div variants={itemVariants}>
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                                    <Box 
                                        sx={{
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.2rem',
                                            background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                            flexShrink: 0,
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)',
                                            zIndex: 1,
                                            border: '3px solid white'
                                        }}
                                    >
                                        🚀
                                    </Box>
                                    <Box sx={{ flex: 1, paddingTop: '0.2rem' }}>
                                        <Typography 
                                            sx={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: '#1e293b',
                                                marginBottom: '0.5rem',
                                                fontFamily: 'Satoshi Bold, sans-serif'
                                            }}
                                        >
                                            Building the Future
                                        </Typography>
                                        <Typography 
                                            sx={{
                                                color: '#64748b',
                                                fontSize: '1rem',
                                                lineHeight: 1.5,
                                                fontFamily: 'DM Sans, sans-serif',
                                                '& .highlight': {
                                                    color: '#2850d9',
                                                    fontWeight: 600,
                                                    fontFamily: 'DM Sans Bold, sans-serif'
                                                }
                                            }}
                                        >
                                            Today, it continues to evolve as a <span className="highlight">comprehensive career preparation platform</span>, helping students to build confidence and land opportunities.
                                        </Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </motion.div>
    </Box>

    {/* Team Section - Dedicated Space */}
    <Box sx={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
        >
            {/* Team Header */}
            <Box sx={{ textAlign: 'center', marginBottom: '3rem' }}>
                <motion.div variants={itemVariants}>
                    <Typography 
                        sx={{
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            fontWeight: 800,
                            color: '#1e293b',
                            marginBottom: '1rem',
                            fontFamily: 'Satoshi Black, sans-serif',
                            background: 'linear-gradient(135deg, #1e293b 0%, #2850d9 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            letterSpacing: '-0.05px'
                        }}
                    >
                        Meet Our Team
                    </Typography>
                    <Typography 
                        sx={{
                            color: '#64748b',
                            fontSize: '1.1rem',
                            fontFamily: 'DM Sans, sans-serif',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}
                    >
                        The passionate individuals dedicated to transforming career preparation
                    </Typography>
                </motion.div>
            </Box>

            {/* Team Cards */}
            <Box 
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(3, 1fr)' 
                    },
                    gap: '2rem',
                    alignItems: 'stretch'
                }}
            >
                {/* Rachel */}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} style={{ height: '100%' , cursor: 'pointer',}} onClick={() => {
                    window.location.href = "https://www.linkedin.com/in/rachel-pu-ufl/";
                }}>
                    <motion.div
                        whileHover={{ 
                            scale: 1.03, 
                            y: -8,
                            boxShadow: '0 20px 40px rgba(55, 85, 183, 0.2)'
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                            borderRadius: '24px',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        {/* Gradient overlay on hover */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(135deg, #2850d9, #667eea)',
                                borderRadius: '24px 24px 0 0'
                            }}
                        />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                                component="img"
                                src="/static/images/rachel%20pu%20image.png"
                                alt="Rachel Pu"
                                sx={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginBottom: '1.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Typography 
                                sx={{
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Satoshi Bold, sans-serif'
                                }}
                            >
                                Rachel Pu
                            </Typography>
                        </Box>
                        
                        <Typography 
                            sx={{
                                color: '#64748b',
                                fontSize: '0.9rem',
                                lineHeight: 1.4,
                                fontFamily: 'DM Sans Medium, sans-serif',
                                textAlign: 'center'
                            }}
                        >
                            Computer Science & Digital Arts Sciences @ UF
                        </Typography>
                    </motion.div>
                </motion.div>

                {/* Chelsea */}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} style={{ height: '100%' , cursor: 'pointer',}} onClick={() => {
                    window.location.href = "https://www.linkedin.com/in/chelseaqnguyen/";
                }}>
                    <motion.div
                        whileHover={{ 
                            scale: 1.03, 
                            y: -8,
                            boxShadow: '0 20px 40px rgba(173, 123, 47, 0.2)'
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                            borderRadius: '24px',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
                                borderRadius: '24px 24px 0 0'
                            }}
                        />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                                component="img"
                                src="/static/images/chelsea nguyen image.png"
                                alt="Chelsea Nguyen"
                                sx={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginBottom: '1.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Typography 
                                sx={{
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Satoshi Bold, sans-serif'
                                }}
                            >
                                Chelsea Nguyen
                            </Typography>
                        </Box>
                        
                        <Typography 
                            sx={{
                                color: '#64748b',
                                fontSize: '0.9rem',
                                lineHeight: 1.4,
                                fontFamily: 'DM Sans Medium, sans-serif',
                                textAlign: 'center'
                            }}
                        >
                            Computer Science & Digital Arts Sciences @ UF
                        </Typography>
                    </motion.div>
                </motion.div>

                {/* Clarissa */}
                <motion.div variants={itemVariants} whileHover={{ scale: 1.05 }} style={{ height: '100%' , cursor: 'pointer',}} onClick={() => {
                    window.location.href = "https://www.linkedin.com/in/clarissa-cheung-054035187/";
                }}>
                    <motion.div
                        whileHover={{ 
                            scale: 1.03, 
                            y: -8,
                            boxShadow: '0 20px 40px rgba(47, 137, 73, 0.14)'
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
                            borderRadius: '24px',
                            padding: '2rem 1.5rem',
                            textAlign: 'center',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: 'linear-gradient(135deg, #5faec0ff, #6bb07dff)',
                                borderRadius: '24px 24px 0 0'
                            }}
                        />
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box
                                component="img"
                                src="/static/images/clarissa-cheung.jpg"
                                alt="Clarissa Cheung"
                                sx={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    marginBottom: '1.5rem',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                            <Typography 
                                sx={{
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    marginBottom: '0.5rem',
                                    fontFamily: 'Satoshi Bold, sans-serif'
                                }}
                            >
                                Clarissa Cheung
                            </Typography>
                        </Box>
                        
                        <Typography 
                            sx={{
                                color: '#64748b',
                                fontSize: '0.9rem',
                                lineHeight: 1.4,
                                fontFamily: 'DM Sans Medium, sans-serif',
                                textAlign: 'center'
                            }}
                        >
                            Computer Science & Economics @ UF
                        </Typography>
                    </motion.div>
                </motion.div>
            </Box>

            {/* Acknowledgment */}
            <motion.div variants={itemVariants}>
                <Box 
                    sx={{
                        // background: 'rgba(255, 255, 255, 0.8)',
                        // backdropFilter: 'blur(10px)',
                        // border: '1px solid rgba(255, 255, 255, 0.3)',
                        // boxShadow: '0 8px 24px rgba(0, 0, 0, 0.05)',
                        borderRadius: '20px',
                        padding: '2rem',
                        textAlign: 'center',
                        marginTop: '1.5rem',
                    }}
                >
                    <Typography 
                        sx={{
                            color: '#64748b',
                            fontSize: '1rem',
                            marginBottom: '0.5rem',
                            fontFamily: 'DM Sans, sans-serif'
                        }}
                    >
                        Special thanks to our original WiNGHacks team members:
                    </Typography>
                    <Typography 
                        sx={{
                            fontFamily: 'DM Sans Bold, sans-serif',
                            fontSize: '1.3rem',
                            color: '#2850d9',
                            fontWeight: 600,
                            letterSpacing: '-0.01px'
                        }}
                    >
                        Xiaguo Jia and Sara Smith
                    </Typography>
                </Box>
            </motion.div>
        </motion.div>
    </Box>
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
                    className="final-cta-button-glow"
                    size="large"
                    sx={{
                        fontSize: '1.5rem !important',
                        fontFamily: 'Satoshi Bold, sans-serif !important',
                        background: 'rgba(255, 255, 255, 0.98) !important',
                        color: '#2850d9 !important',
                        padding: '22px 55px !important',
                        borderRadius: '50px !important',
                        letterSpacing: '-0.01em !important',
                        textTransform: 'none !important',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) !important',
                        display: 'flex !important',
                        alignItems: 'center !important',
                        gap: '15px !important',
                        fontWeight: '700 !important',
                        position: 'relative',
                        border: '2px solid transparent !important',
                        '&:hover': {
                            transform: 'translateY(-5px) scale(1.05)',
                            boxShadow: `
                                0 20px 60px rgba(0, 0, 0, 0.35),
                                0 0 0 3px rgba(40, 80, 217, 0.4),
                                0 0 20px rgba(40, 80, 217, 0.3),
                                0 0 40px rgba(40, 80, 217, 0.2),
                                0 0 60px rgba(40, 80, 217, 0.1) !important`,
                            background: '#ffffff !important',
                            border: '2px solid rgba(40, 80, 217, 0.6) !important',
                        }
                    }}
                >
                    Start Your Journey
                    <svg 
                        className="button-arrow" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        viewBox="0 0 24 24"
                        style={{ width: '28px', height: '28px' }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                </Button>
                
                <div className="cta-subtext">
                    <span>Get started easily in less than 30 seconds!</span>
                </div>
            </motion.div>
        </Stack>
    </motion.div>
</Box>
        </Box>
        </Box>
    );
}