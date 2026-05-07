import { create } from "zustand";

const useCalendarEvents = create((set) => ({
    date: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate(),
        week: new Date().getDay()
    },
    visible: false,
    status: [],
    currentDate: {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        string_month: new Date().toLocaleString('en-GB', { month: 'long' })
    },
    setDate: (state) => {
        set({ date: state });
    },
    setVisible: (state) => {
        set({ visible: state});
    },
    setStatus: (state) => {
        set({ status: state });
    },
    setCurrentDate: (state) => {
        set({ currentDate: state });
    }
}));

export default useCalendarEvents;