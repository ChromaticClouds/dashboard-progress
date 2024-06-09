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

const HumidSub = () => {
    const [socket, set_socket] = useState(null);
    const [humidity, set_humidity] = useState([]);

    useEffect(() => {
        const ws = io.connect("http://localhost:5100");
        set_socket(ws);

        ws.on("humidity sub chart rec", (value) => {
            set_humidity(value[0]);
        })

        return () => {
            ws.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit("humidity sub chart req");

            const timer = setInterval(() => {
                socket.emit("humidity sub chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    const inner_humid = humidity.map(data => data.inner_humid);

    const color = inner_humid >= 60 && inner_humid <= 80 
                    ? "#55ed95" 
                : inner_humid >= 50 && inner_humid <= 90
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