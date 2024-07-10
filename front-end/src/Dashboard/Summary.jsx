import { React, useEffect, useState } from "react";
import io from "socket.io-client";
import moment from "moment";
import LineChart from "../../Chart/LineChart";
import Monitoring from "../Monitoring/Monitoring";
import StreamChart from "../Prediction/StreamChart"

import "./Summary.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdCo2 } from "react-icons/md";
import { GiWateringCan } from "react-icons/gi";
import { PiPottedPlantFill } from "react-icons/pi";

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

    const [env, setEnv] = useState([]);
    const [growth, setGrowth] = useState([]);
    const [sensor, setSensor] = useState([]);
    const [dailyGrowth, setDailyGrowth] = useState([]);
    const [monitoring, setMonitoring] = useState([]);
    /**
     * # ----- 카테고리 버튼 호출에 따른 호스팅 스테이트 변경
     */
    const [host, setHost] = useState(1);

    useEffect(() => {
        const repeat = setInterval(() => {
            socket.emit("env req");
            socket.emit("sensor req")
            socket.emit("monitoring req");
        }, 2000);

        return () => {
            clearInterval(repeat);
        }
    }, []);
    /**
     * # ----- 호스팅 스테이트 변경에 따라 주기적으로 2초간 해당 데이터 요청
     */
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
    }, [host]);
    /*------------------------------------------*\ 
        - # 소켓 수신 성공 시, 스테이트 저장 # -
    \*------------------------------------------*/
    useEffect(() => {
        socket.on("env rec", (data) => {setEnv(data);});
        socket.on("weeks rec", (data) => {setGrowth(data);});
        socket.on("sensor rec", (data) => {setSensor(data);});
        socket.on("growth rec", (data) => {setDailyGrowth(data);});
        socket.on("monitoring rec", (data) => {setMonitoring(data);});
    }, []);

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
    /**
     *  - # 호스팅 스테이트에 따라 각 식물의 최근 일주일간 평균 성장량 및 날짜를 x, y 데이터로 저장
     */
    const plants = ['Plant1', 'Plant2', 'Plant3'];

    useEffect(() => {
        const growth = [
            {
                id: plants[host - 1],
                data: dailyGrowth.map(object => {
                    const day = moment(object.day);
                    const avg_growth = parseFloat(object.avg_growth.toFixed(1));
                    return {
                        x: day,
                        y: avg_growth
                    };
                }).filter(point => !isNaN(point.y)) // 수치형 외의 y값 필터링으로 오류 방지
            }
        ];

        setGrowthValue(growth);
    }, [dailyGrowth, host]);
    /**
     *  날짜 변경에 따른 스테이트 호출
     */
    const now = moment();

    const [currentDate, setCurrentDate] = useState();

    useEffect(() => {
        setCurrentDate(moment(now).format('MM/DD/YYYY'));
    }, [now.date()]);
    /**
     *  - # 센서 데이터(각 식물별 습도, 이번 주 물 공급량)를 배열별로 스테이트 저장
     */
    const [humidity, setHumidity] = useState([]);
    const [watering, setWatering] = useState(0);

    useEffect(() => {
        if (sensor.length > 0) {
            setHumidity(sensor[0]);
            setWatering(sensor[1].this_week_watering);
        }
    }, [sensor]);
    /**
     *  - # 초기 렌더링시, 센서데이터 존재 여부 상태관리
     */
    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        setHasValue(sensor.length > 0);
    }, [sensor]);

    const [hostValue, setHostValue] = useState([]);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        setIsEmpty(hostValue.length < 1)
    }, [hostValue])

    return (
        <div className = "board">
            <div className = "sub-contents">
                <div className = "category">
                    <div className="button-container">
                        {/* 
                            - # 버튼 호출에 따른 호스팅 스테이트 변경
                        */}
                        <div 
                            className = {`button first ${host === 1 ? "color" : ""}`} 
                            onClick = {() => setHost(1)}
                        >
                            Plant1
                        </div>
                        <div 
                            className = {`button ${host === 2 ? "color" : ""}`}
                            onClick = {() => setHost(2)}
                        >
                            Plant2
                        </div>
                        <div 
                            className = {`button ${host === 3 ? "color" : ""}`}
                            onClick = {() => setHost(3)}
                        >
                            Plant3
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
                        icon="fa-regular fa-calendar"
                        className="calendar-icon"
                    />
                    {currentDate} {/* 현재 날짜 반환 */}
                </div>
                <div className = "summary-container">
                    <div>
                        <div className = "summary-box">
                            <div className="blue-circle one"></div>
                            <div className="blue-circle another"></div>
                            <h4 className = "title">Plant growth activity</h4>
                            <div className = "chart">
                                {/*
                                    - # 차트 데이터 스테이트를 props로 전달하여 라인 차트 호출
                                 */}
                                <LineChart 
                                    data = { growthValue }
                                />
                            </div>
                            <div className="sort">
                                {growth.map((object, index) => (
                                    <div className = "growth-box" key = {index}>
                                        <div className = "status phase">
                                            <div className = {`
                                                    phase
                                                    ${
                                                        object.avg_growth <= 5 ? "seed-phase" :
                                                        object.avg_growth <= 15 ? "vegetation" : 
                                                        "final-growth"
                                                    }`
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
                                {growth.map((object, index) => (
                                    <div className = "week-box" key = {index}>
                                        <div className="week-value">
                                            <div className = {`
                                                    phase
                                                    ${
                                                        object.avg_growth <= 5 ? "seed-height" :
                                                        object.avg_growth <= 15 ? "vegetation-height" :
                                                        "final-growth-height"
                                                    }`
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
                                    {env.map((object, index) => (
                                        <div key={index}>
                                            {object.map((stat, index) => (
                                                <div 
                                                    key={index}
                                                    className = "stat-value"
                                                >
                                                    {stat.inner_temp != null ? stat.inner_temp + " °C" : ''}
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
                                    {env.map((object, index) => (
                                        <div key={index}>
                                            {object.map((stat, index) => (
                                                <div 
                                                    key={index}
                                                    className = "stat-value"
                                                >
                                                    {stat.inner_humid != null ? stat.inner_humid + " %" : ''}
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
                                    {env.map((object, index) => (
                                        <div key={index}>
                                            {object.map((stat, index) => (
                                                <div 
                                                    key={index}
                                                    className = "stat-value"
                                                >
                                                    {stat.brightness != null ? stat.brightness : ''}
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
                                <PiPottedPlantFill
                                    className="sensor-icon"
                                />
                            </div>
                            <div>
                                <h3>Soil Humidity</h3>
                                {hasValue ? humidity.map((name, id) => (
                                    <div key={id} className="soil-humid-id">{id === host - 1 ? name.plant_id : null}</div>
                                )) : null}
                            </div>
                            <div className="sensor-value">
                                {hasValue ? humidity.map((value, id) => (
                                    <div key={id} className="soil-humid-id">{id === host - 1 ? `${value.soil_humid} %` : null}</div>
                                )) : null}
                            </div>
                        </div>
                        <div className = "sensor-box">
                            <GiWateringCan 
                                className="sensor-icon"
                            />
                            <div>
                                <h3>Watering Amount</h3>
                                <div className = "sensor-disc">This Week</div>
                            </div>
                            <div className="sensor-value">
                                {hasValue && watering ? watering : 0}
                            </div>
                        </div>
                        <div className = "sensor-box">
                            <MdCo2 
                                className = "sensor-icon"
                            />
                            <div>
                                <h3>Co2 Density</h3>
                                <div className = "sensor-disc">Now</div>
                            </div>
                            <div className="sensor-value">
                                {hasValue && watering ? watering : 0}
                            </div>
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
                            <Monitoring monitoring={monitoring}/> {/* props로 센서 모니터링 sql 쿼리 전달 */}
                        </div>
                    </div>
                    <div className = "harvest-box-sort">
                        <h4 className = "monitoring-title">Available Harvest</h4>
                        <div>
                            {/* @todo: 생산가능성 표기 */}
                            <span>{`${isEmpty || isNaN(hostValue.slice(-1)[0]) ? '0 %' : `${hostValue.slice(-1)[0].toFixed(0)} %`}`}</span>
                            <StreamChart hostValue={setHostValue}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Summary;