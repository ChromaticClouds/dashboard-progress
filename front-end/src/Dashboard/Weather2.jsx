import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from '@fortawesome/free-solid-svg-icons';

import useWeatherStore from '../hooks/useWeatherStore';

import WindSub from "../components/chart/SubChart2";
import Loading from './Loading/Loading';
import Retry from '../components/Retry';

import './Weather.css';

import dfs_xy_conv from '../hooks/coords/intoCoord';
import useCurrentPosition from '../hooks/useCurrentPosition';
import { kmaVillageForecastRequest } from '../utils/weatherApi';

// 마지막으로 받은 단기예보. 같은 발표 시각이면 재방문 때 바로 보여주고 뒤에서 갱신한다.
const FORECAST_CACHE_KEY = 'smartfarm:kma-village-forecast';

const readForecastCache = (baseKey) => {
    try {
        const cached = JSON.parse(localStorage.getItem(FORECAST_CACHE_KEY));
        return cached?.baseKey === baseKey && Array.isArray(cached.items) ? cached.items : null;
    } catch {
        return null;
    }
};

const writeForecastCache = (baseKey, items) => {
    try {
        localStorage.setItem(FORECAST_CACHE_KEY, JSON.stringify({ baseKey, items }));
    } catch {
        // 저장 공간이 없으면 캐시 없이 동작한다.
    }
};

const Weather2 = () => {
    const [weather, setWeather] = useState({});

    const { setWeatherData, setCurrentWeather, setWeatherError } = useWeatherStore();
   
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

    // 위치는 공용 훅에서 받는다. 권한 거부·시간 초과면 기본 좌표가 온다.
    const position = useCurrentPosition();
    const grid = position ? dfs_xy_conv("toXY", position.latitude, position.longitude) : null;
    const gridX = grid?.x ?? null;
    const gridY = grid?.y ?? null;

    // 같은 예보 격자 안에서 위치가 조금 바뀐 것만으로는 다시 요청하지 않는다.
    useEffect(() => {
        if (gridX && gridY) {
            hostWeather();
        }
    }, [gridX, gridY]);

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
    const [error, setError] = useState(null);

    // 어제 같은 시각에 발표된 예보를 쓴다. 오늘의 최고·최저 기온(TMX·TMN)이 모두 들어 있다.
    const forecastBase = (now) => ({
        baseDate: now.clone().subtract(1, 'days').format('YYYYMMDD'),
        baseTime: now.clone().subtract(1, 'days').hours(getBaseHour()).format('HH00'),
    });

    const applyForecast = (items, now) => {
        setWeatherData(items);
        parseWeather(items, now.format('YYYYMMDD'), now.clone().add(1, 'days').format('YYYYMMDD'), now);
    };

    // 같은 발표 시각의 예보를 저장해 두었으면 위치·응답을 기다리지 않고 먼저 보여준다.
    useEffect(() => {
        const now = moment();
        const { baseDate, baseTime } = forecastBase(now);
        const cached = readForecastCache(`${baseDate}${baseTime}`);
        if (cached) applyForecast(cached, now);
    }, []);

    const hostWeather = async () => {
        if (!gridX || !gridY) return;

        try {
            setLoading(true);
            setError(null);

            const now = moment();
            const { baseDate, baseTime } = forecastBase(now);
            const { url, params } = kmaVillageForecastRequest({ baseDate, baseTime, nx: gridX, ny: gridY });

            const response = await axios.get(url, { params });
            const items = response.data?.response?.body?.items?.item;
            if (!Array.isArray(items)) {
                throw new Error(response.data?.response?.header?.resultMsg ?? '단기예보 응답 형식 오류');
            }

            applyForecast(items, now);
            writeForecastCache(`${baseDate}${baseTime}`, items);
            setWeatherError(false);
        } catch (err) {
            console.error('단기예보 조회 실패:', err.message);
            setError(err);
            setWeatherError(true);
        } finally {
            setLoading(false);
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

    // 단기예보 카드는 단기예보 데이터만으로 판단한다. 바람·기압용 OpenWeatherMap 응답과 무관하다.
    const hasForecast = Boolean(todayWeather.month);

    const forecastFallback = (
        <div className='center'>
            {error && !hasForecast ? <span className='weather-error'>날씨 정보를 불러오지 못했어요</span> : <Loading />}
        </div>
    );

    return (
        <div className = 'weather-container'>
            <WindSub set_weather={setWeather}/>
            <div className='flat'>
                <h4 className = "today-weather">Short-term forecast</h4>
                <Retry hostClick={hostWeather}/>
            </div>
            <article>
                <div className = "today-info">
                    {hasForecast ? (
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
                    ) : forecastFallback}
                </div>
                <div className = "today-info tomorrow">
                    {hasForecast ? (
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
                    ) : forecastFallback}
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