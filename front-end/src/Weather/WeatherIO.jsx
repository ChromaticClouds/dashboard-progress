import React, { useRef, useEffect, useState } from "react";
import moment from 'moment-timezone';
import './WeatherIO.css';
import WeatherIcon from './WeatherIcon';
import MediumForecast from './MediumForcast'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * @typedef {Object} Weather
 * @property {string} icon - The icon representing the weather condition.
 * @property {string} description
 */

/**
 * @typedef {Object} WeatherMap
 * @property {Weather[]} weather - Array of weather conditions.
 */

/**
 * WeatherComponent component.
 * @returns {JSX.Element} The rendered component.
 */
const WeatherIO = ({ viewWeather, viewWeatherMap, viewIcon }) => {
    const [showWeather, setShowWeather] = useState([]);

     /** @type {[WeatherMap, React.Dispatch<React.SetStateAction<WeatherMap>>]} */
    const [weatherMap, setWeatherMap] = useState([]);

    useEffect(() => {
        setShowWeather(viewWeather);
    }, [viewWeather]);

    useEffect(() => {
        setWeatherMap(viewWeatherMap);
    }, [viewWeatherMap]);
    /**
     *  현재 날짜 및 시간 가져오기
     */
    const now = moment();

    const getDateString = () => {
        const date = moment().format('YYYYMMDD');
        return date
    }

    const getHourString = () => {
        const hour = moment().format('HH00');
        return hour;
    }
    /**
     *  기상 캐스트 리스트 마다 날짜 대조
     */
    const [nowForecast, setNowForecast] = useState([]);
    
    useEffect(() => {
        const currentDate = getDateString();
        const currentHour = getHourString();
        
        if (showWeather.length > 0) {
            const castedList = showWeather.filter(forecast => 
                forecast.fcstDate === currentDate && forecast.fcstTime === currentHour
            );
            setNowForecast(castedList);
        }
    }, [showWeather]);
    /**
     *  현재 온도 가져오기
     */
    const [nowTemp, setNowTemp] = useState(null);

    useEffect(() => {
        if (nowForecast.length > 0) {
            const currentTempList = nowForecast.filter(forecast => 
                forecast.category === "TMP"
            );
            setNowTemp(currentTemp(currentTempList));
        }
    }, [nowForecast]);
    
    const currentTemp = (list) => {
        if (list.length > 0) {
            return parseInt(list[0].fcstValue);
        }
    };
    /**
     * 현재 날씨 아이콘 조회
     */
    const [currentIcon, setCurrentIcon] = useState(null);
    const [description, setDescription] = useState(null);

    useEffect(() => {
        if (weatherMap && weatherMap.weather) {
            setCurrentIcon(weatherMap.weather[0].icon)
            setDescription(weatherMap.weather[0].description);
        }
        // Meteocons 변환된 아이콘을 props로 전달
        viewIcon(<WeatherIcon getWeatherIcon = {currentIcon}/>);
    }, [weatherMap]);
    /**
     * 현재 날짜 포맷팅
     */
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        const formatted = now.format('dddd DD, MMMM');
        setFormattedDate(formatted);
    }, [now.date()]);
    /**
     * 중기 예보 데이터 상태관리 --------------------------------- *
     */
    const [mediumForecast, setMediumForecast] = useState([]);
    /**
     *  - # 1. 현재 시간 기준, 예보 시간 호출
     */
    const forecastHour = ['03:00:00', '06:00:00', '09:00:00', '12:00:00', '15:00:00', '18:00:00', '21:00:00', '00:00:00'];

    const [castHour, setCastHour] = useState('');

    const getCurrentHourIndex = () => {
        const currentHour = moment(now).format('HH:mm:ss');
        const index = forecastHour.findIndex(hour => moment(hour, 'HH:mm:ss').isAfter(moment(currentHour, 'HH:mm:ss')));
        return index === -1 ? forecastHour.length - 1 : index;
    };
    
    const getClosestHour = () => {
        const index = getCurrentHourIndex();
        return forecastHour[index];
    };

    useEffect(() => {
        setCastHour(getClosestHour());
    }, [now.hour()]);
    /**
     *  - # 2. 다음 날부터 5일 차까지 날짜 호출
     */
    const [dates, setDates] = useState([]);

    useEffect(() => {
        let datesArray = [];

        for (let i = 0; i < 5; i++) {
            let forecastDate = moment(now).clone().add(i, 'day').format('YYYY-MM-DD');
            datesArray.push(forecastDate);
            setDates(datesArray);
        }
    }, [now.date()]);
    /**
     *  - # 3. 날짜 배열과 시간 스트링 결합
     */
    const [bindString, setBindString] = useState([]);

    let formattedDates = [];

    useEffect(() => {
        formattedDates = [];

        if (dates.length > 0 && castHour !== '') {
            dates.forEach(day => {
                formattedDates.push(`${day} ${castHour}`);
            });
        }
        setBindString(formattedDates);
    }, [dates, castHour]);
    /**
     *  - # 4. API 데이터와 결합
     */
    const [fiveDays, setFiveDays] = useState([]);

    const kelvinToCelsius = (kelvin) => (kelvin - 273.15).toFixed(0);

    useEffect(() => {
        if (mediumForecast.length > 0 && bindString.length > 0) {
            const fiveDaysList = mediumForecast.filter(forecast =>
                bindString.some(days => forecast.dt_txt === days)
            );

            const weatherData = fiveDaysList.map(forecast => ({
                icon: forecast.weather[0].icon,
                temp: kelvinToCelsius(forecast.main.temp)
            }));

            setFiveDays(weatherData);
        }
    }, [mediumForecast, bindString]);
    /**
     *  "현재 날짜 + 3시간 단위" <-- 스트링 바인딩
     */
    const [bindTime, setBindTime] = useState([])

    useEffect(() => {
        const times = forecastHour.map(time => 
            `${moment(now).format('YYYY-MM-DD')} ${time}`
        );
        setBindTime(times);
    }, [now.date()]);
    /**
     *  현재 날짜로부터 3시간별로 날씨 조회
     */
    const [shortForecast, setShortForecast] = useState([]);

    useEffect(() => {
        if (mediumForecast.length > 0 && bindTime.length > 0) {
            const weatherList = mediumForecast.filter(forecast =>
                bindTime.some(time => forecast.dt_txt === time)
            )

            const weatherData = weatherList.map(forecast => ({
                hour: moment(forecast.dt_txt).format('h A'),
                icon: forecast.weather[0].icon,
                temp: kelvinToCelsius(forecast.main.temp),
                wind: {
                    deg: forecast.wind.deg,
                    speed: forecast.wind.speed
                }
            }));

            setShortForecast(weatherData);
        }
    }, [mediumForecast, bindTime])

    return (
        <div className="board weatherio-container">
            <div className="contents">
                <h4 className="subtitle">Weather Cast</h4>
                <section className="binding-container">
                    <section className="status-container">
                        <div className="box">
                            {/* 
                                - # 현재 날씨
                            */}
                            <div className="blue-circle"></div>
                            <h3>Now</h3>
                            <div className="temp-and-icon">
                                <div className="temp">
                                    {nowTemp !== null ? (
                                        <>
                                            <h1 className="temp-value">{nowTemp}</h1>
                                            <h2>℃</h2>
                                        </>
                                    ) : (
                                        <h1 className="temp-value">...</h1>
                                    )}
                                </div>
                                {/*
                                    - # 날씨 이미지 삽입
                                */}
                                <div className="icon">
                                    <WeatherIcon getWeatherIcon = {currentIcon}/> {/* <-- icon props 전달 */}
                                </div>
                            </div>
                            <span>{description}</span>
                            {/*
                               < ---------- 구분선 ---------- >
                            */}
                            <div className="line"></div>
                            <div className="date-and-region">
                                <div className="icon">
                                    <div>
                                        <div>
                                            <FontAwesomeIcon icon="fa-regular fa-calendar" />
                                        </div>
                                        <h6>{formattedDate}</h6>
                                    </div>
                                    <div>
                                        <div>
                                            <FontAwesomeIcon icon="fa-solid fa-location-dot" />
                                        </div>
                                        <h6>{`${weatherMap.name}, ${weatherMap.sys ? weatherMap.sys.country : ''}`}</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h3 className="title">5 Days Forecast</h3>
                        {/*
                            - # 중기예보 조회
                         */}
                        <MediumForecast hostForecast={setMediumForecast}/>
                        <div className="box five-days">
                            <div className="blue-cycle"></div>
                            <div className="sort">
                                <div className="weather-icons">
                                    {fiveDays.map((data, index) => (
                                        <div key = {index} className="icon-and-temp">
                                            <WeatherIcon getWeatherIcon={data.icon}/>
                                            {data.temp}°
                                        </div>
                                    ))}
                                </div>
                                <div className="each-days">
                                    {dates.map((date, index) => (
                                        <div key={index} className="dates">
                                            <div className="days">
                                                {moment(date).format('D, MMM')}
                                            </div>
                                            <div className="weeks">
                                                {moment(date).format('dddd')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                    {/**
                     *  <---------- # 섹션 분리 # ---------->
                     */}
                    <section className="weather-container">
                        <div className="highlight-box">
                            <h3>Today Highlights</h3>
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
                        {/*
                            - # 3시간 단위로 날씨 조회
                        */}
                        <h3 className="title">Today at</h3>
                        <div className="today-at-box">
                            {shortForecast.map((forecast, index) => (
                                <div key={index} className="shortcasts">
                                    <div className="blue-circle"></div>
                                    <span>{forecast.hour}</span>
                                    <span className="icon">
                                        <WeatherIcon getWeatherIcon={forecast.icon}/>
                                    </span>
                                    <span>{forecast.temp}°</span>
                                </div>
                            ))}
                        </div>
                        {/*
                            - # 3시간 단위로 풍향, 풍속 조회
                        */}
                        <div className="today-at-box sort">
                            {shortForecast.map((forecast, index) => (
                                <div key={index} className="shortcasts wind">
                                    <div className="blue-circle"></div>
                                    <span>{forecast.hour}</span>
                                    <div className="arrow">
                                        <FontAwesomeIcon 
                                            icon="fa-solid fa-location-arrow" 
                                            style={{transform: `rotate(${-45 + forecast.wind.deg}deg)`}} // 기존 아이콘 방향이 45 기울어진 상태
                                        />
                                    </div>
                                    <span>{forecast.wind.speed.toFixed(0)} km/h</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </section>
            </div>
        </div>
    );
};

export default WeatherIO;
