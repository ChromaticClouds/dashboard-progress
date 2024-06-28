import { React, useEffect, useState } from "react";
import io from "socket.io-client";
import LineChart from "../chart/LineChart";
import Monitoring from "./Monitoring/Monitoring";

import "./Summary.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

let socket;
const Summary = () => {
    useEffect(() => {
        socket = io.connect("http://localhost:5000");

        socket.emit("env req");
        socket.emit("sensor req");
        socket.emit("monitoring req");

        return () => {
            socket.disconnect();
        }
    }, [])

    const [growth_data, set_growth_data] = useState([]);
    const [env_stats, set_env_stats] = useState([]);
    const [sensor_stats, set_sensor_stats] = useState([]);
    const [daily_growth, set_daily_growth] = useState([]);
    const [monitoring_data, set_monitoring_data] = useState([]);

    const [host, setHost] = useState(1);

    useEffect(() => {
        console.log(monitoring_data)
    }, [])
    
    useEffect(() => {
        const repeat = setInterval(() => {
            socket.emit("env req");
            socket.emit("monitoring req");
        }, 2000);

        return () => {
            clearInterval(repeat);
        }
    }, []);

    useEffect(() => {
        socket.emit("growth req", { growth: host });
        socket.emit("weeks req", { week: host });

        const repeat = setInterval(() => {
            socket.emit("growth req", { growth: host });
            socket.emit("weeks req", { week: host });
        }, 2000);

        return () => {
            clearInterval(repeat);
        }
    }, [host])

    useEffect(() => {
        socket.on("env rec", (data) => {
            set_env_stats(data);
        });
        socket.on("weeks rec", (data) => {
            set_growth_data(data);
        });
        socket.on("sensor rec", (data) => {
            set_sensor_stats(data);
        });
        socket.on("growth rec", (data) => {
            set_daily_growth(data);
        })
        socket.on("monitoring rec", (data) => {
            set_monitoring_data(data);
        })
    }, [])

    let now = new Date();
    let day = now.getDate();
    let year = now.getFullYear();
    let month_date = now.getMonth() + 1;

    switch (month_date) {
        case 1:
            month_date = " Janualy, ";
            break;
        case 2:
            month_date = " February, ";
            break;
        case 3:
            month_date = " March, ";
            break;
        case 4:
            month_date = " April, ";
            break;
        case 5:
            month_date = " May, ";
            break;
        case 6:
            month_date = " June, ";
            break;
        case 7:
            month_date = " July, ";
            break;
        case 8:
            month_date = " August, ";
            break;
        case 9:
            month_date = " September, ";
            break;
        case 10:
            month_date = " October, ";
            break;
        case 11:
            month_date = " November, ";
            break;
        case 12:
            month_date = " December, ";
            break;
    }

    const [growthValue, setGrowthValue] = useState([
        {
            id: '1',
            data: [
                {
                    x: new Date().toLocaleDateString(),
                    y: 1
                }
            ]
        },
    ]);

    useEffect(() => {
        const growth = [
            {
                id: '토마토',
                data: daily_growth.map(object => {
                    const day = new Date(object.day).toLocaleDateString();
                    const avg_growth = parseFloat(object.avg_growth.toFixed(1));
                    if (isNaN(avg_growth)) {
                        console.error(`Invalid growth value: ${object.avg_growth}`);
                    }
                    return {
                        x: day,
                        y: avg_growth
                    };
                }).filter(point => !isNaN(point.y)) // Filter out invalid data points
            }
        ];

        setGrowthValue(growth)
    }, [daily_growth, host]);

    return (
        <div className = "board">
            <div className = "sub-contents">
                <div className = "category">
                    <div className="button-container">
                        <div 
                            className = {`button first ${host === 1 ? "color" : ""}`} 
                            onClick = {() => setHost(1)}
                        >
                            Tomato1
                        </div>
                        <div 
                            className = {`button ${host === 2 ? "color" : ""}`}
                            onClick = {() => setHost(2)}
                        >
                            Tomato2
                        </div>
                        <div 
                            className = {`button ${host === 3 ? "color" : ""}`}
                            onClick = {() => setHost(3)}
                        >
                            Tomato3
                        </div>
                        <div 
                            className="active-bar"
                            style={{marginLeft: host === 1 ? "40px" : host === 2 ? "190px" : "340px"}}
                        >
                        </div>
                    </div>
                </div>
                <h4 className = "subtitle">Summary Dashboard</h4>
                <div className = "date">
                    <FontAwesomeIcon 
                        icon = "fa-solid fa-calendar-days"
                        className = "calender-icon-size"
                    />
                    { day < 10 ? '0'+ day : day }
                    { month_date }
                    { year }
                </div>
                <div className = "summary-container">
                    <div>
                        <div className = "summary-box">
                            <h4 className = "title">Plant growth activity</h4>
                            <div className = "chart">
                                <LineChart 
                                    data = { growthValue }
                                />
                            </div>
                            <div className="sort">
                                { growth_data.map((object, index) => (
                                    <div className = "growth-box" key = {index}>
                                        <div className = "status phase">
                                            <div className = {
                                                    `
                                                        phase
                                                        ${
                                                            object.avg_growth <= 5 ? "seed-phase" :
                                                            object.avg_growth <= 15 ? "vegetation" : 
                                                            "final-growth"
                                                        }
                                                    `
                                                }
                                            >
                                                <div className = "growth-img-box">
                                                    <img src = { 
                                                        object.avg_growth <= 5 ? "../images/seeds.png" :
                                                        object.avg_growth <= 15 ? "../images/sprout.png" :
                                                        "../images/tomato.png" 
                                                        } 
                                                    />
                                                </div>
                                                <div className = "growth-disc">
                                                    { 
                                                        object.avg_growth <= 5 ? "Seed phase" :
                                                        object.avg_growth <= 15 ? "Vegetation" :
                                                        "Final growth"
                                                    }
                                                    <div className = "growth-value">
                                                        Week { object.week_difference }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="sort">
                                { growth_data.map((object, index) => (
                                    <div className = "week-box" key = {index}>
                                        <div className="week-value">
                                            <div className = {
                                                `
                                                    phase
                                                    ${
                                                        object.avg_growth <= 5 ? "seed-height" :
                                                        object.avg_growth <= 15 ? "vegetation-height" :
                                                        "final-growth-height"
                                                    }
                                                `
                                                }
                                            >
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className = "status-sort">
                            <div className = "env-box">
                                <div className = "temp-box color">
                                    <FontAwesomeIcon 
                                        icon = "fa-solid fa-temperature-three-quarters"
                                        className = "stat-icon"
                                    />
                                </div>
                                <div>
                                    <div>
                                        temperature
                                    </div>
                                    {env_stats.map((object, index) => (
                                        <div key={index}>
                                            {object.map((stat, index) => (
                                                <div 
                                                    key={index}
                                                    className = "stat-value"
                                                >
                                                    { stat.inner_temp != null ? stat.inner_temp + " °C" : ''}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className = "env-box">
                                <div className = "humid-box color">
                                    <FontAwesomeIcon 
                                        icon="fa-solid fa-droplet"
                                        className = "stat-icon"
                                    />
                                </div>
                                <div>
                                    <div>
                                        humidity
                                    </div>
                                    {env_stats.map((object, index) => (
                                        <div key={index}>
                                            {object.map((stat, index) => (
                                                <div 
                                                    key={index}
                                                    className = "stat-value"
                                                >
                                                    { stat.inner_humid != null ? stat.inner_humid + " %" : ''}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className = "env-box">
                                <div className = "lux-box color">
                                    <FontAwesomeIcon 
                                        icon="fa-regular fa-lightbulb"
                                        className = "stat-icon"
                                    />
                                </div>
                                <div>
                                    <div>
                                        light intensity
                                    </div>
                                    {env_stats.map((object, index) => (
                                        <div key={index}>
                                            {object.map((stat, index) => (
                                                <div 
                                                    key={index}
                                                    className = "stat-value"
                                                >
                                                    { stat.brightness != null ? stat.brightness : ''}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className = "sensor-box-sort">
                        <h4 className = "sensor-box-title">Farm Statistics</h4>
                        <div className = "sensor-box">
                            <div>
                                <FontAwesomeIcon 
                                    icon="fa-solid fa-seedling"
                                    className = "sensor-icon"
                                />
                            </div>
                            <div>
                                <p className = "sensor-subtitle">Soil Humidity</p>
                                { sensor_stats.map((object, index) => (
                                    <div key = { index } className = "soil-humid-id">
                                        {object[0]?.plant_id === "TOMATO001" ? "Tomato 1" : null}
                                    </div>
                                ))}
                            </div>
                            { sensor_stats.map((object, index) => (
                                <div key = { index } className = "sensor-value">
                                    { object[0]?.plant_id == "TOMATO001" && object[0]?.soil_humid + " %"}
                                </div>
                            ))}
                        </div>
                        <div className = "sensor-box">
                            <FontAwesomeIcon 
                                icon="fa-solid fa-fill-drip"
                                className = "sensor-icon"
                            />
                            <div>
                                <p className = "sensor-subtitle">Watering Amount</p>
                                <div className = "watering-disc">Per a Week</div>
                            </div>
                            { sensor_stats.map((object, index) => (
                                <div key = { index } className = "sensor-value">
                                    { object[sensor_stats[1].length - 1]?.week_watering != null && object[sensor_stats[1].length - 1]?.week_watering / 1000 + " L" }
                                </div>
                            ))}
                        </div>
                        <div className = "sensor-box">

                        </div>
                    </div>
                </div>
                <div className = "monitoring-sort">
                    <div className = "monitoring-contents">
                        <h4 className = "monitoring-title">Monitoring</h4>
                        <div className = "monitoring-box">
                            <h4 className = "monitoring-disc">Indicator</h4>
                            <h4 className = "monitoring-disc">Status</h4>
                            <h4 className = "monitoring-disc">Value</h4>
                        </div>
                        <div className="monitoring-value-box">
                            <Monitoring monitoring_data={monitoring_data}/>
                        </div>
                    </div>
                    <div className = "harvest-box-sort">
                        <h4 className = "monitoring-title">Available Harvest</h4>
                        <div className = "harvest-box">
                            
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Summary;