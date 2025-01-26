import { SignUp } from '@clerk/nextjs'
import { Box } from '@mui/material'

export default function SignUpPage() {
    return (
        <Box sx={{backgroundColor: '#F3F1EB', display: 'flex', height: '100vh', justifyContent:'center', alignItems: 'center'}}>
            <SignUp
                loginUrl="/login"
                appearance={{
                    variables: {
                        colorPrimary: '#2850d9',
                        colorText: '#000000',
                        fontFamily: 'DM Sans',
                    },
                }}/>
        </Box>
    )
}