import { useEffect } from 'react';

import useCurrentPosition from '../../hooks/useCurrentPosition';
import { fetchCurrentWeather } from '../../utils/weatherApi';

interface WeatherResponse {
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
}

interface WindSubProps {
  set_weather: (weather: WeatherResponse) => void;
}

const REFRESH_MS = 60000;

/**
 * 현재 위치의 OpenWeatherMap 현재 날씨를 받아 부모에게 넘긴다.
 * 위치는 useCurrentPosition이, 같은 좌표의 중복 요청은 fetchCurrentWeather가 정리한다.
 */
const WindSub = ({ set_weather }: WindSubProps): JSX.Element => {
  const position = useCurrentPosition();

  useEffect(() => {
    if (!position) return;

    const load = (): void => {
      fetchCurrentWeather(position.latitude, position.longitude)
        .then((json: WeatherResponse) => set_weather(json))
        .catch((err: Error) => console.error(err.message));
    };

    load();
    const timer = setInterval(load, REFRESH_MS);

    return () => {
      clearInterval(timer);
    };
  }, [position, set_weather]);

  return <div />;
};

export default WindSub;
