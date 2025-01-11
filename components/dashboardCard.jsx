import React from 'react';
import { Card, CardContent, CardMedia, Typography, Grid } from '@mui/material';

const DashboardCard = ({ title, description, image }) => {
    return (
        <Card
            sx={{
                borderRadius: '10px',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 6 },
                cursor: 'pointer'
            }}
        >
            <CardMedia
                sx={{ height: 200 }}
                image={image}
                title={title}
            />
            <CardContent sx={{ padding: '7%' }}>
                <Typography sx={{
                    fontFamily: 'DM Sans Bold',
                    color: 'black',
                    letterSpacing: '-0.5px',
                    fontSize: '1.25rem',
                    marginBottom: '5px'
                }}>
                    {title}
                </Typography>
                <Typography sx={{
                    fontFamily: 'Satoshi Medium',
                    color: '#696862',
                    letterSpacing: '-0.5px',
                    fontSize: '0.9rem'
                }}>
                    {description}
                </Typography>
            </CardContent>
        </Card>
    );
};

export default DashboardCard;
