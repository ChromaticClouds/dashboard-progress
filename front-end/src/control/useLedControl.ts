import { ChangeEvent, useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";

const getNumberFromLocalStorage = (key: string, fallback: number): number => {
  const saved = localStorage.getItem(key);
  return saved !== null ? Number(saved) : fallback;
};

const useLedControl = (enabled: boolean) => {
  const socket = useSocket();
  const [sliderValues, setSliderValues] = useState<number[]>(() => [
    getNumberFromLocalStorage("slider-data1", 0),
    getNumberFromLocalStorage("slider-data2", 0),
    getNumberFromLocalStorage("slider-data3", 0),
  ]);
  const [showSliderValues, setShowSliderValues] = useState<boolean[]>([
    false,
    false,
    false,
  ]);

  const handleSliderChange =
    (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(event.target.value);
      setSliderValues((prev) => {
        const next = [...prev];
        next[index] = newValue;
        return next;
      });
      setShowSliderValues((prev) => {
        const next = [...prev];
        next[index] = true;
        return next;
      });
      localStorage.setItem(`slider-data${index + 1}`, String(newValue));
    };

  const handleSliderBlur = (index: number) => () => {
    setShowSliderValues((prev) => {
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      socket.emit("led value req", sliderValues[0]);
      socket.emit("led value req2", sliderValues[1]);
      socket.emit("led value req3", sliderValues[2]);
    }, 500);

    return () => clearTimeout(timer);
  }, [enabled, sliderValues, socket]);

  return {
    sliderValues,
    showSliderValues,
    handleSliderChange,
    handleSliderBlur,
  };
};

export default useLedControl;
