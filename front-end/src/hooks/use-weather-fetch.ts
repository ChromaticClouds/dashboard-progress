import { useCallback, useEffect, useState } from "react";
import ky from 'ky';

const api_key = '53c642d1e6caac8a761f075ad9f8951b';

export const useWeatherFetch = () => {
  const [weatherMapData, setWeatherMapData] = useState<Record<string, any>>({});

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ 
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude
      });
    });
  }, []);

  const getWeatherData = useCallback(async () => {
    if (!location.latitude || !location.longitude) return;
  
    try {
      const response: object = await ky.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${api_key}&units=metric&lang=kr`
      ).json();
  
      setWeatherMapData(response);
    } catch (error) {
      console.error("날씨 정보를 가져오는 데 실패했습니다:", error);
    }
  }, [location]);

  useEffect(() => {
    getWeatherData();
    const timer = setInterval(() => {
      getWeatherData();
    }, 60000);

    return () => clearInterval(timer);
  }, [getWeatherData, location]);

  return { location, weatherMapData };
}