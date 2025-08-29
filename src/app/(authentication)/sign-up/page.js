'use client';
import { SignUp } from '@clerk/nextjs'
import { Box } from '@mui/material'
import { motion } from "framer-motion";

export default function SignUpPage() {
    const itemVariants = {
        hidden: { opacity: 0, y: 5 },
        visible: { opacity: 1, y: 0 },
        transition: { type: "spring"},
    };

    return (
        <Box sx={{
            backgroundColor: '#F3F1EB',
            backgroundImage: "url(/static/images/header.png)",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            height: '100vh', 
            justifyContent:'center', 
            alignItems: 'center'
        }}>
            <motion.div
                initial="hidden"
                whileInView="visible"
                variants={itemVariants}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}>
                <SignUp
                    signInUrl="/login"
                    appearance={{
                        variables: {
                            colorPrimary: '#2850d9',
                            colorText: '#000000',
                            fontFamily: 'DM Sans',
                        },
                    }}
                />
            </motion.div>
        </Box>
    )
}