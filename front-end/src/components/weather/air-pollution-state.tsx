import React, { useEffect, useState } from "react";
import { useForecastFetch } from "../../hooks/use-forecast-fetch";

const aqiState = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

type AirKeyTypes = "pm2_5" | "so2" | "no2" | "o3";

type AirTypes = Partial<Record<AirKeyTypes, string>>;

const airTypes: AirTypes[] = [
  { pm2_5: "PM2.5" },
  { so2: "SO2" },
  { no2: "NO2" },
  { o3: "O3" }
]

export const AirPollutionState = (): JSX.Element => {
  const [airCondition, setAirCondition] = useState<any[]>([]);
  const [pollution, setPollution] = useState<Record<string, any>>({});

  useForecastFetch({ hostAirCondition: setAirCondition });

  useEffect(() => {
    if (airCondition.length > 0) {
      const status = aqiState[airCondition[0].main.aqi];

      setPollution({
        status: status,
        condition: {
          pm2_5: airCondition[0].components.pm2_5,
          so2: airCondition[0].components.so2,
          no2: airCondition[0].components.no2,
          o3: airCondition[0].components.o3,
        },
      });
    }
  }, [airCondition]);

  return (
    <div className="box">
      <div className="flat">
        <h4>Air Quality Index</h4>
        <div
          className={`value ${pollution?.status?.toLowerCase()}`}
        >
          {pollution?.status}
        </div>
      </div>
      <div className="icon air">
        <img src="https://bmcdn.nl/assets/weather-icons/v3.0/fill/svg/mist.svg" />
      </div>
      <section>
        <div className="conditions">
          {airTypes.map((airType, index) => {
            const key = Object.keys(airType)[0] as AirKeyTypes;
            return (
              <div className="sort-on" key={index}>
                <h6>{airType[key]}</h6>
                <span>{pollution?.condition?.[key]}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}