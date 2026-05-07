import React, { useState, useEffect, useRef } from "react";
import "./Video.css";

import Display from "../Prediction/Display";

const Video = ({ setEmbed, onCancel, setEmbedError }) => {
    const [imageErrorA, setImageErrorA] = useState(false);
    const [imageErrorB, setImageErrorB] = useState(false);
    const [imageErrorC, setImageErrorC] = useState(false);
    const [imageErrorD, setImageErrorD] = useState(false);

    const ImageError = (setError) => {
        setError(true);
    };

    const ImageClick = (src, setError) => {
        const embedElement = (
            <img
                src={src}
                alt="Video Stream"
                width="1280"
                height="720"
                onError={() => {
                    ImageError(setError);
                    setEmbedError(true);
                }}
            />
        );
        setEmbed(embedElement);
        onCancel(false);
    };

    const imageBox = (src, errorHandler, setError) => (
        <img
            src={src}
            alt="Video Stream"
            width="580"
            height="326.25"
            onError={errorHandler}
            onClick={() => ImageClick(src, setError)}
        />
    );

    return (
        <div>
            <div className="video-container">
                <h4 className = 'subtitle'>Video Panel</h4>
                <div className="sort">
                    {imageErrorA ? (
                        <div className="on-error">
                            <p>😢</p>
                            <h3>No Access...</h3>
                        </div>
                    ) : (
                        imageBox(
                            "http://localhost:8001/video_feed",
                            () => ImageError(setImageErrorA),
                            setImageErrorA
                        )
                    )}
                    {imageErrorB ? (
                        <div className="on-error">
                            <p>😢</p>
                            <h3>No Access...</h3>
                        </div>
                    ) : (
                        imageBox(
                            "http://localhost:8001/video_feed_tomato",
                            () => ImageError(setImageErrorB),
                            setImageErrorB
                        )
                    )}
                </div>
            </div>
            <div className="video-container">
                <div className="sort">
                    {imageErrorC ? (
                        <div className="on-error">
                            <p>😢</p>
                            <h3>No Access...</h3>
                        </div>
                    ) : (
                        imageBox(
                            "http://localhost:8001/video_feed_leaves",
                            () => ImageError(setImageErrorC),
                            setImageErrorC
                        )
                    )}
                    {imageErrorD ? (
                        <div className="on-error">
                            <p>😢</p>
                            <h3>No Access...</h3>
                        </div>
                    ) : (
                        imageBox(
                            "http://192.168.54.11:8000/stream.mjpg",
                            () => ImageError(setImageErrorD),
                            setImageErrorD
                        )
                    )}
                </div>
            </div>
            <div className="prediction-container">
                <h3 className="title">Diseases Results</h3>
                <section className="prediction-box">
                    <Display />
                </section>
            </div>
        </div>
    );
};

export default Video;
