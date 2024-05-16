import { React, useEffect, useState } from "react";
import io from "socket.io-client";
import { ResponsiveLine } from '@nivo/line';

import "./Summary.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const socket = io.connect("http://localhost:5000");

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const MyResponsiveLine = ({ data }) => (
    <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 30, bottom: 50, left: 30 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-.2f"
        curve="natural"
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        enableGridX={false}
        enableGridY={false}
        colors={{ scheme: 'dark2' }}
        enablePoints={false}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        areaOpacity={0}
        enableSlices="x"
        legends={[]}
    />
)

const Summary = () => {
    const [growth_data, set_growth_data] = useState([]);
    const [env_stats, set_env_stats] = useState([]);
    const [sensor_stats, set_sensor_stats] = useState([]);
    const [daily_growth, set_daily_growth] = useState([]);
    const [monitoring_data, set_monitoring_data] = useState([]);

    const growth_value_data = daily_growth.map((object, index) => ({
        id: `토마토 ${ index + 1 }`,
        data: object.slice(-24).map(({ day, avg_growth }) => ({ x: day, y: avg_growth}))
    }))

    useEffect(() => {
        socket.emit("env req", );
        socket.emit("weeks req", );
        socket.emit("sensor req", );
        socket.emit("growth req", );
        socket.emit("monitoring req");

        const repeat = setInterval(() => {
            socket.emit("env req", );
            socket.emit("weeks req", );
            socket.emit("sensor req", );
            socket.emit("growth req", );
            socket.emit("monitoring req");
        }, 2000);

        return () => {
            clearInterval(repeat);
        }
    }, [])

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

        return () => {
            socket.off("env rec");
            socket.off("weeks rec");
            socket.off("sensor rec");
            socket.off("growth rec");
            socket.off("monitoring rec");
            socket.off("sensor data");
        };
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

    return (
        <div>
            <div>
                <h4 className = "subtitle">Hello, DCT!</h4>
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
                    <div className = "growth-container">
                        <div className = "summary-box">
                            <h4 className = "growth-data-title">Plant growth activity</h4>
                            <div className = "growth-chart-config" style = { { width: "800px", height: "320px" } }>
                                <MyResponsiveLine 
                                    data = { growth_value_data }
                                />
                            </div>
                            { growth_data.map((object, index) => (
                                <div key = { index } className = "growth-value-sort">
                                    { object.slice(-24).map((value, index) => (
                                        <div key={ index } className = "hover-box">
                                            <div className = { value.avg_growth <= 18 ? "seed-phase" : value.avg_growth <= 20 ? "vegetation" : "final-growth"}>
                                                <div className = "growth-img-box">
                                                    <img src = { value.avg_growth <= 18 ? "../images/seeds.png" : value.avg_growth <= 20 ? "../images/sprout.png" : "../images/tomato.png" } />
                                                </div>
                                                <div className = "growth-disc">
                                                    { value.avg_growth <= 18 ? "Seed phase" : value.avg_growth <= 20 ? "Vegetation" : "Final growth"}
                                                    <div className = "growth-value">
                                                        Week { value.week_difference }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                            { growth_data.map((object, index) => (
                                <div key = { index } className = "week-box">
                                    { object.slice(-3).map((week, index) => (
                                        <div key={index} className="week-value">
                                            <div className = { week.avg_growth <= 18 ? "seed-height" : week.avg_growth <= 20 ? "vegetation-height" : "final-growth-height" }></div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                        <div className = "status-sort">
                            <div className = "growth-status-box">
                                <div className = "temp-box">
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
                                                    { stat.inner_temp != null ? stat.inner_temp + " °C" : null}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className = "growth-status-box">
                                <div className = "humid-box">
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
                                                    { stat.inner_humid != null ? stat.inner_humid + " %" : null}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className = "growth-status-box">
                                <div className = "lux-box">
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
                                                    { stat.led_measures != null ? stat.led_measures + " lux" : null}
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
                            <FontAwesomeIcon 
                                icon="fa-solid fa-seedling"
                                className = "sensor-icon"
                            />
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
                                <div className = "watering-disc">Liter per week</div>
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
                        <div>
                            {monitoring_data.map((object, index) => (
                                <div key = { index } className = "monitoring-value-box">
                                    {object.map((control, index) => (
                                        <div key = { index } className = "control-item">
                                            <div className = "control-icon-sort">
                                                <p>{ control.sensor_type === "Water Pump" && <FontAwesomeIcon icon="fa-solid fa-fill-drip" />}</p>
                                                <p>{ control.sensor_type === "Cooling Fan" && <FontAwesomeIcon icon="fa-solid fa-fan" />}</p>
                                                <p>{ control.sensor_type === "Neopixel LED 1" && <FontAwesomeIcon icon="fa-regular fa-lightbulb" />}</p>
                                                <p>{ control.sensor_type === "Neopixel LED 2" && <FontAwesomeIcon icon="fa-regular fa-lightbulb" />}</p>
                                                <p>{ control.sensor_type === "Neopixel LED 3" && <FontAwesomeIcon icon="fa-regular fa-lightbulb" />}</p>
                                                <p>{ control.sensor_type === "Water Level Sensor" && <FontAwesomeIcon icon="fa-solid fa-bars-progress" />}</p>
                                                <p>{ control.sensor_type === "DHT Sensor" && <FontAwesomeIcon icon="fa-solid fa-temperature-low" />}</p>
                                                <p>{ control.sensor_type === "Ultrasonic Sensor 1" && <FontAwesomeIcon icon="fa-solid fa-wifi" />}</p>
                                                <p>{ control.sensor_type === "Ultrasonic Sensor 2" && <FontAwesomeIcon icon="fa-solid fa-wifi" />}</p>
                                                <p>{ control.sensor_type === "Ultrasonic Sensor 3" && <FontAwesomeIcon icon="fa-solid fa-wifi" />}</p>
                                                <p>{ control.sensor_type === "Soil Moisture Sensor 1" && <FontAwesomeIcon icon="fa-solid fa-seedling" />}</p>
                                                <p>{ control.sensor_type === "Soil Moisture Sensor 2" && <FontAwesomeIcon icon="fa-solid fa-seedling" />}</p>
                                                <p>{ control.sensor_type === "Soil Moisture Sensor 3" && <FontAwesomeIcon icon="fa-solid fa-seedling" />}</p>
                                                <p>{ control.sensor_type === "Heater" && <FontAwesomeIcon icon="fa-solid fa-fire" />}</p>
                                            </div>
                                            <div className = "control-value1">
                                                <p>{ control.sensor_type }</p>
                                            </div>
                                            <div className = "control-value2">
                                                <p style = { { color: control.power === 1 ? "teal" : "orange" } }>{ control.power === 1 ? "▲" : "▼"}</p>
                                            </div>
                                            <div className = "control-value3">
                                                <p>{ control.measures }</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className = "harvest-box-sort">
                        <h4 className = "monitoring-title">Available Harvest</h4>
                        <div className = "harvest-box">
                            <video src = ""></video>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Summary;