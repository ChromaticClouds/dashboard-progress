import React, { useEffect, useState } from "react";
import axios from "axios";

import useCurrentPosition from "../hooks/useCurrentPosition";
import { openWeatherUrl } from "../utils/weatherApi";

const REFRESH_MS = 10 * 60 * 1000;

const MediumForecast = ({ hostForecast, hostAirCondition }) => {
    // 위치는 공용 훅에서 받는다. 5일 예보·대기질은 위치가 바뀌면 바로, 그렇지 않으면 10분마다 다시 받는다.
    const position = useCurrentPosition();
    /**
     *  - # OpenWeatherMap API GET 요청
     */
    const [fiveDaysForecast, setFiveDaysForecast] = useState([]);
    const [airCondition, setAirCondition] = useState([]);

    const getForecast = async (lat, lon) => {
        const url = openWeatherUrl('forecast', lat, lon);

        try {
            const response = await axios.get(url);
            setFiveDaysForecast(response.data.list);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    const getAirPollution = async (lat, lon) => {
        const url = openWeatherUrl('air_pollution', lat, lon);

        try {
            const response = await axios.get(url);
            setAirCondition(response.data.list);
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    useEffect(() => {
        if (!position) return;

        const load = () => {
            getForecast(position.latitude, position.longitude);
            getAirPollution(position.latitude, position.longitude);
        };

        load();
        const timer = setInterval(load, REFRESH_MS);
        return () => clearInterval(timer);
    }, [position]);

    useEffect(() => {
        hostForecast(fiveDaysForecast);
    }, [fiveDaysForecast]);

    useEffect(() => {
        hostAirCondition(airCondition);
    }, [airCondition])

    return <div></div>;
};

export default MediumForecast;