import { create } from "zustand";

interface WeatherStoreType {
  weatherMap: [],
  setWeatherMap: (weather: any) => void
}

export const useWeatherMapStore = create<WeatherStoreType>((set) => ({
  weatherMap: [],
  setWeatherMap: (weather) => set({ weatherMap: weather })
}));