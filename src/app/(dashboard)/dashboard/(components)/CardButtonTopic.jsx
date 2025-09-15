import React from 'react';
import { Button } from '@mui/material';
import { IoPersonCircle } from 'react-icons/io5';
import { FaMicrophone } from 'react-icons/fa';
import { AiFillTool } from "react-icons/ai";

const buttonConfig = {
    Simulation: {
        icon: IoPersonCircle,
        label: "Simulation",
        bgColor: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        borderColor: "#0ea5e9",
        textColor: "#0369a1",
        iconColor: "#0284c7",
        iconSize: '1rem'
    },
    Microphone: {
        icon: FaMicrophone,
        label: "Microphone",
        bgColor: "linear-gradient(135deg, #fef3f2 0%, #fde4e1 100%)",
        borderColor: "#f97316",
        textColor: "#c2410c",
        iconColor: "#ea580c",
        iconSize: '0.9rem'
    },
    Tool: {
        icon: AiFillTool,
        label: "Tool",
        bgColor: "linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)",
        borderColor: "#65a30d",
        textColor: "#365314",
        iconColor: "#4d7c0f",
        iconSize: '0.9rem'
    }
};

const CardButtonTopic = ({ type }) => {
    const config = buttonConfig[type];

    return (
        <Button
            size="small"
            variant="outlined"
            startIcon={config ? <config.icon style={{
                fontSize: config.iconSize,
                color: config.iconColor
            }} /> : null}
            disabled
            disableRipple
            disableElevation
            sx={{
                fontFamily: 'Satoshi Medium',
                fontWeight: 500,
                background: config.bgColor,
                color: config.textColor,
                border: `1.5px solid ${config.borderColor}20`,
                borderRadius: '12px',
                letterSpacing: '-0.2px',
                fontSize: '0.8rem',
                textTransform: 'none',
                paddingX: 1.5,
                paddingY: 0.5,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(12px)',
                cursor: 'default',
                '&.Mui-disabled': {
                    background: config.bgColor,
                    color: config.textColor,
                    border: `1.5px solid ${config.borderColor}20`,
                    opacity: 1
                }
            }}
        >
            {config.label}
        </Button>
    );
};

export default CardButtonTopic;
