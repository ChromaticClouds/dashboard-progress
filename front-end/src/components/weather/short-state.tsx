import { faEye, faTemperatureHigh } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useWeatherFetch } from "../../hooks/use-weather-fetch";

type StateType = "humidity" | "pressure" | "visibility" | "feels_like";

interface StateValue {
  icon: ["image" | "icon", any],
  unit: string
}

const state: Record<StateType, StateValue> = {
  humidity: {
    icon: ["image", "https://bmcdn.nl/assets/weather-icons/v3.0/line/svg/humidity.svg"],
    unit: "%"
  },
  pressure: {
    icon: ["image", "https://bmcdn.nl/assets/weather-icons/v3.0/line/svg/pressure-low.svg"],
    unit: "hPa"
  },
  visibility: { 
    icon: ["icon", faEye],
    unit: "km"
  },
  feels_like: { 
    icon: ["icon", faTemperatureHigh],
    unit: "℃"
  }
}

const stateValue = (type: StateType, weatherData: Record<string, any>) => {
  if (Object.keys(weatherData).length > 0) {
    if (type === 'visibility') return (weatherData.visibility / 1000).toFixed(1);
    if (type === 'feels_like') return weatherData.main.feels_like.toFixed(0);
    return weatherData.main[type];
  }
  return null;
};

const formatTitle = (text: string) => {
  const replaced = text.replace('_', ' ');
  return replaced.charAt(0).toUpperCase() + replaced.slice(1);
};

export const ShortState = ({ showType } : { showType: StateType }) => {
  const { weatherMapData } = useWeatherFetch();

  return (
    <div className="box">
      <h4>{formatTitle(showType)}</h4>
      {/* @todo: 체감온도 삽입 */}
      <div className="icon">
        {state[showType].icon[0] === 'image' ? (
          <img src={state[showType].icon[1]}/>
        ): (
          <FontAwesomeIcon icon={state[showType].icon[1]}/>
        )}
      </div>
      <div className="status">
        <span>{stateValue(showType, weatherMapData)}</span>
        <p>{state[showType].unit}</p>
      </div>
    </div>
  );
};
