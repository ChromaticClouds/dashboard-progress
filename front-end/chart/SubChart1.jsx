import React, { useEffect, useState, useRef } from "react";
import { Doughnut } from 'react-chartjs-2';
import io from "socket.io-client";

import {
    Chart as ChartJS,
    ArcElement,
    LinearScale,
    Title,
    Tooltip,
    Legend
} from "chart.js";
  
ChartJS.register(ArcElement, LinearScale, Title, Tooltip, Legend);

const TempSub = () => {
    const [socket, set_socket] = useState(null);
    const [temperature, set_temperature] = useState([]);

    useEffect(() => {
        const ws = io.connect("http://localhost:5100");
        set_socket(ws);

        ws.on("temperature sub chart rec", (value) => {
            set_temperature(value[0]);
        })

        return () => {
            ws.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit("temperature sub chart req");

            const timer = setInterval(() => {
                socket.emit("temperature sub chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    const inner_temp = temperature.map(data => data.inner_temp);

    const color = inner_temp >= 15 && inner_temp <= 28 
                    ? "#55ed95" 
                : inner_temp >= 5 && inner_temp <= 35 
                    ? "#ffb44a" 
                : "#ff4a4a"

    const data = {
        datasets: [
            {
                data: [inner_temp, 100 - inner_temp],
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

export default TempSub;