import { useState, useEffect } from "react";
import { io } from 'socket.io-client';
import moment from "moment";

const OpenAI = ({ leavesStatus, tomatoesStatus }) => {
    const [data, setData] = useState({ leaves: {}, tomatoes: {}, sensorData: {} });
    const [gptResponse, setGptResponse] = useState(null);

    useEffect(() => {
        const socketIo = io("http://localhost:5000");

        const hostSensorData = (sensorData) => {
            setData(prevData => ({
                ...prevData,
                sensorData,
            }));
        };

        socketIo.on('sensor data', hostSensorData);

        return () => {
            socketIo.off('sensor data', hostSensorData);
            socketIo.disconnect();
        };
    }, []);

    const isNonEmptyObject = (obj) => obj !== undefined && obj !== null && Object.keys(obj).length > 0;

    useEffect(() => {
        if (isNonEmptyObject(leavesStatus) || isNonEmptyObject(tomatoesStatus)) {
            setData(prevData => ({
                ...prevData,
                leaves: leavesStatus || prevData.leaves,
                tomatoes: tomatoesStatus || prevData.tomatoes,
            }));
        }
    }, [leavesStatus, tomatoesStatus]);

    const sendData = () => {
        const socketIo = io("http://localhost:5000");

        socketIo.emit('gpt question', data);

        socketIo.on('gpt answer', (response) => {
            setGptResponse(response.choices[0].message.content);
            socketIo.disconnect();
        });
    };

    useEffect(() => {
        if (gptResponse != null) {
            console.log(gptResponse);
        }
    }, [gptResponse]);

    return null;
};

export default OpenAI;
