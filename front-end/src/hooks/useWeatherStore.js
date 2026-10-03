import { create } from "zustand";

const useWeatherStore = create((set) => ({
    currentWeather: {},
    weatherData: [],
    weatherIcon: null,
    // 단기예보 조회가 실패했는지. Now 카드가 로딩 대신 안내 문구를 보여줄 때 쓴다.
    weatherError: false,
    setCurrentWeather: (forecast) => {
        set({ currentWeather: forecast});
    },
    setWeatherData: (forecast) => {
        set({ weatherData: forecast });
    },
    setWeatherIcon: (icon) => {
        set({ weatherIcon: icon });
    },
    setWeatherError: (failed) => {
        set({ weatherError: failed });
    }
}));

export default useWeatherStore;