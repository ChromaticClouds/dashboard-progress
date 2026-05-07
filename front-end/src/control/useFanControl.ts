import { MouseEvent, useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/socket-provider";

const getNumberFromLocalStorage = (key: string, fallback: number): number => {
  const saved = localStorage.getItem(key);
  return saved !== null ? Number(saved) : fallback;
};

const useFanControl = (enabled: boolean) => {
  const socket = useSocket();
  const [sliderX, setSliderX] = useState(() => {
    const saved = localStorage.getItem("slider_x");
    return saved !== null ? Number(saved) : 0;
  });
  const [sliderX2, setSliderX2] = useState(() => {
    const saved = localStorage.getItem("slider_x2");
    return saved !== null ? Number(saved) : 0;
  });
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialMouseX2, setInitialMouseX2] = useState(0);
  const [initialSliderX, setInitialSliderX] = useState(0);
  const [initialSliderX2, setInitialSliderX2] = useState(0);
  const [heaterOperate, setHeaterOperate] = useState(() => {
    const saved = localStorage.getItem("heater-power");
    return saved === "true";
  });
  const [coolerOperate, setCoolerOperate] = useState(() => {
    const saved = localStorage.getItem("cooler-power");
    return saved === "true";
  });
  const [isDraggingHeat, setIsDraggingHeat] = useState(false);
  const [isDraggingCool, setIsDraggingCool] = useState(false);

  const computeDesiredHeat = useCallback(() => {
    const tempRangeStart = 15;
    const tempRange = 20;
    return (sliderX / 240) * tempRange + tempRangeStart;
  }, [sliderX]);

  const computeDesiredCool = useCallback(() => {
    const tempRangeStart = 15;
    const tempRange = 12;
    return (sliderX2 / 240) * tempRange + tempRangeStart;
  }, [sliderX2]);

  const startDragHeat = (event: MouseEvent<HTMLDivElement>) => {
    setIsDraggingHeat(true);
    setInitialMouseX(event.clientX);
    setInitialSliderX(sliderX);
  };

  const startDragCool = (event: MouseEvent<HTMLDivElement>) => {
    setIsDraggingCool(true);
    setInitialMouseX2(event.clientX);
    setInitialSliderX2(sliderX2);
  };

  const stopDrag = () => {
    setIsDraggingHeat(false);
    setIsDraggingCool(false);
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (isDraggingHeat) {
      const dragAmount = event.clientX - initialMouseX;
      const targetX = initialSliderX + dragAmount;
      setSliderX(Math.max(Math.min(targetX, 240), 0));
    }
    if (isDraggingCool) {
      const dragAmount = event.clientX - initialMouseX2;
      const targetX = initialSliderX2 + dragAmount;
      setSliderX2(Math.max(Math.min(targetX, 240), 0));
    }
  };

  useEffect(() => {
    if (enabled) {
      setHeaterOperate(true);
      setCoolerOperate(true);
    } else {
      setHeaterOperate(false);
      setCoolerOperate(false);
    }
  }, [enabled]);

  useEffect(() => {
    localStorage.setItem("slider_x", String(sliderX));
  }, [sliderX]);

  useEffect(() => {
    localStorage.setItem("slider_x2", String(sliderX2));
  }, [sliderX2]);

  useEffect(() => {
    localStorage.setItem("heater-power", String(heaterOperate));
  }, [heaterOperate]);

  useEffect(() => {
    localStorage.setItem("cooler-power", String(coolerOperate));
  }, [coolerOperate]);

  const toggleHeaterPower = useCallback(() => {
    setHeaterOperate((prev) => {
      const next = !prev;
      socket.emit("heater power req", next);
      return next;
    });
  }, [socket]);

  const toggleCoolerPower = useCallback(() => {
    setCoolerOperate((prev) => {
      const next = !prev;
      socket.emit("cooler power req", next);
      return next;
    });
  }, [socket]);

  const heatElementStyle = (tempNumber: number) => {
    const nearDistance = 3;
    const liftDistance = 12;
    const diff = Math.abs(computeDesiredHeat() - tempNumber);
    const distY = diff / nearDistance - 1;
    const elementY = Math.min(distY * liftDistance, 0);
    return `translate3d(0, ${elementY}px, 0)`;
  };

  const coolElementStyle = (tempNumber: number) => {
    const nearDistance = 3;
    const liftDistance = 12;
    const diff = Math.abs(computeDesiredCool() - tempNumber);
    const distY = diff / nearDistance - 1;
    const elementY = Math.min(distY * liftDistance, 0);
    return `translate3d(0, ${elementY}px, 0)`;
  };

  const heatDisc = [15, 20, 25, 30, 35];
  const coolDisc = [15, 18, 21, 24, 27];

  return {
    sliderX,
    sliderX2,
    startDragHeat,
    startDragCool,
    stopDrag,
    handleMouseMove,
    desiredHeat: computeDesiredHeat,
    desiredCool: computeDesiredCool,
    heatElementStyle,
    coolElementStyle,
    heaterOperate,
    coolerOperate,
    toggleHeaterPower,
    toggleCoolerPower,
    heatDisc,
    coolDisc,
  };
};

export default useFanControl;
