"use client";
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

export default function Test() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring"},
    };

    return (
        <Box className="bg-colorF3F1EA">
            {/* ---------- nav bar ---------- */}
            <AppBar sx={{ boxShadow: 'none', backgroundColor: scrolled ? '#e3e1db' : '#F3F1EB', padding: 0.2, transition: 'background-color 0.3s ease-in-out' }}>
                <Toolbar>
                    <GiFluffyWing color={'#324FD1'} size={25}/>
                    <Typography component='div' sx={{ fontSize: '1.75rem', flexGrow: 1, display:{xs:'none', md:'flex', fontFamily: 'Satoshi Black'}, color: 'black'}}>WiNG.it</Typography>

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap:1.5}}>
                        <Button color='inherit'  sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color:  'black', letterSpacing: '-0.01px', borderRadius: '50px',paddingX: 2}}>
                            <Link
                                activeClass="active"
                                to="why-wing-it"
                                offset={-50}
                                duration={500}
                                containerId="scrollableContainer"
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
                                containerId="scrollableContainer"
                                style={{ fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', color: 'black', letterSpacing: '-0.01px', borderRadius: '50px', paddingX: 2 }}
                            >
                                About Us
                            </Link>
                        </Button>
                        <Button color='inherit' href='/dashboard' sx={{fontSize: '1.05rem', fontFamily: 'Satoshi Bold', textTransform: 'none', backgroundColor: '#2850d9', paddingX: 2.5,borderRadius: '50px', color:  'white', letterSpacing: '-0.01px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05) rotate(-2deg)' }}}>
                            Get Started
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

        {/*// scrollable container*/}
        <Box
            id="scrollableContainer"
            sx={{
            height: '100vh',
            overflowY: 'scroll',
            scrollSnapType: 'y mandatory',
            scrollBehavior: 'smooth',
        }}>

            {/* ---------- home page ----------  */}
            <Box id="home-page"
                 sx={{
                     scrollSnapAlign: 'start',     // or 'center'
                     height: '100vh',
                 }}
                 className=" h-screen w-full bg-colorF3F1EA flex justify-center items-center">

                {/*  main content box  */}
                <Grid container
                      spacing={5}
                      direction={"column"}
                      width={'80%'}
                      sx={{paddingLeft: '5%', paddingRight: '5%'}}>

                    {/*  title/slogan  */}
                    <Grid item xs>
                        <Stack direction={"column"} spacing={2}>
                            <motion.div className="flex items-center justify-center space-x-2 flex-col -space-y-3.5"
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}
                                        >
                                <motion.p
                                    variants = {itemVariants}
                                    style={{fontFamily:'Satoshi Bold', color: 'black', fontSize: '3.2rem', letterSpacing: '-0.5px',userSelect: 'none'}}>
                                    Unlock all your career tools
                                </motion.p>

                                <motion.div className="flex flex-row items-center space-x-1"
                                            variants = {itemVariants}
                                >
                                    <motion.p style={{fontFamily:'Satoshi Bold', color: 'black', fontSize: '3.2rem', letterSpacing: '-0.5px',userSelect: 'none'}}>
                                        with no strings attached.
                                    </motion.p>

                                    {/* smiley */}
                                    <motion.div initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: true }}>
                                        <Typography style = {{fontSize: '55px'}}>😉</Typography>
                                    </motion.div>

                                </motion.div>
                            </motion.div>

                            {/* description */}
                            <motion.div className="items-center flex flex-col -space-y-1.2"
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true }}>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.05 }}
                                    style={{fontFamily:'DM Sans Medium', color: '#81807c', fontSize: '1.3rem', letterSpacing: '-0.5px'}}>
                                    WiNG.it provides tools to enhance your skills in
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.05 }}
                                    style={{fontFamily:'DM Sans Medium', color: '#81807c', fontSize: '1.3rem', letterSpacing: '-0.5px'}}>
                                    interviews, networking, and beyond, helping you excel in your career—all for <span style={{fontStyle:"italic"}}>free</span>.
                                </motion.p>
                            </motion.div>
                        </Stack>
                    </Grid>

                    {/* ---------- cards ---------- */}
                    <Grid item xs>
                        <motion.div initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}>
                            <Grid container spacing={2} columns={3} rows={1}>
                                {/* career prep tools card */}
                                <Grid size={1}>
                                    <motion.div variants = {itemVariants}
                                                transition={{ delay: 0.4 }}>
                                        <Card style={{padding: '8%', borderRadius: '20px'}}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1c4a8', borderRadius: '50%', width: '40px', height: '40px', marginBottom:'15px'}}>
                                                <FaPencilRuler color={'#E3632E'} size={20} />
                                            </div>
                                            <Typography variant="h5" style={{fontFamily: 'Satoshi Bold', color: 'black', letterSpacing: '-0.5px'}}>
                                                Career Prep Tools
                                            </Typography>
                                            <Typography style={{fontFamily: 'DM Sans', color: '#696862', letterSpacing: '-0.5px', fontSize: '1.1rem'}}>
                                                Using our variety of tools, you can practice for interviews, networking, and more.
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* saving transcripts card */}
                                <Grid size={1}>
                                    <motion.div variants = {itemVariants}
                                                transition={{ delay: 0.6 }}>
                                        <Card style={{padding: '8%', borderRadius: '20px'}}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#9db8ea', borderRadius: '50%', width: '40px', height: '40px', marginBottom:'15px'}}>
                                                <IoDocumentText color={'#2a6ed5'} size={25} />
                                            </div>
                                            <Typography variant="h5" style={{fontFamily: 'Satoshi Bold', color: 'black', letterSpacing: '-0.5px'}}>
                                                Saves Transcripts
                                            </Typography>
                                            <Typography style={{fontFamily: 'DM Sans', color: '#696862', letterSpacing: '-0.5px', fontSize: '1.1rem'}}>
                                                After each practice session, you can save your transcripts to review for later.
                                            </Typography>
                                        </Card>
                                    </motion.div>
                                </Grid>

                                {/* personalized feedback card */}
                                <Grid size={1}>
                                    <motion.div variants = {itemVariants}
                                                transition={{ delay: 0.8 }}>
                                        <Card style={{padding: '8%', borderRadius: '20px'}}>
                                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#9fcb95', borderRadius: '50%', width: '40px', height: '40px', marginBottom:'15px'}}>
                                                <BiSolidMessageCheck color={'#559437'} size={25} style={{marginTop: '2.5px'}}/>
                                            </div>
                                            <Typography variant="h5" style={{fontFamily: 'Satoshi Bold', color: 'black', letterSpacing: '-0.5px'}}>
                                                Personalized Feedback
                                            </Typography>
                                            <Typography style={{fontFamily: 'DM Sans', color: '#696862', letterSpacing: '-0.5px', fontSize: '1.1rem'}}>
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
                            And it&#39;s all for <span style={{fontFamily: 'Satoshi Black', color: 'black'}}>free.</span>
                        </Typography>
                        </motion.div>
                    </Grid>


                </Grid>
            </Box>

            {/* ---------- why wing it ----------*/}
            <Box id="why-wing-it"
                 sx={{
                     scrollSnapAlign: 'start',
                     height: '100vh',
                 }}
                 className="h-screen w-full bg-colorF3F1EA flex justify-center items-center">
                <Grid container columns={5} rows={1} width={'80%'}>

                    {/* ---------- title / description ---------- */}
                    <Grid item size={3} >
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
                                    className="text-1.5xl" style = {{fontFamily: 'Satoshi Medium', color: 'black', lineHeight: '150%'}}>
                                    As students, we know interviewing and networking can be hard. Like, really hard. And unfortunately, there are close to zero good, free, and
                                    useful career preparation tools out there.
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 0.95 }}
                                    className="text-1.5xl" style = {{fontFamily: 'Satoshi Medium', color: 'black', lineHeight: '150%'}}>
                                    Our goal? <span
                                    style = {{fontFamily: 'DM Sans Bold', color: '#000000', letterSpacing: '-0.5px'}}>Making career preparation more accessible for everybody. </span> No paywall.
                                    No fees. Just practicing for your upcoming opportunities and needs.
                                </motion.p>
                                <motion.p
                                    variants = {itemVariants}
                                    transition={{ delay: 1.1}}
                                    className="text-1.5xl" style = {{fontFamily: 'Satoshi Medium', color: 'black', lineHeight: '150%'}}>
                                    Oh, and as a bonus, making it fun. Because who said preparing for your future can&apos;t be fun?
                                </motion.p>
                            </Stack>
                        </motion.div>
                    </Grid>

                    {/* picture */}
                    <Grid item size={2} style={{backgroundColor: '#C1D6E6', borderRadius: '30px'}}>
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
                     scrollSnapAlign: 'start',
                     height: '100vh',
                 }}
                 className="h-screen w-full flex justify-center pt-1/12 bg-colorF3F1EA">
                <Grid container
                      spacing={5}
                      direction={"column"}
                      width={'80%'}
                      sx={{paddingLeft: '5%', paddingRight: '5%'}}>

                    {/* title  */}
                    <Grid item xs>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                            variants={itemVariants}>
                        <Typography style={{fontFamily:'Satoshi Bold', color: 'black', fontSize: '3.3rem', letterSpacing: '-0.5px',userSelect: 'none', textAlign:'center', marginBottom: "-20px"}}>
                            Really quick, here&#39;s a little about us.
                        </Typography>
                        </motion.div>
                    </Grid>

                    {/* description */}
                    <Grid item xs>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>

                        <Stack spacing={3} direction={"column"}>
                            <motion.p className="text-1.5xl leading-tight text-center"
                                      variants = {itemVariants}
                                      style = {{fontFamily: 'Satoshi Medium', color: 'black', fontSize: '1.3rem', lineHeight: '150%'}}
                                      transition={{ delay: 0.6 }}>
                                Our project was created for the
                                <span className="font-dm-sans-black tracking-tight"> University of Florida’s 🐊</span> first annual
                                <span className="font-dm-sans-black tracking-tight"> WiNGHacks Hackathon 🪽</span>, a hackathon designed to empower
                                women, non-binary, and gender minorities by providing them with a platform to innovate and create. Our project won
                                <span className="font-dm-sans-black tracking-tight"> first place 🏆</span> for best project created by first time hackathoners and was picked up by
                                <span className="font-dm-sans-black tracking-tight"> UF Professor Amanpreet Kapoor  💻</span> to continue being built for improvement.
                            </motion.p>
                            <motion.p className="text-1.5xl leading-tight text-center"
                                      style = {{fontFamily: 'Satoshi Medium', color: 'black', fontSize: '1.3rem', lineHeight: '150%'}}
                                      variants = {itemVariants}
                                      transition={{ delay: 0.75 }}>
                                WiNG.it was created to reduce the stress of interview prep.
                                As college students, we recognize the importance of being prepared for interviews and networking, as well as having easy access to resources.
                                We hope that with WiNG.it, we can help elevate that stress & push you to be the best version of yourself.
                            </motion.p>
                        </Stack>
                        </motion.div>
                    </Grid>

                    {/*  developer section  */}
                    <Grid item xs>
                        <Grid container columns={4} rows={1} spacing={4}>

                            {/* rachel */}
                            <Grid item size={1}>
                                <motion.div className=" flex justify-end flex-col pr-3"
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true }}
                                            variants = {itemVariants}
                                            transition={{ delay: 0.9 }}
                                >
                                    <svg className="ml-[70%]" width="80" height="40" viewBox="0 0 156 56" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M3.99998 52.5C6.02093 50.3144 18.632 34.0592 34.1879 29.6093C46.2347 26.1631 59.6206 26.21 71.5011 30.3838C75.3596 31.7393 82.1324 35.3006 79.9973 40.5341C79.0224 42.9238 76.7045 44.0966 74.5102 45.2101C72.9866 45.9833 70.6661 46.8286 68.9682 46.1033C66.4295 45.0189 64.7111 41.9117 64.5937 39.2509C64.439 35.7427 66.5308 32.415 68.7462 29.8706C70.4192 27.9491 72.3633 26.3738 74.5499 25.0624C79.412 22.1464 84.7923 19.7864 90.3243 18.515C95.8318 17.2493 101.621 16.9695 107.243 17.4405C114.45 18.0441 120.997 20.4928 127.434 23.678C133.228 26.5455 138.742 29.9302 144.475 32.9122C145.228 33.3036 146.001 33.6551 146.747 34.0592C146.759 34.0659 147.619 34.4429 147.391 34.7138C146.78 35.4375 144.851 35.8704 144.055 36.1581C139.857 37.6758 135.7 39.2394 131.636 41.0978C128.71 42.4359 125.836 43.8887 123.049 45.4977C122.48 45.8266 124.25 45.0185 124.346 44.9773C130.666 42.2509 137.234 40.3551 143.888 38.6119C145.059 38.305 147.069 37.7838 148.285 37.4924C149.322 37.244 150.65 37.1544 151.647 36.7301C152.301 36.4519 149.804 34.1245 149.655 33.9387C146.703 30.2618 144.361 26.0767 141.996 22.0122C139.515 17.7465 137.494 13.4329 135.843 8.78583C135.612 8.13512 134.575 3.33449 133.528 3.63402"
                                            stroke="black" stroke-width="7" stroke-linecap="round"/>
                                    </svg>
                                    <h2 style={{fontFamily: 'Satoshi Bold'}} className="tracking-tight text-color282523 text-2.5xl text-right -mb-1">
                                        Rachel Pu
                                    </h2>
                                    <p style={{color: " #81807C"}} className="font-dm-sans-medium tracking-tight leading-tight text-right">
                                        Student at UF majoring in
                                        Computer Science and
                                        minoring in Digital Arts & Sciences
                                    </p>
                                </motion.div>
                            </Grid>
                            {/* rachel photo */}
                            <Grid item size={1}>
                                <motion.img
                                    src="/static/images/rachel%20pu%20image.png"
                                    alt="rachel pu image"
                                    width={230}
                                    height={230}
                                    unoptimized
                                    className="rounded-2xl drop-shadow-lg"
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants = {itemVariants}
                                    transition={{ delay: 1.1 }}
                                    whileHover={{ scale: 1.05, rotate: -2, cursor: 'pointer' }}
                                    onClick={() => window.open('https://www.linkedin.com/in/rachel-pu-ufl/', '_blank')}
                                />
                            </Grid>
                            <Grid item size={1}>
                                <motion.img
                                    src="/static/images/chelsea nguyen image.png"
                                    alt="chelsea nguyen's image"
                                    width={230}
                                    height={230}
                                    unoptimized
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants = {itemVariants}
                                    transition={{ delay: 1.25 }}
                                    className="rounded-2xl drop-shadow-lg"
                                    whileHover={{ scale: 1.05, rotate: 2, cursor: 'pointer' }}
                                    onClick={() => window.open('https://www.linkedin.com/in/chelseaqnguyen/', '_blank')}
                                />
                            </Grid>
                            <Grid item size={1}>
                                <motion.div className=" flex justify-end flex-col"
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true }}
                                            variants = {itemVariants}
                                            transition={{ delay: 1.4 }}
                                >
                                    <svg className="mr-[75%]" width="80" height="40" viewBox="0 0 160 81" fill="none"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M156.5 77.0683C154.41 74.8293 159.5 47.9643 124.573 31.436C112.186 27.8405 98.4507 27.7896 86.2908 31.9493C82.3414 33.3003 75.4181 36.8744 77.6474 42.2157C78.6654 44.6548 81.0524 45.8653 83.3122 47.0145C84.8813 47.8125 87.2686 48.6898 89.0055 47.9643C91.6025 46.8795 93.3429 43.7303 93.4438 41.0234C93.5767 37.4546 91.4058 34.0529 89.1138 31.4474C87.3829 29.4798 85.3765 27.8624 83.1231 26.5118C78.1125 23.5086 72.5744 21.0674 66.8886 19.7329C61.228 18.4043 55.2856 18.077 49.5198 18.5148C42.1294 19.076 35.4292 21.5196 28.8482 24.7135C22.9236 27.5887 17.2903 30.9925 11.43 33.9847C10.6607 34.3775 9.86975 34.7294 9.1074 35.1352C9.09475 35.1419 8.21484 35.5192 8.45132 35.7966C9.08297 36.5375 11.0659 36.9922 11.8847 37.2908C16.2038 38.8662 20.4808 40.488 24.6644 42.409C27.6769 43.7922 30.6364 45.2918 33.5077 46.9496C34.0948 47.2885 32.272 46.4532 32.1737 46.4105C25.6681 43.5896 18.9151 41.612 12.0745 39.7891C10.8699 39.4681 8.80368 38.923 7.55391 38.6175C6.48865 38.3571 5.12525 38.2561 4.09873 37.817C3.42585 37.5291 5.97025 35.1791 6.12197 34.9911C9.12405 31.2712 11.4965 27.0298 13.8929 22.9111C16.408 18.5885 18.4498 14.2139 20.1097 9.49715C20.3421 8.83669 21.371 3.95918 22.4476 4.27169"
                                            stroke="black" stroke-width="7" stroke-linecap="round"/>
                                    </svg>
                                    <h2 style={{fontFamily: 'Satoshi Bold'}} className="tracking-tight text-color282523 text-2xl text-left -mb-1">
                                        Chelsea Nguyen
                                    </h2>
                                    <p style={{color: " #81807C"}} className="font-dm-sans-medium tracking-tight leading-tight text-left">
                                        Student at UF majoring in
                                        Computer Science and
                                        minoring in Digital Arts & Sciences
                                    </p>
                                </motion.div>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/*  honorable mention */}
                    <Grid item xs>
                        <motion.div
                            initial = "hidden"
                            whileInView="visible"
                            viewport={{ once: true }}>
                            <motion.p
                                style = {{fontFamily: 'Satoshi Medium'}}
                                className="text-color282523 text-1.5xl text-center leading-tight"
                                variants = {itemVariants}
                                transition={{ delay: 1.45 }}>
                                Honorable developers from the original WiNGHacks project team:
                                <span className="font-dm-sans-black tracking-tight"> Xiaguo Jia</span>,
                                <span className="font-dm-sans-black tracking-tight"> Sara Smith</span>
                            </motion.p>
                        </motion.div>
                    </Grid>


                </Grid>
            </Box>

            {/* ---------- getting started section ---------- */}
            <Box id="getting-started"
                 sx={{
                     scrollSnapAlign: 'start',
                     height: '100vh',
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
                              style={{fontFamily:'Satoshi Bold', color: '#81807C', fontSize: '2rem', letterSpacing: '-0.5px',userSelect: 'none',textAlign:'center'}}>
                        Ready to get started?
                    </motion.p>
                </Stack>
                <motion.div
                    initial="hidden"
                    whileInView='visible'
                    viewport={{ once: true }}
                    transition={{ delay: 1 }}
                    variants = {itemVariants}>
                    <Button color='inherit' href='/dashboard' sx={{fontSize: '2.5rem', fontFamily: 'Satoshi Bold', textTransform: 'none', backgroundColor: '#2850d9', paddingX: 5.5,borderRadius: '50px', color:  'white', letterSpacing: '-0.01px', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05) rotate(-2deg)' },display: 'flex', alignItems: 'center', gap: 1}}>
                        Get Started
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h12M12 5l7 7-7 7" />
                        </svg>
                    </Button>
                </motion.div>
            </Box>
        </Box>
            {/*  end  */}
        </Box>
    );
}
