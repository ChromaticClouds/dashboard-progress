import React, { useEffect, useState, useRef } from "react";
import { Bar } from 'react-chartjs-2';
import io from "socket.io-client";

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

const GrowthChart = () => {
    const [socket, set_socket] = useState(null);
    const [growth, set_growth] = useState([]);
    const chart_ref = useRef(null);

    useEffect(() => {
        const ws = io.connect("http://localhost:5100");
        set_socket(ws);

        ws.on("growth chart rec", (value) => {
            set_growth(value[0]);
        })

        return () => {
            ws.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit("growth chart req");

            const timer = setInterval(() => {
                socket.emit("growth chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    const get_gradient = (ctx, chartArea) => {
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, '#ffe0c7');
        gradient.addColorStop(1, '#f79e9e');
        return gradient;
    };

    const data = {
        labels: ['tomato1', 'tomato2', 'tomato3'],
        datasets: [
            {
                maxBarThickness: 40,
                borderSkipped: false,
                borderRadius: 8,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;

                    if (!chartArea) {
                        return null;
                    }
                    return get_gradient(ctx, chartArea);
                },
                data: growth.map(data => data.growth_amount > 0 ? data.growth_amount : 0),
            }
        ]
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: `Growth Amount`,
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
                        return `Growth Amount: ${ context.parsed.y }`;
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
                    callback: function(val, index) {
                        // Hide every 2nd tick label
                        return index % 2 == 0 ? this.getLabelForValue(val) : '';
                    },
                    font: {
                        family: "GSR",
                        size: 14,
                    },
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

export default GrowthChart;