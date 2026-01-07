import React, { useEffect, useState } from "react";
import { WeatherIcon } from "./weather-icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { useWeatherStore } from "../../stores/use-weather.store";
import { useWeatherFetch } from "../../hooks/use-weather-fetch";

export const MainInfo = (): JSX.Element => {
  const { weatherData } = useWeatherStore();
  const { weatherMapData } = useWeatherFetch();

  const now = new Date();

  const date = format(now, "yyyyMMdd");
  const hour = format(now, "HH00");

  const [nowForecastList, setNowForecastList] = useState<Array<any>>([]);

  useEffect(() => {
    if (weatherData.length > 0) {
      const todayForecast = weatherData.filter(
        (forecast: any) =>
          forecast.fcstDate === date && forecast.fcstTime === hour
      );
      setNowForecastList(todayForecast);
    }
  }, [weatherData]);

  const [nowTemp, setNowTemp] = useState<number | null>(null);

  useEffect(() => {
    if (nowForecastList.length > 0) {
      const currentTempData = nowForecastList.find(
        (forecast: any) => forecast.category === "TMP"
      );
      if (currentTempData) {
        setNowTemp(parseInt(currentTempData.fcstValue));
      }
    }
  }, [nowForecastList]);

  return (
    <div className="box">
      {/* - # 현재 날씨 */}
      <div className="blue-circle"></div>
      <h3>Now</h3>
      <div className="temp-and-icon">
        <div className="temp">
          {nowTemp !== null ? (
            <>
              <h1 className="temp-value">{nowTemp}</h1>
              <h2>°Ｃ</h2>
            </>
          ) : (
            <h1 className="temp-value">...</h1>
          )}
        </div>
        {/* - # 날씨 이미지 삽입 */}
        <div className="icon">
          <WeatherIcon getWeatherIcon={weatherMapData.weather?.[0]?.icon} />{" "}
          {/* <-- icon props 전달 */}
        </div>
      </div>
      <span>{weatherMapData.weather?.[0]?.description}</span>
      {/*
        < ---------- 구분선 ---------- >
      */}
      <div className="line"></div>
      <div className="date-and-region">
        <div className="icon">
          <div>
            <div>
              <FontAwesomeIcon icon={faCalendar} />
            </div>
            <h6>{format(now, "EEEE dd, MMMM")}</h6>
          </div>
          <div>
            <div>
              <FontAwesomeIcon icon={faLocationDot} />
            </div>
            <h6>{`${weatherMapData.name}, ${
              weatherMapData.sys ? weatherMapData.sys.country : ""
            }`}</h6>
          </div>
        </div>
      </div>
    </div>
  );
};
