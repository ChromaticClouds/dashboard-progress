import React, { useState, useEffect } from "react";
import io from "socket.io-client";

import GrowthChart from "../../chart/Chart1";
import THChart from "../../chart/Chart2";
import SoilHumidChart from "../../chart/Chart4";
import WaterSupply from "../../chart/Chart3";
import GrowthDoughnut from "../../chart/Chart5";
import BrightnessChart from "../../chart/Chart6";
import TempSub from "../../chart/SubChart1"
import WindSub from "../../chart/SubChart2";
import HumidSub from "../../chart/SubChart3";
import './Chart2.css';

const Chart = ({ viewWeatherMap }) => {
    const [socket, set_socket] = useState(null);
    const [temperature, set_temperature] = useState([]);
    const [humidity, set_humidity] = useState([]);
    const [weather, set_weather] = useState({});

    const [direction, set_direction] = useState(0);
    const [wind_speed, set_wind_speed] = useState(0);

    useEffect(() => {
        const ws = io.connect("http://localhost:5100");
        set_socket(ws);

        ws.on("temperature sub chart rec", (value) => {
            set_temperature(value[0]);
        });
        ws.on("humidity sub chart rec", (value) => {
            set_humidity(value[0]);
        });

        return () => {
            ws.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit("temperature sub chart req");
            socket.emit("humidity sub chart req");

            const timer = setInterval(() => {
                socket.emit("temperature sub chart req");
                socket.emit("humidity sub chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    useEffect(() => {
        viewWeatherMap(weather);

        const deg = weather && weather.wind ? weather.wind.deg : 0;
        const speed = weather && weather.wind ? weather.wind.speed : 0;

        set_direction(deg);
        set_wind_speed(speed);
    }, [weather])

    return (
        <div className = "board">
            <>
                <WindSub set_weather = { set_weather }/>
            </>
            <div className = "sub-contents">
                <h4 className = 'subtitle'>Chart Panel</h4>
                <div className = "chart-container">
                    <div className = "chart-box">
                        <div className = "chart1">
                            <GrowthChart />
                        </div>
                    </div>
                    <div className = "chart-box">
                        <div className = "chart2">
                            <THChart />
                        </div>
                    </div>
                </div>
                <div className = "chart-container">
                    <div className = "chart-box">
                        <div className = "chart2">
                            <WaterSupply />
                        </div>
                    </div>
                    <div className = "chart-box">
                        <div className = "chart1">
                            <SoilHumidChart />
                        </div>
                    </div>
                </div>
                <div className = "chart-container">
                    <div className = "chart-box">
                        <div className = "chart3">
                            <GrowthDoughnut />
                        </div>
                    </div>
                    <div className = "height">
                        <div className = "flex-box">
                            <div className = "chart-box sort">
                                <div className = "chart4">
                                    <div>Temperature</div>
                                    <p>{ temperature.map(value => value.inner_temp) }°</p>
                                    <div className = "sub-chart">
                                        <TempSub />
                                    </div>
                                </div>
                            </div>
                            <div className = "chart-box sort">
                                <div className = "chart4">
                                    <div>Wind</div>
                                    <span>{ wind_speed + "m/s"}</span>
                                    <div className = "sub-chart wind">
                                        <img 
                                            className = "arrow"
                                            src = "../images/arrow.png" 
                                            alt = "wind-direction"
                                            style={{ transform: `rotate(${ direction }deg)`, transformOrigin: 'center' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className = "flex-box">
                            <div className = "chart-box sort">
                                <div className = "chart4">
                                    <div>Humidity</div>
                                    <p>{ humidity.map(value => value.inner_humid) }%</p>
                                    <div className = "sub-chart">
                                        <HumidSub />
                                    </div>
                                </div>
                            </div><div className = "chart-box sort">
                                <div className = "chart4">
                                    
                                </div>
                            </div>
                        </div>
                        <div className = "chart-box">
                            <div className = "chart5">
                                <BrightnessChart />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chart;