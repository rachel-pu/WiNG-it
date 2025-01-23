"use client";
import Image from "next/image";
import Link from "next/link";
import {Typography, Box} from "@mui/material";

const Instructions = () => {
    return (
        // main content box
        <Box>
        {/*  background  */}
            <Box sx={{bgcolor: '#F3F1EB', height: '100vh', justifyContent: 'center', alignItems:'center',display: 'flex',}}>
                <div
                    className="mx-auto bg-gradient-to-r from-color6795CA/70 via-colorC1B1E1/70 to-colorAED6EC/70 w-4/5 h-10/12 p-20 rounded-3xl shadow-lg relative">

                    {/* ----------------- dots in corner ----------------*/}
                    <div>
                        {/* Top-left dot */}
                        <div className="absolute top-5 left-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>

                        {/* Top-right dot */}
                        <div className="absolute top-5 right-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>

                        {/* Bottom-left dot */}
                        <div className="absolute bottom-5 left-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>

                        {/* Bottom-right dot */}
                        <div className="absolute bottom-5 right-5 w-4 h-4 bg-color31362F/25 rounded-full"></div>
                    </div>

                    <Typography sx={{color: 'black'}}>
                        Helo
                    </Typography>

                </div>


            </Box>


        {/*  end  */}
        </Box>
    );
}

export default Instructions;