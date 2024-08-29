import React, { useEffect, useState } from "react";
import axios from "axios";

const MediumForecast = ({ hostForecast, hostAirCondition }) => {
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null
    })

    const apiKey = import.meta.env.VITE_FORECAST_KEY;
    /**
     *  - # 위치 호출 메서드
     */
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
    /**
     *  - # OpenWeatherMap API GET 요청
     */
    const [fiveDaysForecast, setFiveDaysForecast] = useState([]);
    const [airCondition, setAirCondition] = useState([]);

    const getForecast = async (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`

        try {
            const response = await axios.get(url);
            setFiveDaysForecast(response.data.list);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    const getAirPollution = async (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`

        try {
            const response = await axios.get(url);
            setAirCondition(response.data.list);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    useEffect(() => {
        if (location.latitude && location.longitude) {
            getForecast(location.latitude, location.longitude);
            getAirPollution(location.latitude, location.longitude)
        }
    }, [location]);

    useEffect(() => {
        hostForecast(fiveDaysForecast);
    }, [fiveDaysForecast]);

    useEffect(() => {
        hostAirCondition(airCondition);
    }, [airCondition])

    return <div></div>;
};

export default MediumForecast;