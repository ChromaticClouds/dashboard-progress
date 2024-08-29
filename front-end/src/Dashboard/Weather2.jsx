import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from '@fortawesome/free-solid-svg-icons';

import useWeatherStore from '../hooks/useWeatherStore';

import WindSub from "../../Chart/SubChart2";
import Loading from './Loading/Loading';
import Retry from '../components/Retry';

import './Weather.css';

import dfs_xy_conv from '../hooks/coords/intoCoord';

const Weather2 = () => {
    const [weather, setWeather] = useState({});

    const { setWeatherData, setCurrentWeather } = useWeatherStore();
   
    const [todayWeather, setTodayWeather] = useState({
        month: '',
        day: '',
        sky: '',
        pty: '',
        icon: null,
        icon2: null,
        temp: 0,
        maxTemp: 0,
        minTemp: 0
    });

    const [tomorrowWeather, setTomorrowWeather] = useState({
        month: '',
        day: '',
        sky: '',
        pty: '',
        icon: null,
        icon2: null,
        maxTemp: 0,
        minTemp: 0
    });

    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    });

    const [coords, setCoords] = useState({ 
        x: null, 
        y: null 
    });

    const getLocation = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            })
        });
    }
    /**
     *  - # 60초마다 위치 호출
     */
    useEffect(() => {
        getLocation();

        const interval = setInterval(() => {
            getLocation();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (location.latitude && location.longitude) {
            const rs = dfs_xy_conv("toXY", location.latitude, location.longitude);
            setCoords({ x: rs.x, y: rs.y });
        }
    }, [location]);

    useEffect(() => {
        if (coords.x && coords.y) {
            hostWeather();
        }
    }, [coords]);

    useEffect(() => {
        setCurrentWeather(todayWeather);
    }, [todayWeather]);

    const getBaseHour = () => {
        const hour = moment().hour();
        if (hour >= 23 || hour < 2) return '23';
        if (hour >= 20) return '20';
        if (hour >= 17) return '17';
        if (hour >= 14) return '14';
        if (hour >= 11) return '11';
        if (hour >= 8) return '08';
        if (hour >= 5) return '05';
        return '02';
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState([]);

    const hostWeather = async () => {
        try {
            setLoading(true);

            const now = moment();
            const baseTime = now.clone().subtract(1, 'days').hours(getBaseHour()).format('HH00');
            const baseDate = now.clone().subtract(1, 'days').format('YYYYMMDD');
            const today = now.format('YYYYMMDD');
            const tomorrow = now.clone().add(1, 'days').format('YYYYMMDD');
    
            const url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst';
            const serviceKey = 'TdQd3Xt%2B4OHiUyXW4OunKFr6rCLsJlVInxrkdZfIhQ45NtLhK4pmxQyEZSBnqfv2PS1%2BSxVF6h7h3GWe%2BlQXeQ%3D%3D';
    
            const response = await axios.get(url, {
                params: {
                    serviceKey: decodeURIComponent(serviceKey),
                    pageNo: '1',
                    numOfRows: '1000',
                    dataType: 'JSON',
                    base_date: baseDate,
                    base_time: baseTime,
                    nx: coords.x,
                    ny: coords.y
                }
            });
    
            const items = response.data.response.body.items.item;
            setWeatherData(items);
            parseWeather(items, today, tomorrow, now);

            setLoading(false);
        } catch (error) {
            setError(error);
        }
    };

    const parseWeather = (items, today, tomorrow, now) => {
        let today_temp, today_sky, today_pty, today_sky_icon, today_pty_icon, today_max_temp, today_min_temp;
        let tomorrow_sky, tomorrow_pty, tomorrow_sky_icon, tomorrow_pty_icon, tomorrow_max_temp, tomorrow_min_temp;

        items.forEach(item => {
            const { category, fcstDate, fcstTime, fcstValue } = item;

            const parsedValue = parseInt(fcstValue).toFixed(0);

            if (fcstDate === today && fcstTime === now.format('HH') + '00') {
                if (category === "TMP") today_temp = parsedValue;
                if (category === "SKY") {
                    [today_sky, today_sky_icon] = getSkyInfo(parsedValue);
                }
                if (category === "PTY") {
                    [today_pty, today_pty_icon] = getPtyInfo(parsedValue);
                }
            }
    
            if (fcstDate === today) {
                if (category === "TMX") today_max_temp = parsedValue;
                if (category === "TMN") today_min_temp = parsedValue;
            }
    
            if (fcstDate === tomorrow && fcstTime === now.format('HH') + '00') {
                if (category === "SKY") {
                    [tomorrow_sky, tomorrow_sky_icon] = getSkyInfo(parsedValue);
                }
                if (category === "PTY") {
                    [tomorrow_pty, tomorrow_pty_icon] = getPtyInfo(parsedValue);
                }
            }
    
            if (fcstDate === tomorrow) {
                if (category === "TMX") tomorrow_max_temp = parsedValue;
                if (category === "TMN") tomorrow_min_temp = parsedValue;
            }
        });

        setTodayWeather({
            month: now.format('MM'),
            day: now.format('DD'),
            sky: today_sky,
            pty: today_pty,
            icon: today_sky_icon,
            icon2: today_pty_icon,
            temp: today_temp,
            maxTemp: today_max_temp,
            minTemp: today_min_temp,
        });

        setTomorrowWeather({
            month: moment().add(1, 'days').format('MM'),
            day: moment().add(1, 'days').format('DD'),
            sky: tomorrow_sky,
            pty: tomorrow_pty,
            icon: tomorrow_sky_icon,
            icon2: tomorrow_pty_icon,
            maxTemp: tomorrow_max_temp,
            minTemp: tomorrow_min_temp,
        });
    };

    const getSkyInfo = (value) => {
        let sky, sky_icon;
        if (value === "1") {
            sky = "맑음";
            sky_icon = "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/clear-day.svg";
        } else if (value === "3") {
            sky = "구름 많음";
            sky_icon = "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/cloudy.svg";
        } else if (value === "4") {
            sky = "흐림";
            sky_icon = "https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/overcast.svg";
        }
        return [sky, sky_icon];
    };

    const getPtyInfo = (value) => {
        let pty, pty_icon;
        if (value === "0") {
            pty = "없음";
            pty_icon = null;
        } else if (value === "1") {
            pty = "비";
            pty_icon = 'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/rain.svg';
        } else if (value === "2") {
            pty = "비/눈";
            pty_icon = 'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/sleet.svg';
        } else if (value === "3") {
            pty = "눈";
            pty_icon = 'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/snow.svg';
        } else if (value === "4") {
            pty = "소나기";
            pty_icon = 'https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/extreme-rain.svg';
        }
        return [pty, pty_icon];
    };

    const [hasValue, setHasValue] = useState(false);

    useEffect(() => {
        setHasValue(Object.keys(weather).length > 0);
    }, [weather]);

    return (
        <div className = 'weather-container'>
            <WindSub set_weather={setWeather}/>
            <div className='flat'>
                <h4 className = "today-weather">Short-term forecast</h4>
                <Retry hostClick={hostWeather}/>
            </div>
            <article>
                <div className = "today-info">
                    {hasValue && !loading ? (
                        <section>
                            <img src = {!todayWeather.icon2 ? todayWeather.icon : todayWeather.icon2} className = 'weather-icon'/>
                            <div className = 'weather-info'>
                                {todayWeather.month}월 {todayWeather.day}일
                                    <br />
                                {!todayWeather.icon2 ? todayWeather.sky : todayWeather.pty}
                            </div>
                            <div className = "temp-info">
                                {todayWeather.maxTemp}° / {todayWeather.minTemp}°
                            </div>
                        </section>
                    ) : (
                        <div className='center'>
                            <Loading />
                        </div>
                    )}
                </div>
                <div className = "today-info tomorrow">
                    {hasValue && !loading ? (
                        <section>
                            <img src={!tomorrowWeather.icon2 ? tomorrowWeather.icon : tomorrowWeather.icon2} className = 'weather-icon'/>
                            <div className = 'weather-info'>
                                {tomorrowWeather.month}월 { tomorrowWeather.day}일
                                    <br/>
                                {!tomorrowWeather.icon2 ? tomorrowWeather.sky : tomorrowWeather.pty}
                            </div>
                            <div className = "temp-info tomorrow">
                                {tomorrowWeather.maxTemp}° / {tomorrowWeather.minTemp}°
                            </div>
                        </section>
                    ) : (
                        <div className='center'>
                            <Loading />
                        </div>
                    )}
                </div>
            </article>
            <div className = 'line'></div>
            <div className = 'status-container'>
                <div className = 'status-box'>
                    <div className = 'box-icon'>
                        <FontAwesomeIcon icon="fa-solid fa-wind" />
                    </div>
                    <span>{weather.main ? weather.main.pressure + "hpa": 0 + "hpa"}</span>
                    <p>pressure</p>
                </div>
                <div className = 'status-box'>
                    <div className = 'box-icon visibility'>
                        <FontAwesomeIcon icon="fa-solid fa-eye" />
                    </div>
                    <span>{weather.visibility ? (weather.visibility / 1000).toFixed(0) + "km" : 0 + "km"}</span>
                    <p>visibility</p>
                </div>
                <div className = 'status-box'>
                    <div className = 'box-icon humidity'>
                        <FontAwesomeIcon icon="fa-solid fa-droplet" />
                    </div>
                    <span>{weather.main ? weather.main.humidity + "%" : 0 + "%"}</span>
                    <p>humidity</p>
                </div>
            </div>
        </div>
    )
}

export default Weather2;