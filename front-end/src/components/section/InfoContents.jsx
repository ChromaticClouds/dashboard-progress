import React, { useEffect, useState } from "react";
import Weather2 from "../../Dashboard/Weather2";
import Calendar from "../../TodoList/Calendar";
import TodayTodos from "../../TodoList/TodayTodos";
import Loading from "../../Dashboard/Loading/Loading";
import WeatherIcon from "../../Weather/WeatherIcon";
import Retry from "../Retry";

import useWeatherStore from "../../hooks/useWeatherStore";
import useMonthEventStore from "../../hooks/useMonthEvents";
import useCalendarEvents from "../../hooks/useCalendarEvents";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const InfoContents = () => {
    const { weatherIcon, currentWeather } = useWeatherStore();
    const { getMonthEvents } = useMonthEventStore();
    const { currentDate } = useCalendarEvents();

    const [rotated, set_rotated] = useState(false);

    const rotate = () => {
        set_rotated(!rotated);
    }

    const hostCalendar = () => {
        getMonthEvents(currentDate.year, currentDate.month);
    }

    return (
        <div>
            <div className = "info-content">
                <div className="weather-content" style = {{
                    top: rotated ? '30px' : '460px',
                    transition: 'top 0.5s ease-in-out'
                }}>
                    <FontAwesomeIcon
                        icon="fa-solid fa-chevron-up" 
                        className="content-up"
                        onClick = { rotate }
                        style = {{
                            transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease-in-out'
                        }} // 버튼 클릭 시, 위젯 슬라이드 업
                    />
                    <Weather2 />
                    <div className="calendar" style = {{ 
                        marginBottom: rotated ? "40px" : "480px"
                    }}>
                        <div className='flat'>
                            <h4 className = "today-weather">Calendar</h4>
                            <Retry hostClick={hostCalendar} />
                        </div>
                        <Calendar 
                            toChangePost={()=>{}}
                        />
                        <TodayTodos />
                    </div>
                </div>
                <div className="info-box">
                    <h4 className="now">Now</h4>
                    <div className="main-info">
                        {weatherIcon ? (
                            <WeatherIcon getWeatherIcon={weatherIcon} />
                        ) : (
                            <Loading />
                        )}
                        <span>{ currentWeather.temp }°</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default InfoContents;