import React, { useEffect, useState } from "react";
import axios from "axios";

import useCurrentPosition from "../hooks/useCurrentPosition";
import { openWeatherUrl } from "../utils/weatherApi";

const MediumForecast = ({ hostForecast, hostAirCondition }) => {
    // 위치는 공용 훅에서 받는다. 5일 예보는 위치가 바뀔 때만 다시 요청한다.
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
        if (position) {
            getForecast(position.latitude, position.longitude);
            getAirPollution(position.latitude, position.longitude);
        }
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