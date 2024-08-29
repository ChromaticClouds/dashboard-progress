import { create } from 'zustand';

const useAuthStore = create((set) => ({
    username: localStorage.getItem('username') || null,
    accessToken: localStorage.getItem('accessToken') || null,
    setUsername: (name) => {
        localStorage.setItem('username', name);
        set({ username: name });
    },
    setAccessToken: (token) => {
        localStorage.setItem('accessToken', token);
        set({ accessToken: token });
    },
    removeAccessToken: () => {
        localStorage.removeItem('accessToken');
        set({ accessToken: null });
    }
}));

export default useAuthStore;