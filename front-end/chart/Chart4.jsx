import React, { useEffect, useState, useRef } from "react";
import { Bar } from 'react-chartjs-2';
import useSocket from "../src/hooks/socket/useSocket";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
  
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, Title, Tooltip, Legend);

const SoilHumidChart = () => {
    const [soil_humid, set_soil_humid] = useState([]);
    const chart_ref = useRef(null);

    const { socket, receivedData } = useSocket(
        import.meta.env.VITE_SOCKET_URL,
        'soil humidity chart rec'
    );

    useEffect(() => {
        if (socket) {
            const timer = setInterval(() => {
                socket.emit('soil humidity chart req');
            }, 2000);

            return () => {
                clearInterval(timer);
            };
        }
    }, [socket]);

    useEffect(() => {
        if (receivedData) {
            set_soil_humid(receivedData[0]);
        }
    }, [receivedData]);

    const get_gradient = (ctx, chartArea) => {
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, '#5cb3db');
        gradient.addColorStop(1, '#453f6b');
        return gradient;
    };

    const data = {
        labels: ['tomato1', 'tomato2', 'tomato3'],
        datasets: [
            {
                maxBarThickness: 40,
                borderSkipped: false,
                borderRadius: {
                    topLeft: 8,
                    topRight: 8,
                    bottomLeft: 8,
                    bottomRight: 8,
                },
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;

                    if (!chartArea) {
                        return null;
                    }
                    return get_gradient(ctx, chartArea);
                },
                data: soil_humid.map(data => data.soil_humid > 0 ? data.soil_humid : 0),
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `Soil Humidity`,
                font: {
                    family: "GSR",
                    size: 20,
                    weight: 600,
                },
                align: 'start',
                padding: {
                    bottom: 60,
                }
            },
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                mode: 'nearest',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `Soil Humidity: ${ context.parsed.y }%`;
                    },
                },
                titleFont: {
                    family: "GSR",
                    size: 14,
                },
                bodyFont: {
                    family: "GSR",
                    size: 12,
                },
                padding: 10,
            },
        },
        scales: {
            x: {
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                    padding: 10,
                },
                weight: 1,
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
                    stepSize: 20
                },
                beginAtZero: true,
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            }
        }
    };

    return (
        <Bar
            ref = { chart_ref }
            data = { data } 
            options = { options }
        />
    )
}

export default SoilHumidChart;