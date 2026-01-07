import React, { useEffect, useState } from "react";
import ky from "ky";
import { useWeatherFetch } from "./use-weather-fetch";

interface MediumForecastFetcher {
  hostForecast?: React.Dispatch<React.SetStateAction<any[]>>;
  hostAirCondition?: React.Dispatch<React.SetStateAction<any[]>>;
}

export const useForecastFetch = ({
  hostForecast,
  hostAirCondition,
}: MediumForecastFetcher) => {
  const { location } = useWeatherFetch();

  const apiKey = import.meta.env.VITE_FORECAST_KEY;
  /**
   *  - # OpenWeatherMap API GET 요청
   */
  const [fiveDaysForecast, setFiveDaysForecast] = useState<any[]>([]);
  const [airCondition, setAirCondition] = useState<any[]>([]);

  const getForecast = async (lat: number, lon: number) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
      const response: any = await ky.get(url).json();
      setFiveDaysForecast(response.list);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const getAirPollution = async (lat: number, lon: number) => {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
      const response: any = await ky.get(url).json();
      setAirCondition(response.list);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    if (location.latitude && location.longitude) {
      getForecast(location.latitude, location.longitude);
      getAirPollution(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    if (hostForecast) hostForecast(fiveDaysForecast);
  }, [fiveDaysForecast]);

  useEffect(() => {
    if (hostAirCondition) hostAirCondition(airCondition);
  }, [airCondition]);
};
