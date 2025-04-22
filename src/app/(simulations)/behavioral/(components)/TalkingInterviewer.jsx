import React, { useEffect, useRef } from "react";

const TalkingInterviewer = ({ isTalking }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            if (isTalking) {
                video.currentTime = 0;
                video.play();
            } else {
                video.pause();
            }
        }
    }, [isTalking]);

    return (
        <div style={{ width: 500, height: 500 }}>
            {isTalking ? (
                <video
                    ref={videoRef}
                    src="/static/videos/talking-interviewer.mp4"
                    width="464"
                    height="466"
                    muted
                    loop
                    style={{ display: "block" }}
                />
            ) : (
                <img
                    src="/static/images/standing still.png"
                    alt="Interviewer idle"
                    width="464"
                    height="466"
                    style={{ display: "block" }}
                />
            )}
        </div>
    );
};

export default TalkingInterviewer;

