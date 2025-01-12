import React from 'react';
import { Button } from '@mui/material';
import { IoPersonCircle } from 'react-icons/io5';
import { FaMicrophone } from 'react-icons/fa';
import { AiFillTool } from "react-icons/ai";

const buttonConfig = {
    Simulation: {
        icon: IoPersonCircle,
        label: "Simulation",
        bgColor: "rgba(207,229,199,0.6)",
        textColor: "#657e58",
        iconSize: '1rem'
    },
    Microphone: {
        icon: FaMicrophone,
        label: "Microphone",
        bgColor: "rgba(209,220,232,0.6)",
        textColor: "#567b9f",
        iconSize: '0.9rem'
    },
    Tool:{
        icon: AiFillTool,
        label: "Tool",
        bgColor: "rgba(232,218,209,0.6)",
        textColor: "#a87642",
        iconSize: '0.9rem'
    }
};

const CardButtonTopic = ({ type }) => {
    const config = buttonConfig[type];

    return (
        <Button
            size="small"
            variant="contained"
            startIcon={config ? <config.icon style={{ fontSize: config.iconSize }} /> : null}
            disableRipple
            disableElevation
            sx={{
                fontFamily: 'DM Sans Medium',
                backgroundColor: config.bgColor,
                color: config.textColor,
                borderThickness: 2,
                borderRadius: 1.5,
                letterSpacing: '-0.3px',
                fontSize: '0.85rem',
                textTransform: 'none',
                paddingX: 1.2
            }}
        >
            {config.label}
        </Button>
    );
};

export default CardButtonTopic;
