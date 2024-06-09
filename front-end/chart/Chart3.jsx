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

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);

const WaterSupply = () => {
    const [socket, set_socket] = useState(null);
    const [water_supply, set_water_supply] = useState([]);

    useEffect(() => {
        const ws = io.connect("http://localhost:5100");
        set_socket(ws);

        ws.on("water supply chart rec", (value) => {
            set_water_supply(value[0])
        });

        return () => {
            ws.disconnect();
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.emit("water supply chart req");

            const timer = setInterval(() => {
                socket.emit("water supply chart req");
            }, 2000);

            return () => {
                clearInterval(timer);
            }
        }
    }, [socket]);

    const get_gradient = (ctx, chartArea) => {
        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, '#97e6e6');
        gradient.addColorStop(1, '#4d85bd');
        return gradient;
    };

    const data = useMemo(() => {
        const times = water_supply.map(data => data.day);
        const labels = times.map(time => {
            const date = new Date(time);
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${month}/${day}`;
        });

        return {
            labels: labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Supplied Times',
                    data: water_supply.map(data => data.water_supply_count),
                    maxBarThickness: 30,
                    borderSkipped: false,
                    borderRadius: 6,
                    backgroundColor: (context) => {
                        const chart = context.chart;
                        const {ctx, chartArea} = chart;
    
                        if (!chartArea) {
                            return null;
                        }
                        return get_gradient(ctx, chartArea);
                    },
                    order: 1,
                    yAxisID: 'count'
                },
                {
                    type: 'line',
                    borderWidth: 3,
                    pointStyle: false,
                    label: 'Supplied Amount',
                    data: water_supply.map(data => data.water_supply_amount),
                    backgroundColor: '#334352',
                    borderColor: '#334352',
                    fill: true,
                    order: 0,
                    tension: 0.3,
                    yAxisID: 'amount'
                },
            ],
        };
    }, [water_supply]);


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
                text: `Water Supply`,
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
                        return `Date: ${context[0].label}`;
                    },
                    label: function(context) {
                        let label = ` ${context.dataset.label}` || '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (context.dataset.label == "Supplied Amount") {
                                label += `${context.parsed.y}`;
                            }
                            else {
                                label += `${context.parsed.y} Times`
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
            count: {
                position: 'right',
                beginAtZero: true,
                max: 10,
                ticks: {
                    stepSize: 1,
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
            amount: {
                position: 'left',
                beginAtZero: true,
                ticks: {
                    font: {
                        family: "GSR",
                        size: 14,
                    },
                    stepSize: 50,
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

export default WaterSupply;