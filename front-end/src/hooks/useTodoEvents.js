import createAxiosInstance from '../utils/axiosInstance';
import moment from 'moment';
import { useState } from "react";

const useTodoEvents = () => {
    const axiosInstance = createAxiosInstance(); 

    const [todos, setTodos] = useState([]);
    const [todosLoading, setTodosLoading] = useState(false);

    const getTodayTodos = async () => {
        setTodosLoading(true);

        try {
            const startDate = moment().startOf('day');
            const endDate = moment().startOf('day');

            const response = await axiosInstance.get('/calendar/month', {
                params: {
                    startDate,
                    endDate,
                },
            });

            setTodos(response.data); // 받아온 데이터를 todos에 저장
        } catch (error) {
            // 호출하는 쪽이 에러를 받지 않으므로 여기서 남기고, 로딩은 finally에서 끝낸다.
            console.error('오늘 일정을 불러오지 못했습니다.', error);
        } finally {
            setTodosLoading(false);
        }
    };

    return { todos, getTodayTodos, todosLoading };
};

export default useTodoEvents;
