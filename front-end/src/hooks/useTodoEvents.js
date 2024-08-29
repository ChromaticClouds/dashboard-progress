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
            setTodosLoading(false);
        } catch (error) {
            throw error;
        }
    };

    return { todos, getTodayTodos, todosLoading };
};

export default useTodoEvents;
