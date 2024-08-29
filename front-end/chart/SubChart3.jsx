import React, { useEffect, useState, useRef } from "react";
import { Doughnut } from 'react-chartjs-2';
import useSocket from "../src/hooks/socket/useSocket";

import {
    Chart as ChartJS,
    ArcElement,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from "chart.js";
  
ChartJS.register(ArcElement, LinearScale, Title, Tooltip, Legend);

const HumidSub = () => {
    const [humidity, set_humidity] = useState([]);

    const { socket, receivedData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'humidity sub chart rec'
    );

    useEffect(() => {
        if (socket) {
            const timer = setInterval(() => {
                socket.emit('humidity sub chart req');
            }, 2000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (receivedData) {
            set_humidity(receivedData[0]);
        }
    }, [receivedData]);

    const inner_humid = humidity.map(data => data.inner_humid);

    const color = inner_humid >= 60 && inner_humid <= 80 
                    ? "#55ed95" 
                : inner_humid >= 40 && inner_humid <= 90
                    ? "#ffb44a"
                : "#ff4a4a"

    const data = {
        datasets: [
            {
                data: [inner_humid, 100 - inner_humid],
                backgroundColor: [color, "#ededed"],
                borderWidth: 0,
                borderRadius: 30,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            tooltip: {
                enabled: false,
            },
        },
    }

    return (
        <Doughnut
            data = { data }
            options = { options }
        />
    )
}

export default HumidSub;