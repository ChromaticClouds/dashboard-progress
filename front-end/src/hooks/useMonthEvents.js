import { create } from 'zustand';
import createAxiosInstance from '../utils/axiosInstance';

const axiosInstance = createAxiosInstance();

const useMonthEventStore = create((set) => ({
    events: [],
    loading: false,
    error: null,
    getMonthEvents: async (year, month) => {
        set({ loading: true, error: null });
        try {
            const startDate = new Date(year + 100, month, 1);
            const endDate = new Date(year - 100, month + 1, 0);

            const response = await axiosInstance.get('/calendar/month', {
                params: {
                    startDate,
                    endDate
                },
            });

            set({ events: response.data, loading: false });
        } catch (error) {
            set({ error: error.response ? error.response.data : 'Error fetching events' });
        }
    },
}));

export default useMonthEventStore;
