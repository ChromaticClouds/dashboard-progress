import { create } from "zustand";

interface WeatherStoreProps {
  currentWeather: Record<string, any>,
  weatherData: Array<any>
  weatherIcon: string | null,
  setCurrentWeather: (forecast: any) => void;
  setWeatherData: (forecast: any) => void;
  setWeatherIcon: (icon: any) => void;
}

export const useWeatherStore = create<WeatherStoreProps>((set) => ({
  currentWeather: {},
  weatherData: [],
  weatherIcon: null,
  setCurrentWeather: (forecast) => { set({ currentWeather: forecast }); },
  setWeatherData: (forecast) => { set({ weatherData: forecast }); },
  setWeatherIcon: (icon) => { set({ weatherIcon: icon }); },
}));
