import { create } from 'zustand';

const useClickStore = create((set) => ({
    isOpened: false,
    setIsOpened: (state) => {
        set({ isOpened: state })
    },
    initialClick: false,
    setInitialClick: (state) => {
        set({ initialClick: state })
    },
    gptHosted: false,
    setGptHosted: (state) => set({ gptHosted: state })
}));

export default useClickStore;