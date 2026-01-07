import React, { useEffect, useState } from "react";
import { WeatherIcon } from "./weather-icon";
import { useForecastFetch } from "../../hooks/use-forecast-fetch";
import { forecastHour } from "../../data/clock";
import { addDays, format, isAfter, parse } from "date-fns";
import { useTick } from "../../hooks/use-tick";
import { getCurrentHourIndex } from "../../utils/time-utils";

export const FiveDaysForecast = (): JSX.Element => {
  const [mediumForecast, setMediumForecast] = useState<any[]>([]);

  useForecastFetch({ hostForecast: setMediumForecast });

  const [castHour, setCastHour] = useState("");

  const getClosestHour = () => forecastHour[getCurrentHourIndex()];

  const currentHour = useTick("hour");

  useEffect(() => {
    setCastHour(getClosestHour());
  }, [currentHour]);

  const [dates, setDates] = useState<string[]>([]);

  const currentDate = useTick("date");

  useEffect(() => {
    const newDates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const forecastDate = format(addDays(new Date(), i), "yyyy-MM-dd");
      newDates.push(forecastDate);
    }
    setDates(newDates);
  }, [currentDate]);

  const [bindString, setBindString] = useState<string[]>([]);

  useEffect(() => {
    if (dates.length > 0 && castHour) {
      const formattedDates = dates.map((day) =>
        format(new Date(`${day} ${castHour}`), "yyyy-MM-dd HH:mm:ss")
      );
      setBindString(formattedDates);
    }
  }, [dates, castHour]);

  const kelvinToCelsius = (kelvin: number) => (kelvin - 273.15).toFixed(0);

  const [fiveDays, setFiveDays] = useState<any[]>([]);

  useEffect(() => {
    if (mediumForecast.length > 0 && bindString.length > 0) {
      const filteredForecasts = mediumForecast.filter((forecast) =>
        bindString.includes(forecast.dt_txt)
      );

      const weatherData = filteredForecasts.map((forecast) => ({
        icon: forecast.weather[0].icon,
        temp: kelvinToCelsius(forecast.main.temp),
      }));

      setFiveDays(weatherData);
    }
  }, [mediumForecast, bindString]);

  return (
    <div className="box five-days">
      <div className="blue-cycle"></div>
      <div className="sort">
        <div className="weather-icons">
          {fiveDays.map((data, index) => (
            <div key={index} className="icon-and-temp">
              <WeatherIcon getWeatherIcon={data.icon} />
              {data.temp}°
            </div>
          ))}
        </div>
        <div className="each-days">
          {dates.map((date, index) => (
            <div key={index} className="dates">
              <div className="days">{format(date, "d, MMM")}</div>
              <div className="weeks">{format(date, "eeee")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
