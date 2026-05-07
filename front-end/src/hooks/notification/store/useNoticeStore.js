import { create } from 'zustand';

const useNoticeStore = create((set) => ({
    loading: false,
    notifications: [],
    popup: [],
    setNotifications: (notifications) => set({ notifications }),
    addAlarm: (newAlarm) => {
        set((state) => ({
            popup: [...state.popup, newAlarm]
        }));
        setTimeout(() => {
            set((state) => ({
                popup: state.popup.filter(alarm => alarm._id !== newAlarm._id)
            }));
        }, 5000);
    },
    setLoading: (state) => set({ loading: state })
}));

export default useNoticeStore;
