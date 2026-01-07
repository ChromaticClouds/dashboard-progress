import React, { useEffect, useState } from "react";
import { WeatherIcon } from "./weather-icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow } from "@fortawesome/free-solid-svg-icons";
import { useForecastFetch } from "../../hooks/use-forecast-fetch";
import { useTick } from "../../hooks/use-tick";
import { getCurrentHourIndex } from "../../utils/time-utils";
import { forecastHour } from "../../data/clock";
import { add, addHours, format } from "date-fns";

export const TodayAtState = () => {
  const [mediumForecast, setMediumForecast] = useState<any[]>([]);
  const [bindTime, setBindTime] = useState<string[]>([]);

  const currentHour = useTick("hour");

  useEffect(() => {
    const times: string[] = [];

    for (let i = 0; i < 8; i++) {
      const timeIndex = (getCurrentHourIndex() + i) % forecastHour.length;
      const dayOffset = Math.floor(
        (getCurrentHourIndex() + i) / forecastHour.length
      );

      times.push(
        `${format(
          add(new Date(), { days: dayOffset, hours: 9 }),
          "yyyy-MM-dd"
        )} ${forecastHour[timeIndex]}`
      );
    }

    setBindTime(times);
  }, [currentHour]);
  /**
   *  현재 날짜로부터 3시간별로 날씨 조회
   */
  const [shortForecast, setShortForecast] = useState<any[]>([]);

  const kelvinToCelsius = (kelvin: number) => (kelvin - 273.15).toFixed(0);

  useEffect(() => {
    if (mediumForecast.length > 0 && bindTime.length > 0) {
      const weatherList = mediumForecast.filter((forecast) => {
        const localTime = format(
          addHours(new Date(forecast.dt_txt), 9),
          "yyyy-MM-dd HH:mm:ss"
        );
        return bindTime.includes(localTime);
      });

      const weatherData = weatherList.map((forecast) => ({
        hour: format(addHours(new Date(forecast.dt_txt), 9), "h a"),
        icon: forecast.weather[0].icon,
        temp: kelvinToCelsius(forecast.main.temp),
        wind: { deg: forecast.wind.deg, speed: forecast.wind.speed },
      }));

      setShortForecast(weatherData);
    }
  }, [mediumForecast, bindTime, currentHour]);

  useForecastFetch({ hostForecast: setMediumForecast });

  return (
    <section>
      <div className="today-at-box">
        {shortForecast.map((forecast: any, index: number) => (
          <div key={index} className="shortcasts">
            <div className="blue-circle"></div>
            <span>{forecast.hour}</span>
            <span className="icon">
              <WeatherIcon getWeatherIcon={forecast.icon} />
            </span>
            <span>{forecast.temp}°</span>
          </div>
        ))}
      </div>
      {/*
        - # 3시간 단위로 풍향, 풍속 조회
      */}
      <div className="today-at-box sort">
        {shortForecast.map((forecast: any, index: number) => (
          <div key={index} className="shortcasts wind">
            <span>{forecast.hour}</span>
            <div className="arrow">
              <FontAwesomeIcon
                icon={faLocationArrow}
                style={{
                  transform: `rotate(${-45 + forecast.wind.deg}deg)`,
                }} // 기존 아이콘 방향이 45 기울어진 상태
              />
            </div>
            <span>{forecast.wind.speed.toFixed(0)} km/h</span>
          </div>
        ))}
      </div>
    </section>
  );
};