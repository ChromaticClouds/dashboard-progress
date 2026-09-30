import { useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";

type SensorData = {
  water_level?: number;
  temperature?: number;
  humidity?: number;
  soil_humidity?: number;
};

const useSensorStatus = () => {
  const socket = useSocket();
  const [sensorData, setSensorData] = useState<SensorData>({});
  const [recentDate, setRecentDate] = useState<Date>(() => new Date());

  useEffect(() => {
    socket.emit("sensor data req");
    socket.emit("recent watering req");

    const repeat = setInterval(() => {
      socket.emit("sensor data req");
      socket.emit("recent watering req");
    }, 2000);

    return () => clearInterval(repeat);
  }, [socket]);

  useEffect(() => {
    socket.on("sensor data", (data) => {
      setSensorData(data || {});
    });

    socket.on("recent watering rec", (data) => {
      setRecentDate(new Date(data));
    });

    return () => {
      socket.off("sensor data");
      socket.off("recent watering rec");
    };
  }, [socket]);

  const temperatureChartData = [
    {
      ranges: [0, 15, 17, 23, 25, 28, 40],
      measures: [sensorData.temperature ?? 0],
      markers: [24],
    },
  ];

  const humidityChartData = [
    {
      ranges: [0, 40, 65, 80, 100],
      measures: [sensorData.humidity ?? 0],
      markers: [55],
    },
  ];

  return {
    sensorData,
    recentDate,
    temperatureChartData,
    humidityChartData,
  };
};

export type { SensorData };
export default useSensorStatus;
