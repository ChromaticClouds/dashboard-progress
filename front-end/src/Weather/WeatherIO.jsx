import React, { useRef, useEffect, useState } from "react";
import './WeatherIO.css';

const WeatherIO = ({ viewWeather }) => {
    const [showWeater, setShowWeather] = useState([]);

    useEffect(() => {
        setShowWeather(viewWeather);
    }, [viewWeather])

    return (
        <div className="board weatherio-container">
            <div className="contents">
                <h4 className="subtitle">Weather Cast</h4>
                <div className="binding-container">
                    <div className="status-container">
                        <div className="box">

                        </div>
                        <p className="title">5 Days Forecast</p>
                        <div className="box">

                        </div>
                    </div>
                    <div className="weather-container">
                        <div className="highlight-box">
                            <p>Today Highlights</p>
                            <div className="box-container">
                                <div className="box-box">
                                    <div className="section">
                                        <div className="box">

                                        </div>
                                    </div>
                                    <div className="section">
                                        <div className="box">

                                        </div>
                                        <div className="box">

                                        </div>
                                    </div>
                                </div>
                                <div className="box-box">
                                    <div className="section">
                                        <div className="box">

                                        </div>
                                    </div>
                                    <div className="section">
                                        <div className="box">

                                        </div>
                                        <div className="box">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="title">Today at</p>
                        <div className="today-at-box">

                        </div>
                        <div className="today-at-box">

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WeatherIO;
