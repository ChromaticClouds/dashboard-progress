import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';

const WindSub = ({ set_weather }) => {
    const get_location = () => {
        navigator.geolocation.getCurrentPosition(success, error);
    }
    
    useEffect (() => {
        get_location();
    
        const timer = setInterval(() => { 
            get_location();
        }, 60000)
    
        return () => {
            clearInterval(timer);
        }
    }, [])
    
    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
    
        getWeather(latitude, longitude);
    }
    
    const error = () => {
        console.error("좌표를 받아올 수 없거나 권한이 없습니다.");
    }
    
    const api_key = '53c642d1e6caac8a761f075ad9f8951b'
    const getWeather = (latitude, longitude) => {
        fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric&lang=kr`
        )
        .then((response) => response.json())
        .then((json) => {
            set_weather(json);
        })
        .catch((err) => {
            console.error(err);
        });
    }

    return <div></div>
}

WindSub.propTypes = {
    set_weather: PropTypes.func.isRequired
};

export default WindSub;