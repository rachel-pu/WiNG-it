import React from 'react';
import { ListItemButton, Stack, Box, Typography } from '@mui/material';
import { IoSettings } from 'react-icons/io5';

const getColorForScore = (score) => {
    if (score >= 8) return { bg: '#68b266', color: '#317329' }; // Green
    if (score >= 4) return { bg: '#fdd835', color: '#c6a700' }; // Yellow
    return { bg: '#e57373', color: '#d32f2f' }; // Red
};

const SavesButtons = ({ items }) => {
    return (
        <>
            {items.map((item, index) => (
                <ListItemButton key={index} sx={{
                    borderRadius: 2, backgroundColor: '#e0dedb', borderColor: '#cccbc7',
                    borderWidth: 1, marginBottom: 1.75, borderStyle: 'solid', width: '100%'
                }}>
                    <Stack direction={'row'} sx={{ width: '100%' }}>

                        {/* Conditionally render score or icon for webscraping tool */}
                        <Box sx={{
                            width: '20%', marginY: '3%', marginRight: '4%', borderRadius: 3,
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            backgroundColor: item.type === 'webscraping' ? '#c5c5c5' : getColorForScore(item.score).bg
                        }}>
                            {item.type === 'webscraping' ?
                                <IoSettings style={{ fontSize: '1.6rem', color: '#818181' }} /> :
                                <Typography sx={{ fontFamily: 'Satoshi Bold', fontSize: '1.2rem', color: getColorForScore(item.score).color }}>
                                    {item.score}/10
                                </Typography>
                            }
                        </Box>

                        {/* Title and time */}
                        <Stack direction={'column'} sx={{ width: '100%' }}>
                            <Box className="flex flex-row" sx={{ justifyContent: 'space-between' }}>
                                <Typography color='black' sx={{ fontFamily: 'Satoshi Bold', fontSize: '1.05rem' }}>
                                    {item.title}
                                </Typography>
                                <Typography color='#9A9A95FF' sx={{ fontSize: '0.9rem', fontFamily: 'DM Sans'}}>
                                    {item.time}
                                </Typography>
                            </Box>
                            <Typography color='black' sx={{ color: '#565652', fontSize: '0.85rem', lineHeight: '1.2rem', fontFamily: 'DM Sans' }}>
                                {item.description}
                            </Typography>
                        </Stack>
                    </Stack>
                </ListItemButton>
            ))}
        </>
    );
};

export default SavesButtons;
