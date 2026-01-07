import React from "react";
import { format } from "date-fns";
import { useWeatherFetch } from "../../hooks/use-weather-fetch";

interface SunStateProps {
  weatherData: Record<string, any>;
  type: 'sunrise' | 'sunset';
}

const SortedSunState = ({ weatherData, type }: SunStateProps): JSX.Element => {
  if (Object.keys(weatherData).length === 0) return <></>;

  const timestamp = weatherData.sys?.[type]; // Unix timestamp in seconds
  const date = new Date(timestamp * 1000); // Convert to milliseconds

  return (
    <>
      <div className="sun-status">
        <img src={`https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/${type}.svg`} alt={type} />
      </div>
      <div className="value">
        <h6>{type.charAt(0).toUpperCase() + type.slice(1)}</h6>
        <span>
          {format(date, "h:mm a")} {/* Format the date */}
        </span>
      </div>
    </>
  );
}

export const SunState = (): JSX.Element => {
  const { weatherMapData } = useWeatherFetch();

  return (
    <div className="box">
      <h4>Sunrise & Sunset</h4>
      <div className="sunrise-and-sunset">
        <SortedSunState weatherData={weatherMapData} type="sunrise" />
        <SortedSunState weatherData={weatherMapData} type="sunset" />
      </div>
    </div>
  );
};
