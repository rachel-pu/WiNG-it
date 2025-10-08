import Image from 'next/image';
import { Box, Typography } from '@mui/material';

const InstructionsStepComponent = ({ stepNumber, stepTitle, stepDescription }) => (
    <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        mb={3.35}
    >

        {/* number */}
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: '#384EC9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
            }}
        >
            <Typography
                color="#F3F1EC"
                fontFamily="Satoshi Bold"
                fontSize="1.5rem"
            >
                {stepNumber}
            </Typography>
        </Box>

        {/* text */}
        <Box>
            {/* header */}
            <Typography
                color="#384EC9"
                fontFamily="Satoshi Bold"
                fontSize="1.3rem"
            >
                {stepTitle}
            </Typography>
            {/* description */}
            <Typography
                color="black"
                fontFamily="DM Sans"
                fontSize="1rem"
                width={450}
            >
                {stepDescription}
            </Typography>
        </Box>
    </Box>
);

export default InstructionsStepComponent;