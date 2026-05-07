import { useState } from "react";
import useNoticeStore from "./store/useNoticeStore";
import createAxiosInstance from "../../utils/axiosInstance";

const useNoticeEvents = () => {
    const { setNotifications, addAlarm, setLoading } = useNoticeStore();

    const [error, setError] = useState(null);

    const axiosInstance = createAxiosInstance();

    /**
     * 알림 목록을 가져오는 함수
     */
    const getNotification = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/notification');
            
            setNotifications(response.data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    
    /**
     * 새로운 알림을 생성하는 함수
     * @param {Object} notification - message, type 등의 프로퍼티가 포함됨
     */
    const postNotification = async (notification) => {
        try {
            setLoading(true);
            const response = await axiosInstance.post('/notification', { notification });
            addAlarm(response.data);

            await getNotification();
        } catch (error) {
            setError(error);
        }
    };

    /**
     * 읽지 않은 알림을 갱신하는 함수
     */
    const updateNotification = async () => {
        try {
            setLoading(true);
            await axiosInstance.put('/notification');
            await getNotification();
        } catch (error) {
            console.error("Error updating notifications:", error);
        }
    };

    /**
     * 모든 알림을 삭제하는 함수
     */
    const deleteNotification = async () => {
        try {
            setLoading(true);
            await axiosInstance.delete('/notification');
            await getNotification();
        } catch (error) {
            setError(error);
        }
    };

    return {
        getNotification,
        postNotification,
        updateNotification,
        deleteNotification,
        alarmError: error,
    };
};

export default useNoticeEvents;
