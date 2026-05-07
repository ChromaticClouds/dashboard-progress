// stores/useCookieStore.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useCookieStore = create(devtools((set) => ({
    refreshToken: null,
    setRefreshToken: (token) => {
        const today = new Date();
        const expireDate = today.setDate(today.getDate() + 7);

        document.cookie = `refresh_token=${token}; path=/; expires=${new Date(expireDate).toUTCString()}; secure; SameSite=Strict`;
        set({ refreshToken: token });
    },
    getRefreshToken: () => {
        const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            const [name, value] = cookie.split('=');
            acc[name] = value;
            return acc;
        }, {});

        return cookies['refresh_token'] || null;
    },
    removeRefreshToken: () => {
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Strict';
        set({ refreshToken: null });
    }
})));

export default useCookieStore;