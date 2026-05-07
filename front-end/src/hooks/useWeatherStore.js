import { create } from "zustand";

const useWeatherStore = create((set) => ({
    currentWeather: {},
    weatherData: [],
    weatherIcon: null,
    setCurrentWeather: (forecast) => {
        set({ currentWeather: forecast});
    },
    setWeatherData: (forecast) => {
        set({ weatherData: forecast });
    },
    setWeatherIcon: (icon) => {
        set({ weatherIcon: icon });
    }
}));

export default useWeatherStore;