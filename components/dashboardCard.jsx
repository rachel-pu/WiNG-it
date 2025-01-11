import React from 'react';
import { Card, CardContent, CardMedia, Typography, CardActions } from '@mui/material';
import CardButtonTopic from "./CardButtonTopic";
import Link from 'next/link';

const DashboardCard = ({ title, link, description, image, buttons = [] }) => {
    return (
        <Link href={link}>
        <Card
            sx={{
                borderRadius: '10px',
                transition: 'box-shadow 0.3s',
                '&:hover': { boxShadow: 6 },
                cursor: 'pointer',
                height: '400px'
            }}
        >
            <CardMedia
                sx={{ height: 200 }}
                image={image}
                title={title}
            />
            <CardContent sx={{ padding: '5%' }}>
                <Typography sx={{
                    fontFamily: 'Satoshi Bold',
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
            <CardActions sx={{paddingX: '4%'}}>
                {buttons.slice(0, 4).map((button, index) => (
                    <CardButtonTopic key={index} type={button.type} />
                ))}
            </CardActions>
        </Card>
        </Link>
    );
};

export default DashboardCard;
