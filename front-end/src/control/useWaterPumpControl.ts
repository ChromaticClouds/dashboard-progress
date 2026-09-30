import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";
import type { SensorData } from "./useSensorStatus";

const getNumberFromLocalStorage = (key: string, fallback: number): number => {
  const saved = localStorage.getItem(key);
  return saved !== null ? Number(saved) : fallback;
};

const getFormattedWateringTime = (recentDate: Date) => {
  const nowDate = new Date();
  const millis = nowDate.getTime() - recentDate.getTime();
  const diffMinutes = Math.floor(millis / 1000 / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes <= 59) {
    return diffMinutes === 0 ? "just before" : diffMinutes + " minutes ago";
  }
  if (diffHours <= 23) {
    return diffHours + " hours ago";
  }
  if (diffDays <= 364) {
    return diffDays + " days ago";
  }
  return diffYears + " years ago";
};

const useWaterPumpControl = (
  enabled: boolean,
  sensorData: SensorData,
  recentDate: Date,
) => {
  const socket = useSocket();
  const [intensity, setIntensity] = useState<number>(() =>
    getNumberFromLocalStorage("intensity-data", 0),
  );
  const [duration, setDuration] = useState<number>(() =>
    getNumberFromLocalStorage("duration-data", 0),
  );
  const [isPushed, setIsPushed] = useState(false);

  const handleIntensityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const intensityValue = Number(event.target.value);
    setIntensity(intensityValue);
    localStorage.setItem("intensity-data", String(intensityValue));
  };

  const handleDurationChange = (event: ChangeEvent<HTMLInputElement>) => {
    const durationValue = Number(event.target.value);
    setDuration(durationValue);
    localStorage.setItem("duration-data", String(durationValue));
  };

  const handlePush = () => {
    setIsPushed(true);
    setTimeout(() => {
      setIsPushed(false);
    }, 100);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (enabled) {
        socket.emit("intensity req", intensity);
        socket.emit("duration req", duration);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [enabled, intensity, duration, socket]);

  const lastWateredText = getFormattedWateringTime(recentDate);

  return {
    intensity,
    duration,
    isPushed,
    handleIntensityChange,
    handleDurationChange,
    handlePush,
    waterLevel: sensorData.water_level ?? 0,
    soilHumidity: sensorData.soil_humidity ?? 0,
    lastWateredText,
  };
};

export default useWaterPumpControl;
