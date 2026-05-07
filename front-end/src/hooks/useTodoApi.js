import createAxiosInstance from "../utils/axiosInstance";
import { useState } from "react";

const useTodoApi = () => {
    const axiosInstance = createAxiosInstance(); 

    const [loading, setLoading] = useState(false);

    const createTodo = async (todoData) => {
        try {
            const response = await axiosInstance.post('/calendar', {
                todoData
            });

            return response.data;
        } catch (error) {
            throw error;
        }
    }

    const getTodo = async (date) => {
        setLoading(true);

        try {
            const response = await axiosInstance.get('/calendar', {
                params: {
                    startDate: new Date(date.year, date.month - 1, date.day),
                    endDate: new Date(date.year, date.month - 1, date.day)
                }
            });

            setLoading(false);

            return response.data;
        } catch (error) {
            return null;
        }
    }

    return { loading, createTodo, getTodo }
}

export default useTodoApi;