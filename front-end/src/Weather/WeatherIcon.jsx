import React, { useEffect, useState } from "react";

const WeatherIcon = ({ getWeatherIcon }) => {
    const [weatherIcon, setWeatherIcon] = useState('');
    const [iconStatus, setIconStatus] = useState('');

    useEffect(() => {
        setWeatherIcon(getWeatherIcon);
    }, [getWeatherIcon]);
    /* 
        -> props 전달로 받아온 OpenWeatherMap icon을 Meteocons icon URL 형식에 맞게 변환
    */
    useEffect(() => {
        let iconUrl = '';

        switch (weatherIcon) {
            case '01d':
                iconUrl = 'clear-day';
                break;
            case '01n':
                iconUrl = 'clear-night';
                break;
            case '02d':
                iconUrl = 'partly-cloudy-day';
                break;
            case '02n':
                iconUrl = 'partly-cloudy-night';
                break;
            case '03d':
            case '03n':
                iconUrl = 'cloudy';
                break;
            case '04d':
            case '04n':
                iconUrl = 'overcast';
                break;
            case '09d':
            case '09n':
                iconUrl = 'overcast-rain';
                break;
            case '10d':
                iconUrl = 'partly-cloudy-day-rain';
                break;
            case '10n':
                iconUrl = 'partly-cloudy-night-rain';
                break;
            case '11d':
            case '11n':
                iconUrl = 'thunderstorms-overcast';
                break;
            case '13d':
            case '13n':
                iconUrl = 'snow';
                break;
            case '50d':
            case '50n':
                iconUrl = 'fog-day';
                break;
            default:
                iconUrl = 'unknown';
                break;
        }

        setIconStatus(iconUrl);
    }, [weatherIcon]);

    if (!getWeatherIcon) {
        return null;
    }

    return <img src={`https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/${iconStatus}.svg`} />
};

export default WeatherIcon;
