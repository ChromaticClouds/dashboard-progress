import { useEffect } from 'react';

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

const WindSub = ({ set_weather }: WindSubProps): JSX.Element => {
  const api_key = '53c642d1e6caac8a761f075ad9f8951b';

  const get_location = (): void => {
    navigator.geolocation.getCurrentPosition(success, error);
  };

  useEffect(() => {
    get_location();

    const timer = setInterval(() => {
      get_location();
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const success = (position: GeolocationPosition): void => {
    const { latitude, longitude } = position.coords;
    getWeather(latitude, longitude);
  };

  const error = (err: GeolocationPositionError): void => {
    console.error('좌표를 받아올 수 없거나 권한이 없습니다.', err.message);
  };

  const getWeather = (latitude: number, longitude: number): void => {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${api_key}&units=metric&lang=kr`,
    )
      .then((response) => response.json() as Promise<WeatherResponse>)
      .then((json) => {
        set_weather(json);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return <div />;
};

export default WindSub;
