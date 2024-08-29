import { create } from "zustand";

const useOutlierStore = create((set) => ({
    outlier: [],
    setOutlier: (received) => {
        set({ outlier: received });
    }
}));

export default useOutlierStore;