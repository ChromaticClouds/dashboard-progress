import React, { useEffect, useState, useRef } from "react";
import { Line } from 'react-chartjs-2';
import useSocket from "../src/hooks/socket/useSocket";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
  
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BrightnessChart = () => {
    const [brightness, set_brightness] = useState([]);

    const { socket, receivedData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'brightness chart rec'
    )

    useEffect(() => {
        if (socket) {
            const timer = setInterval(() => {
                socket.emit('brightness chart req');
            }, 2000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (receivedData) {
            set_brightness(receivedData[0]);
        }
    }, [receivedData]);

    const times = brightness.map(data => data.timestamp);
    const labels = times.map(time => {
        const date = new Date(time);
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${hour}:${minute}`;
    });

    useEffect(() => {
        if (socket) {
            socket.emit("brightness chart req");

            const timer = setInterval(() => {
                socket.emit("brightness chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    const data = {
        labels: labels,
        datasets: [
            {
                data: brightness.map(data => data.brightness),
                tension: 0.3,
                pointStyle: false,
                fill: "origin",
                backgroundColor: '#f7efd4cc',
                borderColor: '#ffc494',
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'nearest',
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                },
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            },
            y: {
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                    stepSize: 40,
                    padding: 5,
                },
                beginAtZero: true,
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            },
        },
        plugins: {
            title: {
                display: true,
                text: `Brightness`,
                font: {
                    family: "GSR",
                    size: 20,
                    weight: 600,
                },
                align: 'start',
                padding: {
                    bottom: 30,
                }
            },
            tooltip: {
                callbacks: {
                    title: function(context) {
                        return `Time: ${context[0].label}`;
                    },
                },
            },
            legend: {
                display: false,
            },
        },
    }

    return (
        <Line 
            data = { data }
            options = { options }
            plugins = { [Filler] }
        />
    )
}

export default BrightnessChart;