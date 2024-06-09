import React, { useEffect, useState, useMemo } from "react";
import { Chart } from 'react-chartjs-2';
import io from "socket.io-client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    BarElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";
import GrowthChart from "./Chart1";
import plugin from "chartjs-plugin-datalabels";
  
ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);

const THChart = () => {
    const [socket, set_socket] = useState(null);
    const [temp_and_humid, set_temp_and_humid] = useState([]);

    useEffect(() => {
        const ws = io.connect("http://localhost:5100");
        set_socket(ws);

        ws.on("temp and humid chart rec", (value) => {
            set_temp_and_humid(value[0])
        });

        return () => {
            ws.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit("temp and humid chart req");

            const timer = setInterval(() => {
                socket.emit("temp and humid chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    const data = useMemo(() => {
        const times = temp_and_humid.map(data => data.timestamp);
        const labels = times.map(time => {
            const date = new Date(time);
            const hour = String(date.getHours()).padStart(2, '0');
            const minute = String(date.getMinutes()).padStart(2, '0');
            return `${hour}:${minute}`;
        });

        return {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Temperature',
                    data: temp_and_humid.map(data => data.inner_temp),
                    maxBarThickness: 30,
                    borderSkipped: false,
                    borderRadius: 6,
                    backgroundColor: '#536982',
                    order: 1,
                    yAxisID: 'temperature'
                },
                {
                    type: 'line',
                    borderWidth: 3,
                    pointStyle: false,
                    label: 'Humidity',
                    data: temp_and_humid.map(data => data.inner_humid),
                    backgroundColor: '#2b354a',
                    borderColor: '#2b354a',
                    fill: true,
                    order: 0,
                    tension: 0.3,
                    yAxisID: 'humidity'
                },
            ],
        };
    }, [temp_and_humid]);


    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false
        },
        plugins: {
            title: {
                display: true,
                text: `Temperature and Humidity`,
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
            legend: {
                labels: {
                    boxWidth: 20,
                    boxHeight: 20,
                    useBorderRadius: true,
                    borderRadius: 5,
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                },
                fullSize: false,
                display: true,
                position: 'top',
                align: 'center',
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                callbacks: {
                    title: function(context) {
                        return `Time: ${context[0].label}`;
                    },
                    label: function(context) {
                        let label = ` ${context.dataset.label}` || '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (context.dataset.label == "Temperature") {
                                label += `${context.parsed.y}°`;
                            }
                            else {
                                label += `${context.parsed.y}%`
                            }
                        }
                        return label;
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
                },
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            },
            temperature: {
                position: 'right',
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                    callback: function(val, index) {
                        return index % 2 == 0 ? this.getLabelForValue(val) : '';
                    },
                },
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            },
            humidity: {
                position: 'left',
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                    callback: function(val, index) {
                        return index % 2 == 0 ? this.getLabelForValue(val) : '';
                    },
                },
                border: {
                    display: false,
                },
                grid: {
                    display: false
                },
            },
        },
    }

    return (
        <Chart
            data = { data }
            options = { options }
        />
    )
}

export default THChart;