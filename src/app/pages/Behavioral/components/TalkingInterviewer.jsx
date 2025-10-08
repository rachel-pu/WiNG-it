
// TalkingInterviewer.jsx
import { useEffect, useRef } from "react";

const TalkingInterviewer = ({ isTalking }) => {
    const videoRef = useRef(null);
    const talkingSrc = "/static/videos/interviewer_talking.mp4";
    const idleBg    = "/static/images/interviewer_idle.png";

    useEffect(() => {
        const vid = videoRef.current;
        if (!vid) return;
        if (isTalking) {
            vid.currentTime = 0;
            vid.play().catch(console.error);
        } else {
            vid.pause();
        }
    }, [isTalking]);

    return (
        <div
            style={{
                width: "98%",
                height: "100%",
                backgroundImage: `url(${idleBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <video
                ref={videoRef}
                src={talkingSrc}
                muted
                loop
                playsInline
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    backgroundPosition: "center",
                    display: isTalking ? "block" : "none",
                }}
            />
        </div>
    );
};

export default TalkingInterviewer;

